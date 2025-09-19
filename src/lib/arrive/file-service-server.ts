import { ArriveComponentData, ArriveAdvanceData, arriveGenerator } from './arrive-generator';
import fs from 'fs';
import path from 'path';

/**
 * Server-side file service for ARRIVE YAML files
 * This runs only on the server and handles filesystem operations
 */
export class ArriveFileServiceServer {
  /**
   * Generate and save ARRIVE YAML files for a component
   */
  static async generateArriveFiles(
    componentData: ArriveComponentData, 
    isEnabled: boolean = true
  ): Promise<{ 
    arriveYamlPath: string; 
    advancesYamlPath: string; 
    success: boolean; 
    error?: string 
  }> {
    try {
      // Check if ARRIVE generation is enabled
      if (!isEnabled) {
        return {
          arriveYamlPath: '',
          advancesYamlPath: '',
          success: false,
          error: 'ARRIVE generation is disabled in settings'
        };
      }

      // Generate default advances for the component
      const advances = arriveGenerator.generateDefaultAdvances(componentData);
      
      // Generate YAML content
      const arriveYaml = arriveGenerator.generateArriveYaml(componentData);
      const advancesYaml = arriveGenerator.generateAdvancesYaml(componentData, advances);
      
      // Generate file paths
      const arriveYamlPath = arriveGenerator.generateFilePath(componentData, 'arrive');
      const advancesYamlPath = arriveGenerator.generateFilePath(componentData, 'advances');
      
      // Write files to filesystem
      console.log('🎯 ARRIVE YAML Generation:', {
        componentId: componentData.id,
        title: componentData.title,
        arriveYamlPath,
        advancesYamlPath,
        arriveYamlLength: arriveYaml.length,
        advancesYamlLength: advancesYaml.length,
        advancesCount: advances.length
      });

      // Write actual files to filesystem
      await this.writeFileToSystem(arriveYamlPath, arriveYaml);
      await this.writeFileToSystem(advancesYamlPath, advancesYaml);

      return {
        arriveYamlPath,
        advancesYamlPath,
        success: true
      };
    } catch (error) {
      console.error('❌ Error generating ARRIVE files:', error);
      return {
        arriveYamlPath: '',
        advancesYamlPath: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate ARRIVE files for multiple components (bulk operation)
   */
  static async generateBulkArriveFiles(
    components: ArriveComponentData[], 
    isEnabled: boolean = true
  ): Promise<{
    results: Array<{ componentId: string; success: boolean; error?: string; paths?: { arrive: string; advances: string } }>;
    overallSuccess: boolean;
  }> {
    const results = [];
    let successCount = 0;

    for (const component of components) {
      const result = await this.generateArriveFiles(component, isEnabled);
      
      results.push({
        componentId: component.id,
        success: result.success,
        error: result.error,
        paths: result.success ? {
          arrive: result.arriveYamlPath,
          advances: result.advancesYamlPath
        } : undefined
      });

      if (result.success) successCount++;
    }

    return {
      results,
      overallSuccess: successCount === components.length
    };
  }

  /**
   * Convert various work item types to ARRIVE component data
   */
  static convertWorkItemToArriveData(
    workItem: any, 
    workflowLevel: 'initiative' | 'feature' | 'epic' | 'story'
  ): ArriveComponentData {
    return {
      id: workItem.id,
      title: workItem.title,
      description: workItem.description || '',
      businessValue: workItem.businessValue,
      acceptanceCriteria: Array.isArray(workItem.acceptanceCriteria) 
        ? workItem.acceptanceCriteria 
        : workItem.acceptanceCriteria 
          ? JSON.parse(workItem.acceptanceCriteria) 
          : [],
      priority: workItem.priority || 'medium',
      assignedTo: workItem.assignedTo || workItem.assignee,
      category: workItem.category,
      workflowLevel
    };
  }

  /**
   * Write ARRIVE YAML content to actual filesystem
   */
  private static async writeFileToSystem(relativePath: string, content: string): Promise<void> {
    try {
      // Get the project root directory
      const projectRoot = process.cwd();
      const fullPath = path.join(projectRoot, relativePath);
      
      // Ensure directory exists
      const dir = path.dirname(fullPath);
      await fs.promises.mkdir(dir, { recursive: true });
      
      // Write the file
      await fs.promises.writeFile(fullPath, content, 'utf8');
      
      console.log(`📁 Written ARRIVE file: ${fullPath}`);
    } catch (error) {
      console.error(`❌ Failed to write ARRIVE file ${relativePath}:`, error);
      throw error;
    }
  }

  /**
   * Read ARRIVE file from filesystem
   */
  static async readFileFromSystem(relativePath: string): Promise<string | null> {
    try {
      const projectRoot = process.cwd();
      const fullPath = path.join(projectRoot, relativePath);
      
      if (await this.fileExists(fullPath)) {
        const content = await fs.promises.readFile(fullPath, 'utf8');
        return content;
      }
      return null;
    } catch (error) {
      console.error(`❌ Failed to read ARRIVE file ${relativePath}:`, error);
      return null;
    }
  }

  /**
   * List all physical ARRIVE files
   */
  static async listPhysicalFiles(): Promise<string[]> {
    try {
      const projectRoot = process.cwd();
      const arriveBasePath = path.join(projectRoot, 'arrive-yaml');
      
      if (!(await this.fileExists(arriveBasePath))) {
        return [];
      }

      const files: string[] = [];
      await this.walkDirectory(arriveBasePath, projectRoot, files);
      return files.sort();
    } catch (error) {
      console.error('❌ Failed to list physical ARRIVE files:', error);
      return [];
    }
  }

  /**
   * Check if file exists
   */
  private static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Recursively walk directory to find ARRIVE files
   */
  private static async walkDirectory(dir: string, rootPath: string, files: string[]): Promise<void> {
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await this.walkDirectory(fullPath, rootPath, files);
        } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
          // Convert to relative path from project root
          const relativePath = path.relative(rootPath, fullPath).replace(/\\/g, '/');
          files.push(relativePath);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to walk directory ${dir}:`, error);
    }
  }

  /**
   * Clear all physical ARRIVE files
   */
  static async clearPhysicalFiles(): Promise<void> {
    try {
      const projectRoot = process.cwd();
      const arriveBasePath = path.join(projectRoot, 'arrive-yaml');
      
      if (await this.fileExists(arriveBasePath)) {
        await fs.promises.rm(arriveBasePath, { recursive: true, force: true });
        console.log(`🗑️ Cleared all physical ARRIVE files from ${arriveBasePath}`);
      }
    } catch (error) {
      console.error('❌ Failed to clear physical ARRIVE files:', error);
      throw error;
    }
  }
}

export default ArriveFileServiceServer;
