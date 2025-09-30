import type { RecordId } from 'surrealdb';

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  ANALYST = 'analyst'
}

export interface AdminPermissions {
  canManageUsers: boolean;
  canManagePrompts: boolean;
  canModerateContent: boolean;
  canViewAnalytics: boolean;
  canManageFeatureFlags: boolean;
  canManageBilling: boolean;
}

export interface AdminUser {
  id: RecordId<'user'>;
  email: string;
  name?: string;
  role: AdminRole;
  permissions: AdminPermissions;
  created_at: Date;
  updated_at: Date;
}

// 📌 UI type
export interface UIAdminUser {
  id: string;
  email: string;
  name?: string;
  role: AdminRole;
  permissions: AdminPermissions;
  created_at?: string | number;
  updated_at?: string | number;
}

export function transformAdminUserToUI(user: AdminUser): UIAdminUser {
  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
    created_at: user.created_at?.getTime(),
    updated_at: user.updated_at?.getTime(),
  };
}

// 📌 Helper to get permissions based on role
export function getPermissionsForRole(role: AdminRole): AdminPermissions {
  switch (role) {
    case AdminRole.SUPER_ADMIN:
      return {
        canManageUsers: true,
        canManagePrompts: true,
        canModerateContent: true,
        canViewAnalytics: true,
        canManageFeatureFlags: true,
        canManageBilling: true,
      };
    case AdminRole.ADMIN:
      return {
        canManageUsers: true,
        canManagePrompts: true,
        canModerateContent: true,
        canViewAnalytics: true,
        canManageFeatureFlags: true,
        canManageBilling: false,
      };
    case AdminRole.MODERATOR:
      return {
        canManageUsers: false,
        canManagePrompts: false,
        canModerateContent: true,
        canViewAnalytics: false,
        canManageFeatureFlags: false,
        canManageBilling: false,
      };
    case AdminRole.ANALYST:
      return {
        canManageUsers: false,
        canManagePrompts: false,
        canModerateContent: false,
        canViewAnalytics: true,
        canManageFeatureFlags: false,
        canManageBilling: false,
      };
    default:
      return {
        canManageUsers: false,
        canManagePrompts: false,
        canModerateContent: false,
        canViewAnalytics: false,
        canManageFeatureFlags: false,
        canManageBilling: false,
      };
  }
}

