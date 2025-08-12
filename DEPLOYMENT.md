# Deployment Configuration

## API URL Configuration

The application uses the `VITE_API_URL` environment variable to configure the API base URL. The API service automatically appends `/api/v1` to the configured URL.

### For Render Deployment

**The issue:** `VITE_API_URL` environment variables set in Render's dashboard don't work because Vite environment variables are build-time only, but Render sets them at runtime.

**Solution:** Set the environment variable during the build process in Render:

1. **In Render Dashboard:**
   - Go to your service settings
   - Under "Build & Deploy" → "Build Command", change from:
     ```
     npm run build
     ```
     to:
     ```
     VITE_API_URL=$API_URL npm run build
     ```

2. **Set Environment Variable:**
   - Variable: `API_URL`
   - Value: `https://your-api-url.com`

3. **Publish Directory:** `dist` (for static site deployment)

This way, the `API_URL` runtime environment variable gets passed to `VITE_API_URL` during the build process.

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

### Alternative: Environment-Specific Builds

You can also use the environment-specific build commands:

```bash
# For dev/staging
npm run build:dev

# For production
npm run build:prod
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

## Troubleshooting

### VITE_API_URL not working in Render

**Problem:** `VITE_API_URL` environment variable set in Render's dashboard doesn't work.

**Root Cause:** Vite environment variables are build-time only, but Render sets environment variables at runtime.

**Solution:** Pass the runtime environment variable to the build command:
```bash
# In Render's Build Command setting:
VITE_API_URL=$API_URL npm run build
```

Then set `API_URL` in Render's environment variables.

### SPA Routing Issues (Direct URL Access)

**Problem:** URLs like `https://your-app.onrender.com/hosts` return 404 or don't load the correct page.

**Root Cause:** This is a common SPA (Single Page Application) routing issue. When you navigate directly to `/hosts`, the server looks for a file at that path, but only `/index.html` exists.

**Solution:**

1. **_redirects file:** Added `public/_redirects` with `/* /index.html 200` rule
2. **Static site deployment:** Deploy as static site, not Node.js service

**Testing:** After deployment, these URLs should work:
- `https://your-app.onrender.com/hosts`
- `https://your-app.onrender.com/web`
- `https://your-app.onrender.com/hosts/192.168.1.100`
- `https://your-app.onrender.com/web/example.com`

**Debugging SPA Routing Issues:**

1. **Verify Deployment Type:**
   - Make sure you're deploying as a **Static Site**, not a Web Service
   - Static sites automatically process `_redirects` files

2. **Check Build:**
   - Ensure build command is: `VITE_API_URL=$API_URL npm run build`
   - Verify `dist` folder contains `index.html` and `_redirects`
   - Publish directory should be: `dist`

3. **Test Locally:**
   ```bash
   npm run build
   # Check that dist/_redirects exists
   ls dist/_redirects
   # Serve locally to test
   npx serve dist
   # Then test: http://localhost:3000/hosts/192.168.1.100
   ```

### Checking API URL

You can check the API URL being used by looking at the network requests in browser dev tools, or by adding a console log in the API service.
