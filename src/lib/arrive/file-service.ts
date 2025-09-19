import { ArriveComponentData, ArriveAdvanceData, arriveGenerator } from './arrive-generator';

export class ArriveFileService {
  /**
   * Generate and save ARRIVE YAML files for a component
   */
  static async generateArriveFiles(componentData: ArriveComponentData): Promise<{ 
    arriveYamlPath: string; 
    advancesYamlPath: string; 
    success: boolean; 
    error?: string 
  }> {
    try {
      // Check if ARRIVE generation is enabled
      if (!arriveGenerator.isEnabled()) {
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
      
      // Generate files via API call to server
      console.log('🎯 ARRIVE YAML Generation (Client):', {
        componentId: componentData.id,
        title: componentData.title,
        arriveYamlPath,
        advancesYamlPath,
        arriveYamlLength: arriveYaml.length,
        advancesYamlLength: advancesYaml.length,
        advancesCount: advances.length
      });

      // Call server API to write files
      try {
        const isEnabled = arriveGenerator.isEnabled();
        console.log('🎯 Client-side ARRIVE enabled check:', isEnabled);
        
        const response = await fetch('/api/arrive/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            componentData,
            isEnabled 
          })
        });
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to generate ARRIVE files on server');
        }
      } catch (apiError) {
        console.warn('⚠️ Server-side file generation failed, using localStorage only:', apiError);
      }

      // Store in localStorage for UI viewing
      this.storeGeneratedContent(arriveYamlPath, arriveYaml);
      this.storeGeneratedContent(advancesYamlPath, advancesYaml);

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
  static async generateBulkArriveFiles(components: ArriveComponentData[]): Promise<{
    results: Array<{ componentId: string; success: boolean; error?: string; paths?: { arrive: string; advances: string } }>;
    overallSuccess: boolean;
  }> {
    const results = [];
    let successCount = 0;

    // Check if ARRIVE is enabled once for all components
    const isEnabled = arriveGenerator.isEnabled();

    for (const component of components) {
      const result = await this.generateArriveFiles(component);
      
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

  // Filesystem operations moved to server-side API

  /**
   * Simulate storing content (in a real app, this would write to filesystem)
   */
  private static storeGeneratedContent(filePath: string, content: string): void {
    // In a browser environment, we can't directly write files
    // This would typically be handled by a backend API or electron app
    
    // For demonstration, we'll store in localStorage with a prefix
    const key = `arrive-yaml:${filePath}`;
    try {
      localStorage.setItem(key, content);
      console.log(`📁 Stored ARRIVE content: ${filePath} (${content.length} chars)`);
    } catch (error) {
      console.warn('⚠️ Could not store ARRIVE content in localStorage:', error);
    }
  }

  /**
   * Retrieve stored ARRIVE content (for demonstration)
   */
  static getStoredContent(filePath: string): string | null {
    const key = `arrive-yaml:${filePath}`;
    return localStorage.getItem(key);
  }

  /**
   * List all stored ARRIVE files
   */
  static listStoredFiles(): string[] {
    const files = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('arrive-yaml:')) {
        files.push(key.replace('arrive-yaml:', ''));
      }
    }
    return files.sort();
  }

  /**
   * Clear all stored ARRIVE files
   */
  static clearStoredFiles(): void {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('arrive-yaml:')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ Cleared ${keysToRemove.length} ARRIVE files from storage`);
  }

  // Physical file operations moved to server-side API routes
}

export default ArriveFileService;
