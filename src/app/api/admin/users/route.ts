import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const connection = await createConnection();
    
    // Get all users with their roles and departments
    const [usersResults] = await connection.execute(`
      SELECT 
        u.id,
        u.entra_id as entraId,
        u.user_principal_name as userPrincipalName,
        u.email,
        u.display_name as displayName,
        u.given_name as givenName,
        u.surname,
        u.job_title as jobTitle,
        u.department,
        u.office_location as officeLocation,
        u.employee_id as employeeId,
        u.business_phones as businessPhones,
        u.manager_email as managerEmail,
        u.roles,
        u.is_active as isActive,
        u.last_login as lastLogin,
        u.created_at as createdAt,
        d.name as departmentName,
        r.display_name as primaryRoleDisplayName,
        ol.name as organizationalLevel
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN roles r ON u.primary_role_id = r.id
      LEFT JOIN organizational_levels ol ON u.organizational_level_id = ol.id
      WHERE u.email LIKE '%@emirates.com'
      ORDER BY u.display_name
    `);

    // Get user permissions
    const [permissionsResults] = await connection.execute(`
      SELECT 
        up.user_id as userId,
        up.user_name as userName,
        up.role_display_name as roleDisplayName,
        up.module_name as moduleName,
        up.module_display_name as moduleDisplayName,
        up.can_access as canAccess,
        up.can_read as canRead,
        up.can_write as canWrite,
        up.can_delete as canDelete,
        up.can_admin as canAdmin
      FROM user_permissions up
      ORDER BY up.user_name, up.module_name
    `);

    await connection.end();

    // Format users data
    const users = (usersResults as any[]).map((row: any) => ({
      id: row.id,
      entraId: row.entraId,
      userPrincipalName: row.userPrincipalName,
      email: row.email,
      displayName: row.displayName,
      givenName: row.givenName,
      surname: row.surname,
      jobTitle: row.jobTitle,
      department: row.department,
      departmentName: row.departmentName,
      officeLocation: row.officeLocation,
      employeeId: row.employeeId,
      businessPhones: row.businessPhones ? JSON.parse(row.businessPhones) : [],
      managerEmail: row.managerEmail,
      roles: row.roles ? JSON.parse(row.roles) : [],
      primaryRoleDisplayName: row.primaryRoleDisplayName,
      organizationalLevel: row.organizationalLevel,
      isActive: Boolean(row.isActive),
      lastLogin: row.lastLogin,
      createdAt: row.createdAt
    }));

    // Group permissions by user
    const userPermissions: { [userId: string]: any } = {};
    (permissionsResults as any[]).forEach((row: any) => {
      if (!userPermissions[row.userId]) {
        userPermissions[row.userId] = {
          userId: row.userId,
          userName: row.userName,
          roleDisplayName: row.roleDisplayName,
          modules: {}
        };
      }
      
      userPermissions[row.userId].modules[row.moduleName] = {
        displayName: row.moduleDisplayName,
        canAccess: Boolean(row.canAccess),
        canRead: Boolean(row.canRead),
        canWrite: Boolean(row.canWrite),
        canDelete: Boolean(row.canDelete),
        canAdmin: Boolean(row.canAdmin)
      };
    });

    return NextResponse.json({
      users,
      permissions: Object.values(userPermissions)
    });
    
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, roleId, modulePermissions } = await request.json();
    const connection = await createConnection();
    
    if (roleId) {
      // Update user's primary role
      await connection.execute(`
        UPDATE users 
        SET primary_role_id = ?, updated_at = NOW()
        WHERE id = ?
      `, [roleId, userId]);
      
      // Update user role assignments
      await connection.execute(`
        UPDATE user_role_assignments 
        SET is_active = FALSE
        WHERE user_id = ?
      `, [userId]);
      
      await connection.execute(`
        INSERT INTO user_role_assignments (id, user_id, role_id, assigned_by, is_active)
        VALUES (UUID(), ?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE is_active = TRUE, assigned_at = NOW()
      `, [userId, roleId, userId]); // Self-assigned for now
    }
    
    if (modulePermissions) {
      // Update specific module permissions
      for (const [moduleName, hasAccess] of Object.entries(modulePermissions)) {
        await connection.execute(`
          UPDATE role_permissions rp
          JOIN user_role_assignments ura ON rp.role_id = ura.role_id
          JOIN system_modules sm ON rp.module_id = sm.id
          SET rp.can_access = ?, rp.updated_at = NOW()
          WHERE ura.user_id = ? AND sm.name = ? AND ura.is_active = TRUE
        `, [hasAccess, userId, moduleName]);
      }
    }
    
    await connection.end();
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
