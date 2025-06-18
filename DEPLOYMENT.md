# SMIS - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Your code should be pushed to GitHub, GitLab, or Bitbucket
3. **Node.js**: Version 18+ recommended

## Deployment Steps

### Method 1: Vercel Dashboard (Recommended)

1. **Connect Your Repository**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   Add these environment variables in your Vercel project settings:
   ```
   VITE_SUPABASE_URL=https://ghnlwaxzzqxlegrrdrhz.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdobmx3YXh6enF4bGVncnJkcmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTY0NzksImV4cCI6MjA2NTM3MjQ3OX0.uHhVjC7m38uoDqicEkYgnkeNwG_nSYzjRbO9fJ8GVHk
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be available at `https://your-project-name.vercel.app`

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

## Important Notes

- **vercel.json** configuration is already set up for proper SPA routing
- **Environment variables** are configured to use Vite's import.meta.env
- **Build optimization** includes code splitting for better performance
- **Security headers** are configured in vercel.json

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

## Troubleshooting

### Build Fails
- Check that all dependencies are listed in package.json
- Ensure environment variables are set correctly
- Review build logs in Vercel dashboard

### App Not Loading
- Check browser console for errors
- Verify Supabase configuration
- Ensure all environment variables are set

### Routing Issues
- The vercel.json rewrites should handle SPA routing
- If issues persist, check that all routes are properly configured in your React Router setup

## Performance Optimization

- Enable Vercel Analytics for performance monitoring
- Consider implementing lazy loading for large components
- Use Vercel's Image Optimization for any images

## Support

For deployment issues:
- Check Vercel's documentation: https://vercel.com/docs
- Review build logs in the Vercel dashboard
- Contact support through Vercel's help center 