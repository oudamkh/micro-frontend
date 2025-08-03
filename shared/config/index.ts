export const APP_CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  JWT_COOKIE_NAME: 'admin_auth_token',
  REFRESH_COOKIE_NAME: 'admin_refresh_token',
  TOKEN_EXPIRY: 15 * 60 * 1000, // 15 minutes
  REFRESH_EXPIRY: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const SIDEBAR_MENU: import('@wingbanknext/types').SidebarItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    href: '/',
    icon: 'dashboard',
    roles: ['admin', 'manager', 'operator', 'viewer'],
    permissions: []
  },
  {
    id: 'users',
    title: 'Users',
    href: '/account-management/users',
    icon: 'users',
    roles: ['admin', 'manager'],
    permissions: ['read:users']
  },
  {
    id: 'roles',
    title: 'Roles',
    href: '/account-management/roles',
    icon: 'roles',
    roles: ['admin'],
    permissions: ['read:roles']
  },
  {
    id: 'inventory',
    title: 'Inventory',
    href: '/production-management/inventory',
    icon: 'inventory',
    roles: ['admin', 'manager', 'operator'],
    permissions: ['read:inventory']
  },
  {
    id: 'orders',
    title: 'Production Orders',
    href: '/production-management/orders',
    icon: 'orders',
    roles: ['admin', 'manager', 'operator'],
    permissions: ['read:orders']
  }
];