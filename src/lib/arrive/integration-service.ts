import { ArriveFileService } from './file-service';

/**
 * Service to handle ARRIVE integration with work item creation
 */
export class ArriveIntegrationService {
  
  /**
   * Generate ARRIVE files for newly created stories
   */
  static async handleStoriesCreated(stories: any[]): Promise<void> {
    if (stories.length === 0) return;
    
    try {
      console.log('🎯 Generating ARRIVE files for stories:', stories.map(s => s.id));
      
      const arriveResults = await ArriveFileService.generateBulkArriveFiles(
        stories.map(story => ArriveFileService.convertWorkItemToArriveData(story, 'story'))
      );
      
      if (arriveResults.overallSuccess) {
        console.log('✅ ARRIVE files generated for all stories');
      } else {
        console.log('⚠️ Some ARRIVE file generation failed:', 
          arriveResults.results.filter(r => !r.success).map(r => r.error)
        );
      }
    } catch (error) {
      console.warn('⚠️ ARRIVE generation failed for stories (non-blocking):', error);
    }
  }

  /**
   * Generate ARRIVE files for newly created epics
   */
  static async handleEpicsCreated(epics: any[]): Promise<void> {
    if (epics.length === 0) return;
    
    try {
      console.log('🎯 Generating ARRIVE files for epics:', epics.map(e => e.id));
      
      const arriveResults = await ArriveFileService.generateBulkArriveFiles(
        epics.map(epic => ArriveFileService.convertWorkItemToArriveData(epic, 'epic'))
      );
      
      if (arriveResults.overallSuccess) {
        console.log('✅ ARRIVE files generated for all epics');
      } else {
        console.log('⚠️ Some ARRIVE file generation failed:', 
          arriveResults.results.filter(r => !r.success).map(r => r.error)
        );
      }
    } catch (error) {
      console.warn('⚠️ ARRIVE generation failed for epics (non-blocking):', error);
    }
  }

  /**
   * Generate ARRIVE files for newly created features
   */
  static async handleFeaturesCreated(features: any[]): Promise<void> {
    if (features.length === 0) return;
    
    try {
      console.log('🎯 Generating ARRIVE files for features:', features.map(f => f.id));
      
      const arriveResults = await ArriveFileService.generateBulkArriveFiles(
        features.map(feature => ArriveFileService.convertWorkItemToArriveData(feature, 'feature'))
      );
      
      if (arriveResults.overallSuccess) {
        console.log('✅ ARRIVE files generated for all features');
      } else {
        console.log('⚠️ Some ARRIVE file generation failed:', 
          arriveResults.results.filter(r => !r.success).map(r => r.error)
        );
      }
    } catch (error) {
      console.warn('⚠️ ARRIVE generation failed for features (non-blocking):', error);
    }
  }

  /**
   * Generate ARRIVE files for a newly created initiative
   */
  static async handleInitiativeCreated(initiative: any): Promise<void> {
    if (!initiative) return;
    
    try {
      console.log('🎯 Generating ARRIVE files for initiative:', initiative.id);
      
      const arriveData = ArriveFileService.convertWorkItemToArriveData(initiative, 'initiative');
      const arriveResult = await ArriveFileService.generateArriveFiles(arriveData);
      
      if (arriveResult.success) {
        console.log('✅ ARRIVE files generated for initiative');
      } else {
        console.log('⚠️ ARRIVE file generation failed:', arriveResult.error);
      }
    } catch (error) {
      console.warn('⚠️ ARRIVE generation failed for initiative (non-blocking):', error);
    }
  }

  /**
   * Trigger ARRIVE generation for work items after a delay (to ensure store updates are complete)
   */
  static triggerDelayedGeneration(
    type: 'stories' | 'epics' | 'features' | 'initiative',
    workItems: any | any[],
    delayMs: number = 100
  ): void {
    setTimeout(async () => {
      switch (type) {
        case 'stories':
          await this.handleStoriesCreated(Array.isArray(workItems) ? workItems : [workItems]);
          break;
        case 'epics':
          await this.handleEpicsCreated(Array.isArray(workItems) ? workItems : [workItems]);
          break;
        case 'features':
          await this.handleFeaturesCreated(Array.isArray(workItems) ? workItems : [workItems]);
          break;
        case 'initiative':
          await this.handleInitiativeCreated(workItems);
          break;
      }
    }, delayMs);
  }
}

export default ArriveIntegrationService;
