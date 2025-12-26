This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Progressive Web App (PWA)

This application is a Progressive Web App and can be installed on mobile and desktop devices:

### Features

- **Installable**: Add to home screen on mobile devices or install as a desktop app
- **Offline Support**: Service worker caching for offline functionality
- **App-like Experience**: Runs in standalone mode without browser UI
- **Optimized Icons**: Multiple icon sizes for different devices and platforms

### Installation

- **Mobile (iOS/Android)**: Tap the browser menu and select "Add to Home Screen" or "Install App"
- **Desktop (Chrome/Edge)**: Click the install icon in the address bar or use the browser menu
- **Desktop (Safari)**: Use File → Add to Dock

### PWA Configuration

- Manifest: `/public/manifest.json`
- Icons: `/public/icon-*.png` (192x192, 256x256, 384x384, 512x512)
- Service Worker: Auto-generated during production build

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
