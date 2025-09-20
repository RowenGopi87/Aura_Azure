"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
// import { Switch } from "@/components/ui/switch"; // Component doesn't exist
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users,
  UserPlus,
  Edit3,
  Save,
  Trash2,
  Shield,
  CheckCircle,
  X,
  Search,
  Filter,
  Download
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

interface User {
  id: string;
  email: string;
  displayName: string;
  jobTitle: string;
  department: string;
  roles: string[];
  isActive: boolean;
  lastLogin: string;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  organizationalLevel: string;
  department: string;
}

interface ModulePermission {
  userId: string;
  userName: string;
  role: string;
  ideas: boolean;
  workItems: boolean;
  design: boolean;
  code: boolean;
  testCases: boolean;
  execution: boolean;
}

const MODULES = [
  { id: 'ideas', name: 'Ideas', description: 'Business ideas and use cases' },
  { id: 'work_items', name: 'Work Items', description: 'Requirements and work items' },
  { id: 'design', name: 'Design', description: 'System design and architecture' },
  { id: 'code', name: 'Code', description: 'Code generation and management' },
  { id: 'test_cases', name: 'Test Cases', description: 'Test case management' },
  { id: 'execution', name: 'Execution', description: 'Test execution and results' }
];

const ROLES = [
  { id: 'evp', name: 'Executive Vice President', level: 'Executive' },
  { id: 'svp', name: 'Senior Vice President', level: 'Executive' },
  { id: 'vp', name: 'Vice President', level: 'Executive' },
  { id: 'manager_product_delivery', name: 'Manager of Product and Delivery', level: 'Portfolio' },
  { id: 'manager_quality_engineering', name: 'Manager of Quality Engineering', level: 'Portfolio' },
  { id: 'technical_product_manager', name: 'Technical Product Manager', level: 'ART' },
  { id: 'principal_software_engineer', name: 'Principal Software Engineer', level: 'ART' },
  { id: 'senior_quality_engineer', name: 'Senior Quality Engineer', level: 'Team' },
  { id: 'software_developer', name: 'Software Developer', level: 'Team' },
  { id: 'technical_product_owner', name: 'Technical Product Owner', level: 'Team' },
  { id: 'system_administrator', name: 'System Administrator', level: 'Executive' }
];

export default function UserManagementPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [modulePermissions, setModulePermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Check if user is admin
  const isAdmin = user?.roles?.includes('system_administrator') || user?.roles?.includes('admin');

  useEffect(() => {
    if (isAdmin) {
      loadUsersAndPermissions();
    }
  }, [isAdmin]);

  const loadUsersAndPermissions = async () => {
    setLoading(true);
    try {
      // Fetch real users and permissions from database
      const response = await fetch('/api/admin/users');
      
      if (response.ok) {
        const data = await response.json();
        
        // Format users data
        const formattedUsers: User[] = data.users.map((user: any) => ({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          jobTitle: user.jobTitle,
          department: user.departmentName || user.department,
          roles: user.roles,
          isActive: user.isActive,
          lastLogin: user.lastLogin || new Date().toISOString()
        }));
        
        // Format permissions data
        const formattedPermissions: ModulePermission[] = data.permissions.map((perm: any) => ({
          userId: perm.userId,
          userName: perm.userName,
          role: perm.roleDisplayName,
          ideas: perm.modules.ideas?.canAccess || false,
          workItems: perm.modules.work_items?.canAccess || false,
          design: perm.modules.design?.canAccess || false,
          code: perm.modules.code?.canAccess || false,
          testCases: perm.modules.test_cases?.canAccess || false,
          execution: perm.modules.execution?.canAccess || false
        }));
        
        setUsers(formattedUsers);
        setModulePermissions(formattedPermissions);
      } else {
        console.error('Failed to fetch users data');
      }
    } catch (error) {
      console.error('Failed to load users and permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleId: newRole })
      });
      
      if (response.ok) {
        // Update local state
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, roles: [newRole] }
            : u
        ));
        
        // Reload permissions to reflect role change
        await loadUsersAndPermissions();
        
        console.log(`Successfully updated user ${userId} to role ${newRole}`);
      } else {
        console.error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const updateModulePermission = async (userId: string, module: string, hasAccess: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          modulePermissions: { [module]: hasAccess }
        })
      });
      
      if (response.ok) {
        // Update local state
        setModulePermissions(prev => prev.map(p => 
          p.userId === userId 
            ? { ...p, [module]: hasAccess }
            : p
        ));
        
        console.log(`Successfully updated ${userId} ${module} permission to ${hasAccess}`);
      } else {
        console.error('Failed to update module permission');
      }
    } catch (error) {
      console.error('Error updating module permission:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need administrator privileges to manage users.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User & Role Management</h1>
          <p className="text-gray-600">Manage user access and role assignments</p>
        </div>
        
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="IT Operations">IT Operations</SelectItem>
                  <SelectItem value="Product and Delivery">Product and Delivery</SelectItem>
                  <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                  <SelectItem value="Quality Engineering">Quality Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="permissions">Module Permissions</TabsTrigger>
          <TabsTrigger value="roles">Role Definitions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage user accounts and role assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-gray-700">User</th>
                      <th className="text-left p-3 font-medium text-gray-700">Department</th>
                      <th className="text-left p-3 font-medium text-gray-700">Current Role</th>
                      <th className="text-left p-3 font-medium text-gray-700">Status</th>
                      <th className="text-left p-3 font-medium text-gray-700">Last Login</th>
                      <th className="text-left p-3 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium text-gray-900">{user.displayName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">{user.jobTitle}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {user.department}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Select
                            value={user.roles[0]}
                            onValueChange={(value) => updateUserRole(user.id, value)}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  <div>
                                    <div className="font-medium">{role.name}</div>
                                    <div className="text-xs text-gray-500">{role.level} Level</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <Badge variant={user.isActive ? "default" : "secondary"} className={user.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-sm text-gray-600">
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Module Permissions Matrix</CardTitle>
              <CardDescription>
                Manage which users have access to which modules. Changes are saved automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-gray-700 min-w-[200px]">User</th>
                      <th className="text-left p-3 font-medium text-gray-700">Role</th>
                      {MODULES.map((module) => (
                        <th key={module.id} className="text-center p-3 font-medium text-gray-700 min-w-[100px]">
                          <div className="space-y-1">
                            <div>{module.name}</div>
                            <div className="text-xs font-normal text-gray-500">{module.description}</div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modulePermissions.map((permission) => (
                      <tr key={permission.userId} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium text-gray-900">{permission.userName}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                            {permission.role}
                          </Badge>
                        </td>
                        
                        {/* Ideas */}
                        <td className="p-3 text-center">
                          <Button
                            variant={permission.ideas ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateModulePermission(permission.userId, 'ideas', !permission.ideas)}
                            className={permission.ideas ? "bg-green-600 hover:bg-green-700 text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"}
                          >
                            {permission.ideas ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          </Button>
                        </td>
                        
                        {/* Work Items */}
                        <td className="p-3 text-center">
                          <Button
                            variant={permission.workItems ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateModulePermission(permission.userId, 'workItems', !permission.workItems)}
                            className={permission.workItems ? "bg-green-600 hover:bg-green-700 text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"}
                          >
                            {permission.workItems ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          </Button>
                        </td>
                        
                        {/* Design */}
                        <td className="p-3 text-center">
                          <Button
                            variant={permission.design ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateModulePermission(permission.userId, 'design', !permission.design)}
                            className={permission.design ? "bg-green-600 hover:bg-green-700 text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"}
                          >
                            {permission.design ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          </Button>
                        </td>
                        
                        {/* Code */}
                        <td className="p-3 text-center">
                          <Button
                            variant={permission.code ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateModulePermission(permission.userId, 'code', !permission.code)}
                            className={permission.code ? "bg-green-600 hover:bg-green-700 text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"}
                          >
                            {permission.code ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          </Button>
                        </td>
                        
                        {/* Test Cases */}
                        <td className="p-3 text-center">
                          <Button
                            variant={permission.testCases ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateModulePermission(permission.userId, 'testCases', !permission.testCases)}
                            className={permission.testCases ? "bg-green-600 hover:bg-green-700 text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"}
                          >
                            {permission.testCases ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          </Button>
                        </td>
                        
                        {/* Execution */}
                        <td className="p-3 text-center">
                          <Button
                            variant={permission.execution ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateModulePermission(permission.userId, 'execution', !permission.execution)}
                            className={permission.execution ? "bg-green-600 hover:bg-green-700 text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"}
                          >
                            {permission.execution ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Permission Changes</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Changes to module permissions are saved automatically and take effect immediately.
                      Users will see updated navigation on their next page load.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Definitions</CardTitle>
              <CardDescription>View and manage organizational roles and their default permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Executive', 'Portfolio', 'ART', 'Team'].map((level) => (
                  <div key={level}>
                    <h3 className="text-lg font-medium mb-3 text-gray-900">{level} Level</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {ROLES.filter(role => role.level === level).map((role) => (
                        <Card key={role.id} className="border-slate-200">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="font-medium text-gray-900">{role.name}</div>
                              <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                {role.level}
                              </Badge>
                              <div className="text-xs text-gray-500">
                                Users: {users.filter(u => u.roles.includes(role.id)).length}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
