'use client';

import React, { useState, useEffect } from 'react';
import { User, CreateUserRequest, UpdateUserRequest, Role } from '@/types/user';
import { userApi, roleApi } from '@/lib/api';
import { X } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  onSave: () => void;
}

const AVAILABLE_PERMISSIONS = [
  'dashboard.view',
  'account.view',
  'account.create',
  'account.edit',
  'account.delete',
  'production.view',
  'production.create',
  'production.edit',
  'production.delete',
  'settings.view',
  'settings.edit',
];

export const UserModal: React.FC<UserModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: '',
    permissions: [] as string[],
    status: 'active' as User['status'],
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      if (user) {
        setFormData({
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          status: user.status,
        });
      } else {
        setFormData({
          email: '',
          name: '',
          role: '',
          permissions: [],
          status: 'active',
        });
      }
      setErrors({});
    }
  }, [isOpen, user]);

  const fetchRoles = async () => {
    try {
      const data = await roleApi.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      // Mock data for demo
      setRoles([
        {
          id: '1',
          name: 'Administrator',
          description: 'Full system access',
          permissions: ['*'],
        },
        {
          id: '2',
          name: 'Manager',
          description: 'Management access',
          permissions: ['dashboard.view', 'account.view', 'production.view'],
        },
        {
          id: '3',
          name: 'User',
          description: 'Basic user access',
          permissions: ['dashboard.view'],
        },
      ]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (user) {
        const updateData: UpdateUserRequest = {
          name: formData.name,
          role: formData.role,
          permissions: formData.permissions,
          status: formData.status,
        };
        await userApi.updateUser(user.id, updateData);
      } else {
        const createData: CreateUserRequest = {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          permissions: formData.permissions,
        };
        await userApi.createUser(createData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (roleName: string) => {
    const selectedRole = roles.find(role => role.name === roleName);
    if (selectedRole) {
      setFormData(prev => ({
        ...prev,
        role: roleName,
        permissions: selectedRole.permissions.includes('*') 
          ? ['*'] 
          : selectedRole.permissions,
      }));
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (permission === '*') {
      setFormData(prev => ({
        ...prev,
        permissions: checked ? ['*'] : [],
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: checked
          ? [...prev.permissions.filter(p => p !== '*'), permission]
          : prev.permissions.filter(p => p !== permission),
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {user ? 'Edit User' : 'Create User'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!!user}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-600 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          {/* Status (only for edit) */}
          {user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  status: e.target.value as User['status'] 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
              {/* All permissions checkbox */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.permissions.includes('*')}
                  onChange={(e) => handlePermissionChange('*', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">All Permissions (*)</span>
              </label>
              
              <hr className="my-2" />
              
              {/* Individual permissions */}
              {AVAILABLE_PERMISSIONS.map((permission) => (
                <label key={permission} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes('*') || formData.permissions.includes(permission)}
                    onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                    disabled={formData.permissions.includes('*')}
                    className="mr-2"
                  />
                  <span className="text-sm">{permission}</span>
                </label>
              ))}
            </div>
            {errors.permissions && (
              <p className="text-red-600 text-sm mt-1">{errors.permissions}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (user ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};