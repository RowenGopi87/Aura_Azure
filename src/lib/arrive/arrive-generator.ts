import { useSettingsStore } from '@/store/settings-store';

export interface ArriveComponentData {
  id: string;
  title: string;
  description: string;
  businessValue?: string;
  acceptanceCriteria?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  category?: string;
  workflowLevel: 'initiative' | 'feature' | 'epic' | 'story';
}

export interface ArriveAdvanceData {
  id: string;
  name: string;
  description: string;
  componentId: string;
  effortDays: number;
  estimatedLoc: number;
  acceptanceCriteria: string[];
  dependencies?: string[];
  touches?: string[];
}

export class ArriveYamlGenerator {
  private getSettings() {
    return useSettingsStore.getState().arriveSettings;
  }

  /**
   * Generate arrive.yaml content for a component
   */
  generateArriveYaml(data: ArriveComponentData): string {
    const componentName = this.sanitizeComponentName(data.title);
    const componentType = this.determineComponentType(data);
    const currentDate = new Date().toISOString();
    
    return `name:
  - ${componentName}
stage: incubator
version: 0.1.0
entered_stage: ${currentDate}
metadata:
  description: '${data.description || 'Component generated from ' + data.workflowLevel}'
  type: ${componentType}
  jira_card: '${data.id}'
  pair_devs:
    - '${data.assignedTo || '@developer1'}'
    - '@developer2'
component_card:
  summary: '${this.generateSummary(data)}'
  context: '${data.businessValue || 'Business value to be determined'}'
  interface: null
  success_criteria:
    incubator:
      - Unit test coverage > 80%
      - Basic functionality working
      - Interface design documented
    candidate:
      - Integration tests passing
      - Performance < 50ms
      - Security review complete
      - Concept review approved
    resident:
      - Zero high/medium SAST findings
      - Documentation complete
      - Load tested at scale
      - Monitoring configured
component_advances:
  active_advances: []
  next_advances: []
dependencies: null
security_review_required: null
metrics:
  coverage: 0
  loc: 0
  complexity: 0
  test_count: 0
  build_time_seconds: 0
  bundle_size_kb: 0
ai_usage:
  prompts_used: 0
  acceptance_rate: 0
  primary_tool: 'cursor'
checklist_status:
  incubator:
    unit_tests: false
    interface_design: false
    security_review: pending
  candidate:
    integration_tests: false
    performance_validated: false
    documentation_complete: false
    concept_review_approved: false
  resident:
    zero_sast_high: false
    monitoring_configured: false
    load_tested: false
    handover_complete: false
active_work:
  advance_id: null
  developers: []
  started_at: null
notes: |
  # TODO before promotion:
  # - [ ] Replace implementation stubs
  # - [ ] Add sequence diagram to docs
  # - [ ] Review error handling
  # - [ ] ${this.generateTodoItems(data).join('\n  # - [ ] ')}
promotion_history: null
`;
  }

  /**
   * Generate advances.yaml content for a component's tasks
   */
  generateAdvancesYaml(componentData: ArriveComponentData, advances: ArriveAdvanceData[]): string {
    const componentName = this.sanitizeComponentName(componentData.title);
    const totalEffort = advances.reduce((sum, adv) => sum + adv.effortDays, 0);
    const totalLoc = advances.reduce((sum, adv) => sum + adv.estimatedLoc, 0);
    
    const advancesSection = advances.map(advance => `  - id: ${advance.id}
    name: "${advance.name}"
    component: ${componentName}
    effort_days: ${advance.effortDays}
    estimated_loc: ${advance.estimatedLoc}
    dependencies: ${advance.dependencies ? JSON.stringify(advance.dependencies) : '[]'}
    description: |
      ${advance.description}
    touches:
      ${advance.touches ? advance.touches.map(t => `- ${t}`).join('\n      ') : '- src/'}
    acceptance_criteria:
      ${advance.acceptanceCriteria.map(ac => `- "${ac}"`).join('\n      ')}`).join('\n\n');

    return `# Component Advances Configuration
# ------------------------------------------------------------------
# For components that benefit from smaller, incremental advances
# rather than isolated component boundaries
# ------------------------------------------------------------------

tool: ${componentName}  # Name of the parent tool/system
methodology: "Component Advances"

# When to use Component Advances:
# - Components are tightly integrated (e.g., CLI + server)
# - End-to-end features span multiple components
# - Single team owns all components
# - Testing requires multiple components together

advances:
${advancesSection}

# Summary helps with planning and tracking
summary:
  total_advances: ${advances.length}
  total_effort_days: ${totalEffort}
  total_estimated_loc: ${totalLoc}
  critical_path: [${advances.filter(a => a.dependencies && a.dependencies.length > 0).map(a => a.id).join(', ')}]
  parallel_tracks:
    - name: "Main Track"
      advances: [${advances.map(a => a.id).join(', ')}]

# Guidelines for creating advances:
# 1. Each advance should be 3-5 days of work
# 2. Keep LOC under 500 per advance
# 3. Clear dependencies help with scheduling
# 4. Acceptance criteria must be testable
# 5. Group related advances into tracks

# Integration with arrive.yaml:
# - Update arrive.yaml's active_advances when starting
# - Move completed advances to next_advances
# - Use advance IDs in commit messages
# - Track work attribution by advance
`;
  }

  /**
   * Generate default advances for a component based on its type and acceptance criteria
   */
  generateDefaultAdvances(componentData: ArriveComponentData): ArriveAdvanceData[] {
    const advances: ArriveAdvanceData[] = [];
    const componentName = this.sanitizeComponentName(componentData.title);
    
    // Generate basic advances based on component type
    const baseAdvanceId = `ADV-${componentData.id.split('-')[1] || '001'}`;
    
    advances.push({
      id: `${baseAdvanceId}-001`,
      name: 'Setup and Foundation',
      description: `Set up the basic structure and foundation for ${componentData.title}:\n- Project structure\n- Basic configuration\n- Initial tests`,
      componentId: componentData.id,
      effortDays: 1,
      estimatedLoc: 100,
      acceptanceCriteria: [
        'Project structure created',
        'Basic configuration in place',
        'Initial test framework setup'
      ],
      touches: ['src/', 'tests/']
    });

    advances.push({
      id: `${baseAdvanceId}-002`,
      name: 'Core Implementation',
      description: `Implement the core functionality for ${componentData.title}:\n- Main business logic\n- Core features\n- Error handling`,
      componentId: componentData.id,
      effortDays: this.getSettings().defaultEffortDays - 1,
      estimatedLoc: this.getSettings().defaultEstimatedLoc,
      acceptanceCriteria: componentData.acceptanceCriteria || [
        'Core functionality implemented',
        'Error handling in place',
        'Unit tests passing'
      ],
      dependencies: [`${baseAdvanceId}-001`],
      touches: ['src/']
    });

    if (componentData.acceptanceCriteria && componentData.acceptanceCriteria.length > 2) {
      advances.push({
        id: `${baseAdvanceId}-003`,
        name: 'Integration and Polish',
        description: `Complete integration and polish for ${componentData.title}:\n- Integration testing\n- Documentation\n- Performance optimization`,
        componentId: componentData.id,
        effortDays: 1,
        estimatedLoc: 50,
        acceptanceCriteria: [
          'Integration tests passing',
          'Documentation complete',
          'Performance meets requirements'
        ],
        dependencies: [`${baseAdvanceId}-002`],
        touches: ['src/', 'docs/', 'tests/']
      });
    }

    return advances;
  }

  /**
   * Generate file path for component YAML files
   */
  generateFilePath(componentData: ArriveComponentData, fileType: 'arrive' | 'advances'): string {
    const componentName = this.sanitizeComponentName(componentData.title);
    const basePath = this.getSettings().outputPath || 'arrive-yaml';
    return `${basePath}/${componentName}/${fileType}.yaml`;
  }

  /**
   * Check if ARRIVE generation is enabled
   */
  isEnabled(): boolean {
    return useSettingsStore.getState().isArriveEnabled();
  }

  /**
   * Utility methods
   */
  private sanitizeComponentName(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private determineComponentType(data: ArriveComponentData): 'frontend' | 'backend' | 'integration' {
    const title = data.title.toLowerCase();
    const description = (data.description || '').toLowerCase();
    const category = (data.category || '').toLowerCase();
    
    if (title.includes('ui') || title.includes('frontend') || title.includes('interface') || 
        description.includes('ui') || description.includes('frontend') || category.includes('frontend')) {
      return 'frontend';
    }
    
    if (title.includes('api') || title.includes('backend') || title.includes('server') ||
        description.includes('api') || description.includes('backend') || category.includes('backend')) {
      return 'backend';
    }
    
    if (title.includes('integration') || description.includes('integration') || 
        category.includes('integration')) {
      return 'integration';
    }
    
    return this.getSettings().defaultComponentType || 'backend';
  }

  private generateSummary(data: ArriveComponentData): string {
    const title = data.title;
    // Try to create a verb-noun phrase
    if (title.toLowerCase().startsWith('create') || 
        title.toLowerCase().startsWith('build') || 
        title.toLowerCase().startsWith('implement')) {
      return title;
    }
    
    return `Implement ${title}`;
  }

  private generateTodoItems(data: ArriveComponentData): string[] {
    const todos = [];
    
    if (data.acceptanceCriteria && data.acceptanceCriteria.length > 0) {
      todos.push('Validate all acceptance criteria');
    }
    
    if (data.businessValue) {
      todos.push('Measure business value impact');
    }
    
    todos.push('Update component documentation');
    todos.push('Review code quality metrics');
    
    return todos;
  }
}

export const arriveGenerator = new ArriveYamlGenerator();
