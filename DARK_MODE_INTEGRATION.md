# Dark Mode Integration Guide

## Overview

This application includes a complete dark mode implementation with:
- Light, Dark, and System (auto) themes
- Persistent theme preference (localStorage)
- CSS custom properties for easy theming
- Smooth transitions between themes
- System theme detection and sync

## Quick Integration

### 1. Wrap Your App with ThemeProvider

In your root `App.tsx` or `main.tsx`:

```tsx
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/theme.css';

function App() {
  return (
    <ThemeProvider>
      {/* Your app components */}
    </ThemeProvider>
  );
}
```

### 2. Add Theme Toggle to Header/Settings

```tsx
import ThemeToggle from './components/common/ThemeToggle';

function Header() {
  return (
    <header>
      <h1>My App</h1>

      {/* Icon-only toggle (simple) */}
      <ThemeToggle variant="icon" />

      {/* Or compact with label */}
      <ThemeToggle variant="compact" />

      {/* Or full dropdown with all options */}
      <ThemeToggle variant="dropdown" />
    </header>
  );
}
```

### 3. Use Theme-Aware Styles

**Option A: Use CSS Custom Properties (Recommended)**

```tsx
<div style={{
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-primary)',
}}>
  Content
</div>
```

**Option B: Use Utility Classes**

```tsx
<div className="bg-primary text-primary border-primary">
  Content
</div>
```

**Option C: Use Tailwind with dark: prefix**

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

## Available Theme Variables

### Colors

```css
/* Backgrounds */
--bg-primary          /* Main background */
--bg-secondary        /* Secondary background */
--bg-tertiary         /* Tertiary background */
--bg-elevated         /* Elevated surfaces (cards, modals) */
--bg-overlay          /* Overlay backgrounds */

/* Text */
--text-primary        /* Primary text */
--text-secondary      /* Secondary text (less emphasis) */
--text-tertiary       /* Tertiary text (least emphasis) */
--text-inverse        /* Inverse text (for dark backgrounds in light mode) */
--text-link           /* Link text */
--text-link-hover     /* Link hover state */

/* Borders */
--border-primary      /* Primary borders */
--border-secondary    /* Secondary borders */
--border-focus        /* Focus state borders */

/* Shadows */
--shadow-sm           /* Small shadow */
--shadow-md           /* Medium shadow */
--shadow-lg           /* Large shadow */
--shadow-xl           /* Extra large shadow */
```

### Component-Specific Variables

```css
/* Workflow Canvas */
--node-bg
--node-border
--node-shadow
--node-hover-shadow
--canvas-bg
--canvas-grid

/* Layout */
--sidebar-bg
--sidebar-border
--header-bg
--header-border

/* Interactive Elements */
--modal-bg
--modal-overlay
--input-bg
--input-border
--input-focus-border
--input-disabled-bg
--button-primary-bg
--button-primary-hover
--button-primary-text
--code-bg
--code-border
```

## Using the Theme Hook

### Access Theme State

```tsx
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { theme, effectiveTheme, setTheme, toggleTheme } = useTheme();

  return (
    <div>
      <p>Current theme preference: {theme}</p>
      <p>Effective theme: {effectiveTheme}</p>

      {/* Toggle between light and dark */}
      <button onClick={toggleTheme}>
        Toggle Theme
      </button>

      {/* Set specific theme */}
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}
```

### Conditional Rendering Based on Theme

```tsx
import { useTheme } from './contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

function ThemeIcon() {
  const { effectiveTheme } = useTheme();

  return effectiveTheme === 'dark' ? <Moon /> : <Sun />;
}
```

## Styling Components for Dark Mode

### Method 1: CSS Custom Properties (Recommended)

```css
.my-component {
  background-color: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-md);
}

.my-component:hover {
  box-shadow: var(--shadow-lg);
}
```

### Method 2: Tailwind with dark: modifier

```tsx
<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
  <h2 className="text-gray-900 dark:text-white">Title</h2>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

### Method 3: Conditional Classes

```tsx
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  return (
    <div className={isDark ? 'dark-mode-styles' : 'light-mode-styles'}>
      Content
    </div>
  );
}
```

## Best Practices

### 1. Always Use Theme Variables for Colors

**Good:**
```css
.my-button {
  background-color: var(--button-primary-bg);
  color: var(--button-primary-text);
}
```

**Bad:**
```css
.my-button {
  background-color: #3b82f6; /* Hard-coded color */
  color: #ffffff;
}
```

### 2. Test Both Themes

Always test your components in both light and dark modes to ensure readability and accessibility.

### 3. Consider Contrast Ratios

Ensure text has sufficient contrast in both themes:
- Light mode: Dark text on light backgrounds
- Dark mode: Light text on dark backgrounds

### 4. Use Semantic Variable Names

Prefer semantic names like `--bg-primary` over specific colors like `--blue-500`.

### 5. Smooth Transitions

The theme system includes smooth transitions. To disable for specific elements:

```css
.no-transition {
  transition: none !important;
}
```

## Tailwind Configuration

If using Tailwind CSS, update `tailwind.config.js`:

```js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Map Tailwind colors to CSS variables
        primary: 'var(--color-primary-500)',
        // ... other colors
      },
    },
  },
  // ... other config
};
```

## React Flow Dark Mode

For React Flow components (workflow canvas):

```tsx
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react';
import { useTheme } from './contexts/ThemeContext';

function WorkflowCanvas() {
  const { effectiveTheme } = useTheme();

  return (
    <ReactFlow
      {...props}
      className={effectiveTheme === 'dark' ? 'dark' : 'light'}
    >
      <Background
        variant={BackgroundVariant.Dots}
        color={effectiveTheme === 'dark' ? '#404040' : '#e5e7eb'}
      />
    </ReactFlow>
  );
}
```

## Accessibility

The theme system includes:
- `prefers-color-scheme` media query support (system theme)
- Proper ARIA labels on theme toggle buttons
- Sufficient color contrast in both themes
- Keyboard navigation support

## Troubleshooting

### Theme Not Persisting

Check that localStorage is available:
```tsx
if (typeof window !== 'undefined' && window.localStorage) {
  // localStorage is available
}
```

### Theme Flashing on Page Load

Add initial theme script to `index.html` before React loads:

```html
<script>
  (function() {
    const theme = localStorage.getItem('pankh-theme-preference') || 'system';
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    document.documentElement.classList.add(effectiveTheme);
  })();
</script>
```

### Custom Components Not Themed

Ensure you're using theme variables or dark: classes consistently across all components.

## Examples

### Themed Card Component

```tsx
import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="text-gray-700 dark:text-gray-300">
        {children}
      </div>
    </div>
  );
};
```

### Themed Input Component

```tsx
const Input: React.FC<Props> = ({ ...props }) => {
  return (
    <input
      {...props}
      className="
        w-full px-3 py-2 rounded-lg
        bg-white dark:bg-gray-800
        border border-gray-300 dark:border-gray-600
        text-gray-900 dark:text-white
        placeholder-gray-400 dark:placeholder-gray-500
        focus:border-blue-500 dark:focus:border-blue-400
        focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900
      "
    />
  );
};
```

### Themed Button Component

```tsx
const Button: React.FC<Props> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors";

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white",
    danger: "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white",
  };

  return (
    <button
      {...props}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
};
```

## Resources

- [MDN: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [WCAG Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
