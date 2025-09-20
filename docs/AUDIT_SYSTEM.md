# 🔍 AURA Audit System Documentation

## Overview

The AURA Audit System is a comprehensive, lightweight tracking solution designed to capture all user interactions with generation features across the platform. It provides detailed analytics on system usage, content value, and user behavior patterns.

## 🎯 Key Features

### **Comprehensive Tracking**
- **All Generation Activities**: Business briefs, initiatives, features, epics, stories, code, design, and test cases
- **Content Lifecycle**: Track from generation → editing → saving/deletion → export/integration
- **User Behavior**: Prompt analytics, keyword usage, edit patterns, and value indicators
- **Integration Usage**: MCP integrations (Jira, Playwright), exports, and third-party tool usage

### **Emirates-Branded Authentication**
- Mock Azure Entra ID integration with realistic organizational user schema
- Role-based access control with department-specific permissions
- Session management with activity tracking

### **Performance Optimized**
- Asynchronous logging with configurable batch processing
- Minimal performance impact on user experience
- Efficient database schema with proper indexing

### **Admin Controls**
- Comprehensive dashboard with real-time analytics
- Feature-level toggle system for granular control
- Configurable retention policies and data management

## 🏗️ Architecture

### **Database Schema**

#### Users Table
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    entra_id VARCHAR(36) UNIQUE NOT NULL,
    user_principal_name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    department VARCHAR(100),
    job_title VARCHAR(255),
    employee_id VARCHAR(50),
    roles JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Audit Events Table
```sql
CREATE TABLE audit_events (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36),
    event_type ENUM('generation', 'edit', 'save', 'delete', 'export', 'integration', 'view', 'search', 'ai_enhancement'),
    feature_category ENUM('brief', 'initiative', 'feature', 'epic', 'story', 'code', 'design', 'test', 'auth', 'system'),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(36),
    resource_title VARCHAR(500),
    
    -- Generation & Content Tracking
    generation_data JSON,
    prompt_data JSON,
    ai_model_used VARCHAR(50),
    generation_time_ms INT,
    
    -- Edit Tracking
    before_content JSON,
    after_content JSON,
    edit_type ENUM('minor', 'major', 'complete_rewrite'),
    fields_changed JSON,
    
    -- Value Indicators
    was_saved BOOLEAN DEFAULT FALSE,
    was_exported BOOLEAN DEFAULT FALSE,
    was_integrated BOOLEAN DEFAULT FALSE,
    integration_target VARCHAR(50),
    
    -- Context & Metadata
    page_url VARCHAR(500),
    metadata JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### **System Components**

#### 1. Authentication Layer (`src/components/auth/`)
- **Emirates Login Component**: Branded SSO-style login interface
- **Auth Store**: Zustand-based user session management
- **Mock Users**: Realistic organizational user profiles

#### 2. Audit Service (`src/lib/audit/`)
- **Core Service**: Event logging, batching, and API communication
- **React Hook**: `useAudit()` for easy component integration
- **Audit Provider**: Automatic page view and activity tracking

#### 3. API Layer (`src/app/api/audit/`)
- **Events Endpoint**: Single event logging
- **Batch Endpoint**: Bulk event processing
- **Prompt Analytics**: Keyword and pattern analysis

#### 4. Admin Dashboard (`src/app/admin/audit/`)
- **Analytics Dashboard**: Real-time metrics and visualizations
- **Settings Panel**: Configuration and feature toggles
- **Data Management**: Export, retention, and cleanup tools

## 📊 Analytics & Metrics

### **Value Metrics**
- **Generations Kept Without Editing**: High-value indicator
- **Generation Edit Frequency**: Quality improvement needs
- **Generation Deletion Rate**: Low-value content identification
- **AI Enhancement Usage**: Feature adoption tracking

### **Content Analysis**
- **Edit Types**: Minor, major, complete rewrites
- **Field-Level Changes**: Specific content modifications
- **Time-to-Save**: User decision patterns
- **Export Patterns**: Integration usage trends

### **Prompt Analytics**
- **Keyword Frequency**: Most used terms and phrases
- **Success Rates**: Keyword effectiveness
- **Complexity Analysis**: Prompt sophistication trends
- **Context Patterns**: Additional context usage

### **User Behavior**
- **Feature Adoption**: Which tools are most valuable
- **Session Patterns**: Usage frequency and duration
- **Integration Preferences**: Preferred export targets
- **Department Usage**: Organizational adoption patterns

## 🚀 Setup Instructions

### 1. Database Setup
```bash
# Run the audit system setup script
./tools/scripts/setup-audit-system.bat

# Or manually execute the SQL
mysql -u aura_user -p aura_playground < tools/database/setup/12-create-audit-system-tables.sql
```

### 2. Mock Users
The system includes pre-configured Emirates users:
- **sarah.ahmed@emirates.com** - Senior Business Analyst
- **mohammed.hassan@emirates.com** - Product Manager  
- **fatima.ali@emirates.com** - Technical Lead
- **admin@emirates.com** - System Administrator

### 3. Configuration
Access audit settings at `/admin/audit/settings` (admin role required):
- Enable/disable audit system
- Configure feature tracking
- Set retention policies
- Manage performance settings

## 💻 Usage Examples

### Basic Generation Tracking
```typescript
import { useAudit } from '@/hooks/use-audit';

function BusinessBriefGenerator() {
  const { trackGeneration } = useAudit();
  
  const handleGenerate = async (prompt: string) => {
    const startTime = Date.now();
    const result = await generateBrief(prompt);
    
    await trackGeneration({
      featureCategory: 'brief',
      action: 'generate_business_brief',
      resourceType: 'business_brief',
      resourceId: result.id,
      resourceTitle: result.title,
      generationData: result,
      promptData: {
        prompt,
        keywords: extractKeywords(prompt)
      },
      aiModelUsed: 'gpt-4',
      startTime
    });
    
    return result;
  };
}
```

### Edit Tracking
```typescript
const { trackEdit } = useAudit();

const handleSave = async (originalData, updatedData) => {
  await trackEdit({
    featureCategory: 'brief',
    action: 'save_changes',
    resourceType: 'business_brief',
    resourceId: updatedData.id,
    resourceTitle: updatedData.title,
    beforeContent: originalData,
    afterContent: updatedData
  });
};
```

### Integration Tracking
```typescript
const { trackExport } = useAudit();

const exportToJira = async (brief) => {
  const result = await createJiraIssue(brief);
  
  await trackExport({
    featureCategory: 'brief',
    resourceType: 'business_brief',
    resourceId: brief.id,
    resourceTitle: brief.title,
    integrationTarget: 'jira',
    metadata: { jiraIssueId: result.id }
  });
};
```

## 📈 Specific Tracking Requirements

### **Brief Generation and Modifications**
- ✅ Initial generation with prompt analysis
- ✅ Field-level edit tracking
- ✅ Save/delete decisions
- ✅ AI enhancement usage
- ✅ Export to Jira/PDF

### **Initiative Creation from Briefs**
- ✅ Brief-to-initiative conversion tracking
- ✅ Data transformation analysis
- ✅ Success rate metrics

### **Features from Initiatives**
- ✅ Initiative-to-feature breakdown
- ✅ Scope refinement tracking
- ✅ Estimation accuracy

### **Epic Generation from Features**
- ✅ Feature-to-epic decomposition
- ✅ Story point estimation
- ✅ Technical complexity analysis

### **Story Creation from Epics**
- ✅ Epic-to-story breakdown
- ✅ Acceptance criteria generation
- ✅ User story quality metrics

### **Code Generation and Reverse Engineering**
- ✅ Code generation prompts and keywords
- ✅ Language-specific analytics
- ✅ Reverse engineering usage
- ✅ Code quality assessments

### **Design Artifact Creation**
- ✅ Design generation prompts
- ✅ Additional keywords used
- ✅ Design reverse engineering
- ✅ Iteration patterns

### **Test Case Generation and Execution**
- ✅ Test generation from requirements
- ✅ MCP Playwright execution tracking
- ✅ Test success/failure rates
- ✅ Automation adoption

## 🔧 Configuration Options

### **Audit Levels**
- **Basic**: Essential events only
- **Detailed**: Comprehensive tracking (recommended)
- **Verbose**: Maximum detail including debug info

### **Performance Settings**
- **Batch Size**: 1-100 events per batch (default: 10)
- **Flush Interval**: 1-60 seconds (default: 5 seconds)
- **Async Logging**: Enabled by default for performance

### **Retention Policy**
- **Default**: 730 days (2 years)
- **Range**: 30 days to 7 years
- **Auto-cleanup**: Configurable archival process

### **Feature Toggles**
Individual tracking can be enabled/disabled for:
- Business Brief Generation ✅
- Initiative Creation ✅
- Feature Generation ✅
- Epic Generation ✅
- Story Creation ✅
- Code Generation ✅
- Design Generation ✅
- Test Case Generation ✅
- Jira Integration ✅
- AI Enhancements ✅

## 🔒 Security & Privacy

### **Data Protection**
- No sensitive business content stored in audit logs
- User identification through secure session tokens
- Configurable data retention with automatic cleanup

### **Access Control**
- Admin-only access to audit dashboards
- Role-based permissions for different views
- Secure API endpoints with authentication

### **Compliance**
- GDPR-compliant data handling
- Audit trail for compliance reporting
- Data export capabilities for regulatory requirements

## 📊 Dashboard Features

### **Real-Time Analytics**
- Live activity monitoring
- User engagement metrics
- Feature adoption rates
- Performance indicators

### **Value Assessment**
- Content quality scores
- User satisfaction metrics
- Feature effectiveness analysis
- ROI indicators

### **Trend Analysis**
- Historical usage patterns
- Seasonal variations
- Growth trajectories
- Adoption curves

### **Export Capabilities**
- CSV/Excel exports for analysis
- PDF reports for presentations
- API access for custom integrations
- Scheduled report generation

## 🚀 Future Enhancements

### **Planned Features**
- Machine learning-based usage prediction
- Automated quality scoring
- Advanced prompt optimization suggestions
- Integration with additional tools (Confluence, Teams, etc.)
- Real-time notifications for admin alerts
- Custom dashboard widgets
- Advanced filtering and search capabilities

### **Performance Optimizations**
- Database query optimization
- Caching layer implementation
- Real-time streaming analytics
- Predictive analytics engine

## 📞 Support

For questions or issues with the audit system:
1. Check the admin dashboard for system status
2. Review configuration settings
3. Examine console logs for client-side issues
4. Contact system administrators for access issues

---

**Note**: This audit system is designed to be lightweight and non-intrusive while providing comprehensive insights into system usage and value. All tracking respects user privacy and focuses on system improvement rather than individual monitoring.
