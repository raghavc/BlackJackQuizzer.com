# Blackjack Basic Strategy Quizzer

A minimalist, modern web app for practicing blackjack basic strategy. Practice the optimal moves for every hand combination in an endless quiz format.

![Blackjack Strategy Quizzer](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple)

## Features

- **Endless Quiz Mode**: Random scenarios covering hard totals, soft totals, and pairs
- **Accurate Basic Strategy**: Implements standard multi-deck (4-8 deck) basic strategy
- **Configurable Rules**: Toggle S17/H17, Double After Split, Late Surrender
- **Keyboard Shortcuts**: H (Hit), S (Stand), D (Double), P (Split), R (Surrender), N (Next)
- **Stats Tracking**: Accuracy percentage, streak tracking, persisted to localStorage
- **Modern UI**: Dark theme, smooth animations, mobile-friendly

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploying to GitHub Pages

### Automatic Deployment

This repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages on push to `main`.

1. Push your code to GitHub
2. Go to **Settings → Pages** in your repository
3. Under "Build and deployment", select **GitHub Actions** as the source
4. Push to `main` and the site will build and deploy automatically

### Manual Deployment

If you want to deploy manually:

```bash
npm run build
# Upload the `dist` folder to your hosting provider
```

### Base Path Configuration

The Vite config is set up for the repository name `BlackJackQuizzer`. If your repository has a different name, update `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/',  // Change this to match your repo
})
```

For deploying to a custom domain (root path), change to:

```typescript
base: '/',
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `H` | Hit |
| `S` | Stand |
| `D` | Double Down |
| `P` | Split |
| `R` | Surrender |
| `N` | Next Hand |

## Strategy Reference

The app implements standard multi-deck (4-8 deck) basic strategy with support for:
- **S17**: Dealer stands on soft 17 (default)
- **H17**: Dealer hits soft 17
- **DAS**: Double after split allowed
- **Late Surrender**: Surrender after dealer checks for blackjack

## Tech Stack

- [Vite](https://vitejs.dev/) - Build tool
- [React](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## License

MIT
