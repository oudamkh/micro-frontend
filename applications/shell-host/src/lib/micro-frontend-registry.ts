// lib/micro-frontend-registry.ts
export interface MicroFrontendConfig {
  name: string;
  host: string;
  basePath?: string;
  healthEndpoint?: string;
}

export const microFrontends: Record<string, MicroFrontendConfig> = {
  accountManagement: {
    name: 'account-management',
    host: process.env.NODE_ENV === 'production' 
      ? 'https://account-mfe.yourcompany.com' 
      : 'http://localhost:3001',
    basePath: '/',
    healthEndpoint: '/api/health',
  },
  // Add more micro frontends here
  // userSettings: {
  //   name: 'user-settings',
  //   host: process.env.NODE_ENV === 'production' 
  //     ? 'https://settings-mfe.yourcompany.com' 
  //     : 'http://localhost:3002',
  // },
};

export function getMicroFrontendConfig(name: string): MicroFrontendConfig | null {
  return microFrontends[name] || null;
}