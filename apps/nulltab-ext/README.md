# nulltab-ext

## Prerequisites

- **Node.js**: >= 25
- **pnpm**: ^10.0.0

## Getting Started

### 1. Install Dependencies

From the repository root:

```bash
pnpm install
```

### 2. Development

Run the extension in development mode with hot reload:

```bash
# For Chrome (default)
pnpm dev

# For Firefox
pnpm dev:firefox
```

This will:

- Build the extension in development mode
- Watch for file changes and auto-reload
- Open a browser instance with the extension loaded

### 3. Load the Extension Manually

If you prefer to load the extension manually:

1. Run `pnpm build` (or `pnpm build:firefox` for Firefox)
2. In Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `.output/chrome-mv3` directory
3. In Firefox:
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select any file in the `.output/firefox-mv2` directory

## Available Scripts

### Development

- `pnpm dev` - Start development mode for Chrome
- `pnpm dev:firefox` - Start development mode for Firefox
- `pnpm storybook` - Run Storybook component library on port 6006

### Building

- `pnpm build` - Build production-ready extension for Chrome
- `pnpm build:firefox` - Build production-ready extension for Firefox
- `pnpm zip` - Create a zip file for Chrome Web Store submission
- `pnpm zip:firefox` - Create a zip file for Firefox Add-ons submission

### Code Quality

- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint and auto-fix issues
- `pnpm test` - Run TypeScript type checking
- `pnpm watch` - Run tests in watch mode

## Project Structure

```
apps/nulltab-ext/
├── entrypoints/        # Extension entry points (popup, sidepanel, background, etc.)
├── src/
│   ├── components/     # Shared React components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page-level components
│   ├── services/       # Business logic and services
│   └── utils/          # Utility functions
├── assets/             # Static assets (icons, etc.)
├── public/             # Public files
└── .storybook/         # Storybook configuration
```

## Tech Stack

- **Framework**: [WXT](https://wxt.dev/) - Next-gen web extension framework
- **UI Library**: React 19 with React Compiler
- **Routing**: TanStack Router
- **State Management**: TanStack Query
- **Virtualization**: TanStack Virtual
- **Styling**: Tailwind CSS v4
- **Drag & Drop**: Atlaskit Pragmatic Drag and Drop
- **Component Dev**: Storybook

## Extension Features

### Keyboard Shortcuts

- `Ctrl+Shift+Y` (Windows/Linux) or `Cmd+Shift+Y` (Mac) - Open NullTab popup
- `Alt+T` (Windows/Linux) or `Opt+T` (Mac) - Open NullTab dashboard

### Permissions

The extension requires the following permissions:

- `favicon` - Display tab favicons
- `sessions` - Manage browsing sessions
- `sidePanel` - Enable side panel functionality
- `storage` - Store user preferences and data
- `tabGroups` - Organize tabs into groups
- `tabs` - Manage browser tabs

## Troubleshooting

### Port already in use

If the development server fails to start due to a port conflict, you can change the port in `vite.config.ts`.

### Extension not loading

Make sure you've run `pnpm install` from the repository root to set up all workspace dependencies.
