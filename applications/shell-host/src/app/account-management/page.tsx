// app/account-management/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {MicroFrontendLoader} from '@/lib/micro-frontend-loader';
import { getMicroFrontendConfig } from '@/lib/micro-frontend-registry';

export default function AccountManagementPage() {
  const { hasPermission, user, authToken } = useAuth();
  const [canAccess, setCanAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('why no permission: ', user);
    setCanAccess(hasPermission('users.read'));
    setIsLoading(false);
  }, [hasPermission]);

  const mfeConfig = getMicroFrontendConfig('accountManagement');

  console.log('mfeConfig: ', mfeConfig);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Access Denied
          </h2>
          <p className="text-red-600">
            You don't have permission to access the account management module.
          </p>
        </div>
      </div>
    );
  }

  if (!mfeConfig) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            Configuration Error
          </h2>
          <p className="text-yellow-600">
            Account management micro frontend configuration not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <MicroFrontendLoader
        config={{...mfeConfig}}
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading Account Management...</span>
          </div>
        }
        onLoad={() => {
          console.log('Account Management micro frontend loaded successfully');
        }}
        onError={(error) => {
          console.error('Failed to load Account Management micro frontend:', error);
        }}
        // Pass auth context to micro frontend
        //user={user}
        //token={authToken}
        //permissions={user?.permissions}
      />
    </div>
  );
}