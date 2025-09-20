import { EmiratesUser } from '@/store/auth-store';

export interface UserPermission {
  userId: string;
  userName: string;
  email: string;
  roleName: string;
  roleDisplayName: string;
  moduleName: string;
  moduleDisplayName: string;
  routePath: string;
  canAccess: boolean;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canAdmin: boolean;
}

export interface RoleInfo {
  id: string;
  name: string;
  displayName: string;
  description: string;
  organizationalLevel: string;
  department: string;
  isActive: boolean;
}

export interface ModuleInfo {
  id: string;
  name: string;
  displayName: string;
  description: string;
  routePath: string;
  icon: string;
  moduleOrder: number;
  isActive: boolean;
}

class RBACService {
  private userPermissions: Map<string, UserPermission[]> = new Map();
  private roleCache: Map<string, RoleInfo> = new Map();
  private moduleCache: Map<string, ModuleInfo> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Load user permissions from API
  async loadUserPermissions(userId: string): Promise<UserPermission[]> {
    // Check cache first
    const cacheKey = `permissions_${userId}`;
    const cacheTime = this.cacheExpiry.get(cacheKey);
    
    if (cacheTime && Date.now() < cacheTime && this.userPermissions.has(userId)) {
      return this.userPermissions.get(userId) || [];
    }

    try {
      // In a real implementation, this would call your API
      // For now, we'll mock the data based on the user
      const mockPermissions = await this.getMockUserPermissions(userId);
      
      this.userPermissions.set(userId, mockPermissions);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);
      
      return mockPermissions;
    } catch (error) {
      console.error('Failed to load user permissions:', error);
      return [];
    }
  }

  // Check if user has access to a specific module
  async hasModuleAccess(user: EmiratesUser, moduleName: string): Promise<boolean> {
    const permissions = await this.loadUserPermissions(user.id);
    const modulePermission = permissions.find(p => p.moduleName === moduleName);
    return modulePermission?.canAccess || false;
  }

  // Check if user has specific permission type for a module
  async hasPermission(
    user: EmiratesUser, 
    moduleName: string, 
    permissionType: 'read' | 'write' | 'delete' | 'admin'
  ): Promise<boolean> {
    const permissions = await this.loadUserPermissions(user.id);
    const modulePermission = permissions.find(p => p.moduleName === moduleName);
    
    if (!modulePermission?.canAccess) return false;
    
    switch (permissionType) {
      case 'read': return modulePermission.canRead;
      case 'write': return modulePermission.canWrite;
      case 'delete': return modulePermission.canDelete;
      case 'admin': return modulePermission.canAdmin;
      default: return false;
    }
  }

  // Get all accessible modules for a user
  async getAccessibleModules(user: EmiratesUser): Promise<ModuleInfo[]> {
    const permissions = await this.loadUserPermissions(user.id);
    const accessibleModules: ModuleInfo[] = [];
    
    for (const permission of permissions) {
      if (permission.canAccess) {
        const moduleInfo = await this.getModuleInfo(permission.moduleName);
        if (moduleInfo && moduleInfo.isActive) {
          accessibleModules.push(moduleInfo);
        }
      }
    }
    
    // Sort by module order
    return accessibleModules.sort((a, b) => a.moduleOrder - b.moduleOrder);
  }

  // Get user's roles
  async getUserRoles(user: EmiratesUser): Promise<RoleInfo[]> {
    const permissions = await this.loadUserPermissions(user.id);
    const roleNames = [...new Set(permissions.map(p => p.roleName))];
    const roles: RoleInfo[] = [];
    
    for (const roleName of roleNames) {
      const roleInfo = await this.getRoleInfo(roleName);
      if (roleInfo) {
        roles.push(roleInfo);
      }
    }
    
    return roles;
  }

  // Check if user is admin
  async isAdmin(user: EmiratesUser): Promise<boolean> {
    // Check if user has admin role in their roles array
    return user.roles?.includes('system_administrator') || 
           user.roles?.includes('admin') ||
           user.roles?.includes('evp') ||
           user.roles?.includes('svp') ||
           user.roles?.includes('vp') ||
           false;
  }

  // Check if user has portfolio level access
  async isPortfolioLevel(user: EmiratesUser): Promise<boolean> {
    const roles = await this.getUserRoles(user);
    return roles.some(role => role.organizationalLevel === 'portfolio');
  }

  // Clear cache for a user
  clearUserCache(userId: string): void {
    this.userPermissions.delete(userId);
    this.cacheExpiry.delete(`permissions_${userId}`);
  }

  // Clear all caches
  clearAllCaches(): void {
    this.userPermissions.clear();
    this.roleCache.clear();
    this.moduleCache.clear();
    this.cacheExpiry.clear();
  }

  // Private methods
  private async getMockUserPermissions(userId: string): Promise<UserPermission[]> {
    // This would typically fetch from your database
    // For now, we'll return comprehensive mock data based on known users
    
    // Mock data - in real implementation, this would come from the database
    const mockUsers: { [key: string]: UserPermission[] } = {
      // Rowen Gopi - System Administrator (full access) - Using actual DB ID
      'c09ee620-95b4-11f0-b1e6-60ff9e34b8d1': [
        { userId, userName: 'Rowen Gopi', email: 'rowen.gopi@emirates.com', roleName: 'system_administrator', roleDisplayName: 'System Administrator', moduleName: 'ideas', moduleDisplayName: 'Ideas', routePath: '/v1/use-cases', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: true },
        { userId, userName: 'Rowen Gopi', email: 'rowen.gopi@emirates.com', roleName: 'system_administrator', roleDisplayName: 'System Administrator', moduleName: 'work_items', moduleDisplayName: 'Work Items', routePath: '/v1/requirements', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: true },
        { userId, userName: 'Rowen Gopi', email: 'rowen.gopi@emirates.com', roleName: 'system_administrator', roleDisplayName: 'System Administrator', moduleName: 'design', moduleDisplayName: 'Design', routePath: '/v1/design', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: true },
        { userId, userName: 'Rowen Gopi', email: 'rowen.gopi@emirates.com', roleName: 'system_administrator', roleDisplayName: 'System Administrator', moduleName: 'code', moduleDisplayName: 'Code', routePath: '/v1/code', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: true },
        { userId, userName: 'Rowen Gopi', email: 'rowen.gopi@emirates.com', roleName: 'system_administrator', roleDisplayName: 'System Administrator', moduleName: 'test_cases', moduleDisplayName: 'Test Cases', routePath: '/v1/test-cases', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: true },
        { userId, userName: 'Rowen Gopi', email: 'rowen.gopi@emirates.com', roleName: 'system_administrator', roleDisplayName: 'System Administrator', moduleName: 'execution', moduleDisplayName: 'Execution', routePath: '/v1/execution', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: true },
        { userId, userName: 'Rowen Gopi', email: 'rowen.gopi@emirates.com', roleName: 'system_administrator', roleDisplayName: 'System Administrator', moduleName: 'defects', moduleDisplayName: 'Defects', routePath: '/v1/defects', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: true },
        { userId, userName: 'Rowen Gopi', email: 'rowen.gopi@emirates.com', roleName: 'system_administrator', roleDisplayName: 'System Administrator', moduleName: 'traceability', moduleDisplayName: 'Traceability', routePath: '/v1/traceability', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: true },
        { userId, userName: 'Rowen Gopi', email: 'rowen.gopi@emirates.com', roleName: 'system_administrator', roleDisplayName: 'System Administrator', moduleName: 'dashboard', moduleDisplayName: 'Dashboard', routePath: '/v1/dashboard', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: true }
      ],
      
      // Sarah Ahmed - Technical Product Manager - Using actual DB ID
      'e814ff13-95b5-11f0-b1e6-60ff9e34b8d1': [
        { userId, userName: 'Sarah Ahmed', email: 'sarah.ahmed@emirates.com', roleName: 'technical_product_manager', roleDisplayName: 'Technical Product Manager', moduleName: 'ideas', moduleDisplayName: 'Ideas', routePath: '/v1/use-cases', canAccess: true, canRead: true, canWrite: true, canDelete: false, canAdmin: false },
        { userId, userName: 'Sarah Ahmed', email: 'sarah.ahmed@emirates.com', roleName: 'technical_product_manager', roleDisplayName: 'Technical Product Manager', moduleName: 'work_items', moduleDisplayName: 'Work Items', routePath: '/v1/requirements', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false },
        { userId, userName: 'Sarah Ahmed', email: 'sarah.ahmed@emirates.com', roleName: 'technical_product_manager', roleDisplayName: 'Technical Product Manager', moduleName: 'design', moduleDisplayName: 'Design', routePath: '/v1/design', canAccess: true, canRead: true, canWrite: true, canDelete: false, canAdmin: false },
        { userId, userName: 'Sarah Ahmed', email: 'sarah.ahmed@emirates.com', roleName: 'technical_product_manager', roleDisplayName: 'Technical Product Manager', moduleName: 'code', moduleDisplayName: 'Code', routePath: '/v1/code', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Sarah Ahmed', email: 'sarah.ahmed@emirates.com', roleName: 'technical_product_manager', roleDisplayName: 'Technical Product Manager', moduleName: 'test_cases', moduleDisplayName: 'Test Cases', routePath: '/v1/test-cases', canAccess: true, canRead: true, canWrite: true, canDelete: false, canAdmin: false },
        { userId, userName: 'Sarah Ahmed', email: 'sarah.ahmed@emirates.com', roleName: 'technical_product_manager', roleDisplayName: 'Technical Product Manager', moduleName: 'execution', moduleDisplayName: 'Execution', routePath: '/v1/execution', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Sarah Ahmed', email: 'sarah.ahmed@emirates.com', roleName: 'technical_product_manager', roleDisplayName: 'Technical Product Manager', moduleName: 'defects', moduleDisplayName: 'Defects', routePath: '/v1/defects', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Sarah Ahmed', email: 'sarah.ahmed@emirates.com', roleName: 'technical_product_manager', roleDisplayName: 'Technical Product Manager', moduleName: 'traceability', moduleDisplayName: 'Traceability', routePath: '/v1/traceability', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Sarah Ahmed', email: 'sarah.ahmed@emirates.com', roleName: 'technical_product_manager', roleDisplayName: 'Technical Product Manager', moduleName: 'dashboard', moduleDisplayName: 'Dashboard', routePath: '/v1/dashboard', canAccess: true, canRead: true, canWrite: false, canDelete: false, canAdmin: false }
      ],
      
      // Mohammed Hassan - Manager of Product and Delivery (Portfolio level - full access) - Using actual DB ID
      'e8150390-95b5-11f0-b1e6-60ff9e34b8d1': [
        { userId, userName: 'Mohammed Hassan', email: 'mohammed.hassan@emirates.com', roleName: 'manager_product_delivery', roleDisplayName: 'Manager of Product and Delivery', moduleName: 'ideas', moduleDisplayName: 'Ideas', routePath: '/v1/use-cases', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false },
        { userId, userName: 'Mohammed Hassan', email: 'mohammed.hassan@emirates.com', roleName: 'manager_product_delivery', roleDisplayName: 'Manager of Product and Delivery', moduleName: 'work_items', moduleDisplayName: 'Work Items', routePath: '/v1/requirements', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false },
        { userId, userName: 'Mohammed Hassan', email: 'mohammed.hassan@emirates.com', roleName: 'manager_product_delivery', roleDisplayName: 'Manager of Product and Delivery', moduleName: 'design', moduleDisplayName: 'Design', routePath: '/v1/design', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false },
        { userId, userName: 'Mohammed Hassan', email: 'mohammed.hassan@emirates.com', roleName: 'manager_product_delivery', roleDisplayName: 'Manager of Product and Delivery', moduleName: 'code', moduleDisplayName: 'Code', routePath: '/v1/code', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false },
        { userId, userName: 'Mohammed Hassan', email: 'mohammed.hassan@emirates.com', roleName: 'manager_product_delivery', roleDisplayName: 'Manager of Product and Delivery', moduleName: 'test_cases', moduleDisplayName: 'Test Cases', routePath: '/v1/test-cases', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false },
        { userId, userName: 'Mohammed Hassan', email: 'mohammed.hassan@emirates.com', roleName: 'manager_product_delivery', roleDisplayName: 'Manager of Product and Delivery', moduleName: 'execution', moduleDisplayName: 'Execution', routePath: '/v1/execution', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false },
        { userId, userName: 'Mohammed Hassan', email: 'mohammed.hassan@emirates.com', roleName: 'manager_product_delivery', roleDisplayName: 'Manager of Product and Delivery', moduleName: 'defects', moduleDisplayName: 'Defects', routePath: '/v1/defects', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false },
        { userId, userName: 'Mohammed Hassan', email: 'mohammed.hassan@emirates.com', roleName: 'manager_product_delivery', roleDisplayName: 'Manager of Product and Delivery', moduleName: 'traceability', moduleDisplayName: 'Traceability', routePath: '/v1/traceability', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false },
        { userId, userName: 'Mohammed Hassan', email: 'mohammed.hassan@emirates.com', roleName: 'manager_product_delivery', roleDisplayName: 'Manager of Product and Delivery', moduleName: 'dashboard', moduleDisplayName: 'Dashboard', routePath: '/v1/dashboard', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false }
      ],
      
      // Fatima Ali - Principal Software Engineer - Using actual DB ID
      'e815054b-95b5-11f0-b1e6-60ff9e34b8d1': [
        { userId, userName: 'Fatima Ali', email: 'fatima.ali@emirates.com', roleName: 'principal_software_engineer', roleDisplayName: 'Principal Software Engineer', moduleName: 'ideas', moduleDisplayName: 'Ideas', routePath: '/v1/use-cases', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Fatima Ali', email: 'fatima.ali@emirates.com', roleName: 'principal_software_engineer', roleDisplayName: 'Principal Software Engineer', moduleName: 'work_items', moduleDisplayName: 'Work Items', routePath: '/v1/requirements', canAccess: true, canRead: true, canWrite: true, canDelete: false, canAdmin: false },
        { userId, userName: 'Fatima Ali', email: 'fatima.ali@emirates.com', roleName: 'principal_software_engineer', roleDisplayName: 'Principal Software Engineer', moduleName: 'design', moduleDisplayName: 'Design', routePath: '/v1/design', canAccess: true, canRead: true, canWrite: true, canDelete: false, canAdmin: false },
        { userId, userName: 'Fatima Ali', email: 'fatima.ali@emirates.com', roleName: 'principal_software_engineer', roleDisplayName: 'Principal Software Engineer', moduleName: 'code', moduleDisplayName: 'Code', routePath: '/v1/code', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false },
        { userId, userName: 'Fatima Ali', email: 'fatima.ali@emirates.com', roleName: 'principal_software_engineer', roleDisplayName: 'Principal Software Engineer', moduleName: 'test_cases', moduleDisplayName: 'Test Cases', routePath: '/v1/test-cases', canAccess: true, canRead: true, canWrite: true, canDelete: false, canAdmin: false },
        { userId, userName: 'Fatima Ali', email: 'fatima.ali@emirates.com', roleName: 'principal_software_engineer', roleDisplayName: 'Principal Software Engineer', moduleName: 'execution', moduleDisplayName: 'Execution', routePath: '/v1/execution', canAccess: true, canRead: true, canWrite: true, canDelete: false, canAdmin: false },
        { userId, userName: 'Fatima Ali', email: 'fatima.ali@emirates.com', roleName: 'principal_software_engineer', roleDisplayName: 'Principal Software Engineer', moduleName: 'defects', moduleDisplayName: 'Defects', routePath: '/v1/defects', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false },
        { userId, userName: 'Fatima Ali', email: 'fatima.ali@emirates.com', roleName: 'principal_software_engineer', roleDisplayName: 'Principal Software Engineer', moduleName: 'traceability', moduleDisplayName: 'Traceability', routePath: '/v1/traceability', canAccess: true, canRead: true, canWrite: true, canDelete: false, canAdmin: false },
        { userId, userName: 'Fatima Ali', email: 'fatima.ali@emirates.com', roleName: 'principal_software_engineer', roleDisplayName: 'Principal Software Engineer', moduleName: 'dashboard', moduleDisplayName: 'Dashboard', routePath: '/v1/dashboard', canAccess: true, canRead: true, canWrite: false, canDelete: false, canAdmin: false }
      ],
      
      // Layla Omar - Software Developer (limited access) - Using actual DB ID
      'c5a8c998-95b4-11f0-b1e6-60ff9e34b8d1': [
        { userId, userName: 'Layla Omar', email: 'layla.omar@emirates.com', roleName: 'software_developer', roleDisplayName: 'Software Developer', moduleName: 'ideas', moduleDisplayName: 'Ideas', routePath: '/v1/use-cases', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Layla Omar', email: 'layla.omar@emirates.com', roleName: 'software_developer', roleDisplayName: 'Software Developer', moduleName: 'work_items', moduleDisplayName: 'Work Items', routePath: '/v1/requirements', canAccess: true, canRead: true, canWrite: true, canDelete: false, canAdmin: false },
        { userId, userName: 'Layla Omar', email: 'layla.omar@emirates.com', roleName: 'software_developer', roleDisplayName: 'Software Developer', moduleName: 'design', moduleDisplayName: 'Design', routePath: '/v1/design', canAccess: true, canRead: true, canWrite: true, canDelete: false, canAdmin: false },
        { userId, userName: 'Layla Omar', email: 'layla.omar@emirates.com', roleName: 'software_developer', roleDisplayName: 'Software Developer', moduleName: 'code', moduleDisplayName: 'Code', routePath: '/v1/code', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false },
        { userId, userName: 'Layla Omar', email: 'layla.omar@emirates.com', roleName: 'software_developer', roleDisplayName: 'Software Developer', moduleName: 'test_cases', moduleDisplayName: 'Test Cases', routePath: '/v1/test-cases', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Layla Omar', email: 'layla.omar@emirates.com', roleName: 'software_developer', roleDisplayName: 'Software Developer', moduleName: 'execution', moduleDisplayName: 'Execution', routePath: '/v1/execution', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Layla Omar', email: 'layla.omar@emirates.com', roleName: 'software_developer', roleDisplayName: 'Software Developer', moduleName: 'defects', moduleDisplayName: 'Defects', routePath: '/v1/defects', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Layla Omar', email: 'layla.omar@emirates.com', roleName: 'software_developer', roleDisplayName: 'Software Developer', moduleName: 'traceability', moduleDisplayName: 'Traceability', routePath: '/v1/traceability', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Layla Omar', email: 'layla.omar@emirates.com', roleName: 'software_developer', roleDisplayName: 'Software Developer', moduleName: 'dashboard', moduleDisplayName: 'Dashboard', routePath: '/v1/dashboard', canAccess: true, canRead: true, canWrite: false, canDelete: false, canAdmin: false }
      ],
      
      // Ahmad Hassan - Senior Quality Engineer - Using actual DB ID
      'c5a8c77d-95b4-11f0-b1e6-60ff9e34b8d1': [
        { userId, userName: 'Ahmad Hassan', email: 'ahmad.hassan@emirates.com', roleName: 'senior_quality_engineer', roleDisplayName: 'Senior Quality Engineer', moduleName: 'ideas', moduleDisplayName: 'Ideas', routePath: '/v1/use-cases', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Ahmad Hassan', email: 'ahmad.hassan@emirates.com', roleName: 'senior_quality_engineer', roleDisplayName: 'Senior Quality Engineer', moduleName: 'work_items', moduleDisplayName: 'Work Items', routePath: '/v1/requirements', canAccess: true, canRead: true, canWrite: true, canDelete: false, canAdmin: false },
        { userId, userName: 'Ahmad Hassan', email: 'ahmad.hassan@emirates.com', roleName: 'senior_quality_engineer', roleDisplayName: 'Senior Quality Engineer', moduleName: 'design', moduleDisplayName: 'Design', routePath: '/v1/design', canAccess: true, canRead: true, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Ahmad Hassan', email: 'ahmad.hassan@emirates.com', roleName: 'senior_quality_engineer', roleDisplayName: 'Senior Quality Engineer', moduleName: 'code', moduleDisplayName: 'Code', routePath: '/v1/code', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Ahmad Hassan', email: 'ahmad.hassan@emirates.com', roleName: 'senior_quality_engineer', roleDisplayName: 'Senior Quality Engineer', moduleName: 'test_cases', moduleDisplayName: 'Test Cases', routePath: '/v1/test-cases', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false },
        { userId, userName: 'Ahmad Hassan', email: 'ahmad.hassan@emirates.com', roleName: 'senior_quality_engineer', roleDisplayName: 'Senior Quality Engineer', moduleName: 'execution', moduleDisplayName: 'Execution', routePath: '/v1/execution', canAccess: true, canRead: true, canWrite: true, canDelete: false, canAdmin: false },
        { userId, userName: 'Ahmad Hassan', email: 'ahmad.hassan@emirates.com', roleName: 'senior_quality_engineer', roleDisplayName: 'Senior Quality Engineer', moduleName: 'defects', moduleDisplayName: 'Defects', routePath: '/v1/defects', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false },
        { userId, userName: 'Ahmad Hassan', email: 'ahmad.hassan@emirates.com', roleName: 'senior_quality_engineer', roleDisplayName: 'Senior Quality Engineer', moduleName: 'traceability', moduleDisplayName: 'Traceability', routePath: '/v1/traceability', canAccess: true, canRead: true, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Ahmad Hassan', email: 'ahmad.hassan@emirates.com', roleName: 'senior_quality_engineer', roleDisplayName: 'Senior Quality Engineer', moduleName: 'dashboard', moduleDisplayName: 'Dashboard', routePath: '/v1/dashboard', canAccess: true, canRead: true, canWrite: false, canDelete: false, canAdmin: false }
      ],
      
      // Khalid Ali - Technical Product Owner - Using actual DB ID
      'c5a8ca55-95b4-11f0-b1e6-60ff9e34b8d1': [
        { userId, userName: 'Khalid Ali', email: 'khalid.ali@emirates.com', roleName: 'technical_product_owner', roleDisplayName: 'Technical Product Owner', moduleName: 'ideas', moduleDisplayName: 'Ideas', routePath: '/v1/use-cases', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false },
        { userId, userName: 'Khalid Ali', email: 'khalid.ali@emirates.com', roleName: 'technical_product_owner', roleDisplayName: 'Technical Product Owner', moduleName: 'work_items', moduleDisplayName: 'Work Items', routePath: '/v1/requirements', canAccess: true, canRead: true, canWrite: true, canDelete: true, canAdmin: false },
        { userId, userName: 'Khalid Ali', email: 'khalid.ali@emirates.com', roleName: 'technical_product_owner', roleDisplayName: 'Technical Product Owner', moduleName: 'design', moduleDisplayName: 'Design', routePath: '/v1/design', canAccess: true, canRead: true, canWrite: true, canDelete: false, canAdmin: false },
        { userId, userName: 'Khalid Ali', email: 'khalid.ali@emirates.com', roleName: 'technical_product_owner', roleDisplayName: 'Technical Product Owner', moduleName: 'code', moduleDisplayName: 'Code', routePath: '/v1/code', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Khalid Ali', email: 'khalid.ali@emirates.com', roleName: 'technical_product_owner', roleDisplayName: 'Technical Product Owner', moduleName: 'test_cases', moduleDisplayName: 'Test Cases', routePath: '/v1/test-cases', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Khalid Ali', email: 'khalid.ali@emirates.com', roleName: 'technical_product_owner', roleDisplayName: 'Technical Product Owner', moduleName: 'execution', moduleDisplayName: 'Execution', routePath: '/v1/execution', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Khalid Ali', email: 'khalid.ali@emirates.com', roleName: 'technical_product_owner', roleDisplayName: 'Technical Product Owner', moduleName: 'defects', moduleDisplayName: 'Defects', routePath: '/v1/defects', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Khalid Ali', email: 'khalid.ali@emirates.com', roleName: 'technical_product_owner', roleDisplayName: 'Technical Product Owner', moduleName: 'traceability', moduleDisplayName: 'Traceability', routePath: '/v1/traceability', canAccess: false, canRead: false, canWrite: false, canDelete: false, canAdmin: false },
        { userId, userName: 'Khalid Ali', email: 'khalid.ali@emirates.com', roleName: 'technical_product_owner', roleDisplayName: 'Technical Product Owner', moduleName: 'dashboard', moduleDisplayName: 'Dashboard', routePath: '/v1/dashboard', canAccess: true, canRead: true, canWrite: false, canDelete: false, canAdmin: false }
      ]
    };

    return mockUsers[userId] || [];
  }

  private async getRoleInfo(roleName: string): Promise<RoleInfo | null> {
    if (this.roleCache.has(roleName)) {
      return this.roleCache.get(roleName) || null;
    }

    // Mock role info - in real implementation, fetch from database
    const mockRoles: { [key: string]: RoleInfo } = {
      'system_administrator': {
        id: 'admin-role-id',
        name: 'system_administrator',
        displayName: 'System Administrator',
        description: 'Full system administrator access',
        organizationalLevel: 'executive',
        department: 'IT Operations',
        isActive: true
      },
      'software_developer': {
        id: 'dev-role-id',
        name: 'software_developer',
        displayName: 'Software Developer',
        description: 'Team level software developer',
        organizationalLevel: 'team',
        department: 'Software Engineering',
        isActive: true
      }
    };

    const roleInfo = mockRoles[roleName] || null;
    if (roleInfo) {
      this.roleCache.set(roleName, roleInfo);
    }
    
    return roleInfo;
  }

  private async getModuleInfo(moduleName: string): Promise<ModuleInfo | null> {
    if (this.moduleCache.has(moduleName)) {
      return this.moduleCache.get(moduleName) || null;
    }

    // Mock module info - in real implementation, fetch from database
    const mockModules: { [key: string]: ModuleInfo } = {
      'ideas': { id: 'ideas-id', name: 'ideas', displayName: 'Ideas', description: 'Business ideas and use cases', routePath: '/v1/use-cases', icon: 'lightbulb', moduleOrder: 1, isActive: true },
      'work_items': { id: 'work-items-id', name: 'work_items', displayName: 'Work Items', description: 'Requirements and work items management', routePath: '/v1/requirements', icon: 'clipboard-list', moduleOrder: 2, isActive: true },
      'design': { id: 'design-id', name: 'design', displayName: 'Design', description: 'System design and architecture', routePath: '/v1/design', icon: 'palette', moduleOrder: 3, isActive: true },
      'code': { id: 'code-id', name: 'code', displayName: 'Code', description: 'Code generation and management', routePath: '/v1/code', icon: 'code', moduleOrder: 4, isActive: true },
      'test_cases': { id: 'test-cases-id', name: 'test_cases', displayName: 'Test Cases', description: 'Test case management', routePath: '/v1/test-cases', icon: 'test-tube', moduleOrder: 5, isActive: true },
      'execution': { id: 'execution-id', name: 'execution', displayName: 'Execution', description: 'Test execution and results', routePath: '/v1/execution', icon: 'play', moduleOrder: 6, isActive: true },
      'defects': { id: 'defects-id', name: 'defects', displayName: 'Defects', description: 'Defect tracking and management', routePath: '/v1/defects', icon: 'bug', moduleOrder: 7, isActive: true },
      'traceability': { id: 'traceability-id', name: 'traceability', displayName: 'Traceability', description: 'Requirements traceability matrix', routePath: '/v1/traceability', icon: 'git-branch', moduleOrder: 8, isActive: true },
      'dashboard': { id: 'dashboard-id', name: 'dashboard', displayName: 'Dashboard', description: 'Analytics and reporting dashboard', routePath: '/v1/dashboard', icon: 'bar-chart', moduleOrder: 0, isActive: true }
    };

    const moduleInfo = mockModules[moduleName] || null;
    if (moduleInfo) {
      this.moduleCache.set(moduleName, moduleInfo);
    }
    
    return moduleInfo;
  }
}

// Export singleton instance
export const rbacService = new RBACService();
