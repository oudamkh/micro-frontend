export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

export interface UpdateUserRequest {
  name?: string;
  role?: string;
  permissions?: string[];
  status?: 'active' | 'inactive' | 'suspended';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}