'use client';

import React, { useState } from 'react';
import UserList from './UserList';
import UserForm from './UserForm';
import { User } from './types';

type View = 'list' | 'create' | 'edit';

export default function AccountManagement() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setCurrentView('create');
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setCurrentView('edit');
  };

  const handleSaveUser = (userData: Partial<User>) => {
    // In a real application, this would make an API call
    console.log('Saving user:', userData);
    
    // Simulate success and return to list
    setTimeout(() => {
      setCurrentView('list');
      setSelectedUser(null);
    }, 1000);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentView === 'list' && (
          <UserList
            onEditUser={handleEditUser}
            onCreateUser={handleCreateUser}
          />
        )}
        
        {(currentView === 'create' || currentView === 'edit') && (
          <UserForm
            user={selectedUser}
            onSave={handleSaveUser}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}