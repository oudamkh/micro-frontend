export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
}

export type Role = 'admin' | 'manager' | 'operator' | 'viewer';

export type Permission = 
  | 'read:users'
  | 'write:users'
  | 'delete:users'
  | 'read:roles'
  | 'write:roles'
  | 'read:inventory'
  | 'write:inventory'
  | 'read:orders'
  | 'write:orders';

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SidebarItem {
  id: string;
  title: string;
  href: string;
  icon: string;
  roles: Role[];
  permissions: Permission[];
}