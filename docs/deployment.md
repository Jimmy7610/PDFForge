# Deployment Guide

PDFForge is deployed to GitHub Pages using GitHub Actions.

## Final URL
The application is hosted at:
[https://jimmy7610.github.io/PDFForge/](https://jimmy7610.github.io/PDFForge/)

## How to Deploy
Deployment is automated via GitHub Actions. Any push to the `main` branch will trigger a build and deploy.

### Required GitHub Repository Settings
1. Go to your repository on GitHub.
2. Navigate to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, ensure **GitHub Actions** is selected.

## Local Verification
Before pushing changes, you can verify the build locally:

```bash
npm run build
```

And check for TypeScript errors:

```bash
npx tsc -b --noEmit
```

## Manual Check
After a deployment succeeds:
1. Open the [live URL](https://jimmy7610.github.io/PDFForge/).
2. Verify that the landing page loads correctly.
3. Check the browser console for any failed asset loads (404s).
4. Upload a small PDF to verify core functionality works in the deployed environment.
