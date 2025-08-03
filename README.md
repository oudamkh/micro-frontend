# Web Admin Micro Frontend - Setup & Deployment Guide

## Overview

This micro frontend architecture consists of:
- **Shell Application** (Port 3000) - Main container with auth and navigation
- **Account Management** (Port 3001) - User and role management
- **Production Management** (Port 3002) - Product and production tracking

## Setup Instructions

### 1. Initialize the Project

```bash
# Create project directory
mkdir web-admin
cd web-admin

# Initialize pnpm workspace
pnpm init
```

### 2. Create Workspace Configuration

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/*'
```

### 3. Create Package Directories

```bash
mkdir -p packages/shell
mkdir -p packages/account-management
mkdir -p packages/production-management
```

### 4. Setup Each Package

#### Shell Application (packages/shell/)
```bash
cd packages/shell
pnpm init
# Copy shell files from the artifacts above
pnpm install
```

#### Account Management (packages/account-management/)
```bash
cd ../account-management
pnpm init
# Copy account management files from the artifacts above
pnpm install
```

#### Production Management (packages/production-management/)
```bash
cd ../production-management
pnpm init
# Copy production management files from the artifacts above
pnpm install
```

### 5. Environment Configuration

Create `.env.local` in each package:

```bash
# packages/shell/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ACCOUNT_MFE_URL=http://localhost:3001
NEXT_PUBLIC_PRODUCTION_MFE_URL=http://localhost:3002

# packages/account-management/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

# packages/production-management/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

### Start All Applications

From the root directory:
```bash
pnpm dev
```

This will start:
- Shell: http://localhost:3000
- Account Management: http://localhost:3001
- Production Management: http://localhost:3002

### Start Individual Applications

```bash
# Shell only
cd packages/shell && pnpm dev

# Account Management only
cd packages/account-management && pnpm dev

# Production Management only
cd packages/production-management && pnpm dev
```

## Authentication Flow

### JWT Token Structure

The application expects JWT tokens with this payload:
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "permissions": ["dashboard.view", "account.view", "production.view"],
  "exp": 1234567890,
  "iat": 1234567890
}
```

### Mock Authentication

For development, you can use these test credentials:
- **Email**: admin@example.com
- **Password**: admin123
- **Permissions**: ["*"] (all permissions)

### Backend API Requirements

Your backend should provide these endpoints:

```bash
POST /auth/login
{
  "email": "string",
  "password": "string"
}
# Returns: { "token": "jwt_token" }

# User Management
GET /users
POST /users
PUT /users/:id
DELETE /users/:id

# Role Management
GET /roles
POST /roles
PUT /roles/:id
DELETE /roles/:id

# Production Management
GET /products
POST /products
PUT /products/:id
DELETE /products/:id

GET /production-orders
POST /production-orders
PUT /production-orders/:id
DELETE /production-orders/:id

GET /production-metrics
GET /production-metrics/chart
```

## Production Deployment

### 1. Docker Setup

Create `Dockerfile` for each package:

```dockerfile
# packages/shell/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### 2. Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  shell:
    build: ./packages/shell
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8000
      - NEXT_PUBLIC_ACCOUNT_MFE_URL=http://account:3001
      - NEXT_PUBLIC_PRODUCTION_MFE_URL=http://production:3002
    depends_on:
      - account
      - production

  account:
    build: ./packages/account-management
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8000

  production:
    build: ./packages/production-management
    ports:
      - "3002:3002"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8000

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - shell
      - account
      - production
```

### 3. Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream shell {
        server shell:3000;
    }
    
    upstream account {
        server account:3001;
    }
    
    upstream production {
        server production:3002;
    }

    server {
        listen 80;
        
        location / {
            proxy_pass http://shell;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        location /account {
            proxy_pass http://account;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        location /production {
            proxy_pass http://production;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### 4. Kubernetes Deployment

Create Kubernetes manifests:

```yaml
# k8s/shell-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shell
spec:
  replicas: 2
  selector:
    matchLabels:
      app: shell
  template:
    metadata:
      labels:
        app: shell
    spec:
      containers:
      - name: shell
        image: web-admin/shell:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://api-service:8000"
---
apiVersion: v1
kind: Service
metadata:
  name: shell-service
spec:
  selector:
    app: shell
  ports:
  - port: 3000
    targetPort: 3000
```

## Security Considerations

### 1. CORS Configuration

Configure CORS on your backend:
```javascript
// Express.js example
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'https://yourdomain.com'
  ],
  credentials: true
}));
```

### 2. JWT Security

- Use secure, httpOnly cookies in production
- Implement token refresh mechanism
- Set appropriate token expiration times
- Use HTTPS in production

### 3. Content Security Policy

Add CSP headers:
```javascript
// Next.js config
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ];
  }
};
```

## Performance Optimization

### 1. Module Federation (Alternative Approach)

For better performance, consider using Webpack Module Federation:

```javascript
// webpack.config.js for shell
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        account: 'account@http://localhost:3001/remoteEntry.js',
        production: 'production@http://localhost:3002/remoteEntry.js',
      },
    }),
  ],
};
```

### 2. Shared Dependencies

Share common dependencies between micro frontends:
```javascript
// webpack.config.js
shared: {
  react: { singleton: true },
  'react-dom': { singleton: true },
  'tailwindcss': { singleton: true },
}
```

### 3. Code Splitting

Implement lazy loading:
```typescript
// Dynamic imports for micro frontends
const AccountMFE = React.lazy(() => import('account/App'));
const ProductionMFE = React.lazy(() => import('production/App'));
```

## Monitoring and Logging

### 1. Error Tracking

Implement error boundaries and logging:
```typescript
// ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MFE Error:', error, errorInfo);
    // Send to error tracking service
  }
}
```

### 2. Performance Monitoring

Add performance tracking:
```typescript
// Performance tracking
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log('Performance:', entry);
  });
});
observer.observe({ entryTypes: ['navigation', 'measure'] });
```

## Testing

### 1. Unit Testing

```bash
# Install testing dependencies
pnpm add -D jest @testing-library/react @testing-library/jest-dom

# Run tests
pnpm test
```

### 2. Integration Testing

```bash
# Install Cypress
pnpm add -D cypress

# Run e2e tests
pnpm cypress open
```

### 3. Cross-MFE Testing

Test communication between micro frontends:
```typescript
// Test authentication flow across MFEs
describe('Cross-MFE Authentication', () => {
  it('should maintain auth state across micro frontends', () => {
    cy.login('admin@example.com', 'admin123');
    cy.visit('/account');
    cy.should('contain', 'Account Management');
    cy.visit('/production');
    cy.should('contain', 'Production Management');
  });
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check backend CORS configuration
2. **Module Not Found**: Verify micro frontend URLs and routing
3. **Authentication Issues**: Check JWT token format and expiration
4. **Build Errors**: Ensure all dependencies are installed

### Debug Mode

Enable debug logging:
```bash
DEBUG=* pnpm dev
```

### Health Checks

Implement health check endpoints:
```typescript
// pages/api/health.ts
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
}
```