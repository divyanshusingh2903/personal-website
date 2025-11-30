# Deployment Guide

This guide covers various deployment options for your portfolio website.

## Deployment Options

### 1. Vercel (Recommended - Easiest)

Vercel offers free hosting with automatic deployments from GitHub.

**Steps:**
1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Sign in with GitHub
4. Click "New Project"
5. Import your repository
6. Vercel will auto-detect Vite settings
7. Click "Deploy"

**Custom Domain:**
- Add your domain in Project Settings > Domains

### 2. Netlify

Another excellent free option with continuous deployment.

**Steps:**
1. Push your code to GitHub
2. Visit [netlify.com](https://netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Connect to GitHub and select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy"

### 3. GitHub Pages

Free hosting directly from your GitHub repository.

**Steps:**
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json scripts:
   ```json
   "homepage": "https://yourusername.github.io/repo-name",
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
3. Update vite.config.js:
   ```js
   export default defineConfig({
     base: '/repo-name/',
     plugins: [react()],
   })
   ```
4. Run: `npm run deploy`
5. Enable GitHub Pages in repository Settings > Pages

### 4. AWS S3 + CloudFront

For production-grade hosting with CDN.

**Steps:**
1. Build your app: `npm run build`
2. Create S3 bucket with static website hosting enabled
3. Upload `dist` folder contents to S3
4. Create CloudFront distribution pointing to S3 bucket
5. Configure custom domain in Route 53 (optional)

### 5. Traditional Web Hosting (cPanel/FTP)

**Steps:**
1. Build your app: `npm run build`
2. Upload contents of `dist` folder to your hosting's public_html or www directory
3. Ensure your domain points to the hosting server

## Environment Variables

If you need to add environment variables:

1. Create `.env` file in root:
   ```
   VITE_API_URL=your_api_url
   ```
2. Access in code: `import.meta.env.VITE_API_URL`
3. Add `.env` to `.gitignore`

## Custom Domain Setup

After deploying, configure your custom domain:

1. **DNS Settings** - Add these records:
   - A record: `@` pointing to your hosting IP
   - CNAME record: `www` pointing to `yourdomain.com`

2. **SSL Certificate** - Most platforms (Vercel, Netlify) provide free SSL automatically

## CI/CD Pipeline

Your site will auto-deploy on every push to main branch when using Vercel or Netlify.

For GitHub Actions deployment:
1. Create `.github/workflows/deploy.yml`
2. Configure build and deployment steps
3. Add necessary secrets in repository settings

## Performance Optimization

Before deploying:
- ✅ Images are optimized (use WebP format)
- ✅ Build output is minified
- ✅ Lazy loading implemented where needed
- ✅ Lighthouse score > 90

Run: `npm run preview` to test production build locally.

## Troubleshooting

**Blank page after deployment:**
- Check browser console for errors
- Verify base path in vite.config.js matches your deployment URL
- Ensure all assets are properly referenced

**404 on routes:**
- For SPA, configure hosting to redirect all routes to index.html

**Build fails:**
- Check Node.js version (use v18+)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
