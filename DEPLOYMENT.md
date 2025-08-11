# Deployment Configuration

## API URL Configuration

The application uses environment variables to configure the API base URL. The API service automatically appends `/api/v1` to the configured URL.

### Environment Files

- `.env.development` - Local development (default: `http://localhost:3000`)
- `.env.staging` - Staging/Dev environment (default: `https://api-dev.censys.com`)
- `.env.production` - Production environment (default: `https://api.censys.com`)

### Build Scripts

```bash
# Local development
npm run dev

# Build for staging/dev deployment
npm run build:dev

# Build for production deployment  
npm run build:prod

# Standard build (uses .env file)
npm run build
```

### Manual Environment Variable Override

You can override the API URL at build time:

```bash
# Override for custom dev environment
VITE_API_URL=https://custom-api-dev.censys.com npm run build

# Override for custom production environment
VITE_API_URL=https://custom-api.censys.com npm run build:prod
```

### Docker Deployment

```dockerfile
# Build with environment-specific API URL
ARG VITE_API_URL=https://api-dev.censys.com
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build
```

### CI/CD Pipeline Example

```yaml
# GitHub Actions example
- name: Build for Dev
  run: npm run build:dev
  
- name: Build for Production
  run: npm run build:prod
  
# Or with custom URL
- name: Build with Custom API
  run: npm run build
  env:
    VITE_API_URL: ${{ secrets.API_URL }}
```

## Mock Data Toggle

The application also supports a mock data toggle for testing:

```typescript
// In src/services/api.ts
const USE_MOCK_DATA = false; // Set to true for mock data
```

This can be configured per environment if needed.
