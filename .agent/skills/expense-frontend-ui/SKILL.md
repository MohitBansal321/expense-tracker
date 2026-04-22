---
name: expense-frontend-ui
description: Use this skill when building or modifying React components, pages, layouts, or any UI in the Expense Tracker frontend. Covers the tech stack (React 18 + Vite + TailwindCSS v4 + Radix UI + Framer Motion + Lucide icons), component organization (features/ directory), UI primitive patterns (shadcn-style components/ui/), mobile-first design, PWA features, and animation patterns. Trigger when user mentions UI, components, pages, design, layout, styling, TailwindCSS, Radix, animations, responsive design, or mobile.

# Expense Tracker — Frontend UI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 5 |
| Styling | TailwindCSS v4 + CSS |
| UI Primitives | Radix UI (Dialog, Select, Tabs, Slider, Popover, Dropdown, Label, Separator, Toast, Calendar) |
| Utility Components | `shadcn/ui`-style in `components/ui/` (button, card, input, dialog, select, date-picker, etc.) |
| Animations | Framer Motion (`AnimatePresence`, `motion.div`) |
| Icons | Lucide React |
| Charts | Recharts (Styled with Tailwind/shadcn patterns) |
| PWA | `vite-plugin-pwa` |

## Directory Structure

```
client/src/
├── api/                    # API client + interceptors
│   ├── client.js           # Fetch wrapper (ApiClient class singleton)
│   └── interceptors.js     # Request/response/error interceptors
├── components/
│   ├── animations/         # Reusable animation components
│   │   ├── animated-list.jsx
│   │   ├── count-up.jsx
│   │   └── electric-border.jsx
│   ├── common/             # Shared components (NotificationBell, WelcomeTour)
│   ├── layout/             # App layout (AppBar, MainBottomNav)
│   └── ui/                 # shadcn-style primitives
│       ├── button.jsx, card.jsx, input.jsx, dialog.jsx
│       ├── select.jsx, tabs.jsx, badge.jsx, alert.jsx
│       ├── combobox.jsx, label.jsx, progress.jsx
│       ├── separator.jsx, skeleton.jsx, slider.jsx
│       └── (each wraps Radix UI with project styling)
├── constants/              # API endpoints, app config, routes
├── features/               # Feature-based pages
│   ├── auth/               # Landing, Login, Register pages
│   ├── budget/             # Budget management page
│   ├── categories/         # Category CRUD
│   ├── dashboard/          # Dashboard with actions
│   ├── recurring/          # Recurring transactions
│   ├── reports/            # Reports page
│   ├── settings/           # Settings page
│   ├── smart-entry/        # CSV import, Receipt scanner, Voice input
│   └── transactions/       # Transaction list, form, chart
├── hooks/                  # Custom hooks (useAuth, useTransactions, etc.)
├── services/               # API service functions per domain
├── lib/                    # Utility library (utils.js with cn() helper)
└── routes.jsx              # React Router route definitions
```

## Component Patterns

### UI Primitives (components/ui/)

All follow the `shadcn/ui` pattern — wrapping Radix primitives with project styling:

```jsx
import { cn } from "../../lib/utils.js";

const Button = ({ className, variant = "default", ...props }) => (
    <button className={cn("base-styles", variantStyles[variant], className)} {...props} />
);
```

The `cn()` utility merges Tailwind classes via `clsx` + `tailwind-merge`:

```javascript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) { return twMerge(clsx(inputs)); }
```

### Feature Pages

Feature pages live in `features/<domain>/pages/` with component subdirectories:

```
features/transactions/
├── components/
│   ├── TransactionChart.jsx
│   ├── TransactionForm.jsx
│   └── TransactionsList.jsx
└── pages/
    └── TransactionsPage.jsx
```

### App Layout

- `AppBar` — top navigation bar
- `MainBottomNav` — bottom navigation (mobile-first)
- `AnimatePresence` + `motion.div` for page transitions

```jsx
<AnimatePresence mode="wait">
    <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
    >
        <Outlet />
    </motion.div>
</AnimatePresence>
```

## Styling Rules

- **TailwindCSS v4** — uses `@tailwindcss/postcss` and CSS-native config
- **Icons**: Use `lucide-react` exclusively.
- **MUI**: **STRICTLY PROHIBITED**. We are actively migrating away from Material UI. Replace any MUI component with `shadcn/ui` + Tailwind CSS. Use `Recharts` for charts and `react-day-picker` for date pickers.
- **Animations**: Framer Motion for page transitions and interactive states
- **Responsive**: Mobile-first with bottom nav pattern

## Material UI (MUI) to Shadcn/UI Migration

We are shifting completely from Material UI to a modern `shadcn/ui` + TailwindCSS ecosystem for a premium, production-grade design. When handling legacy components:

1. **Charts**: Replace `@devexpress` and MUI charts with **Recharts** (styled with Tailwind/shadcn patterns).
2. **Date Pickers**: Replace `@mui/x-date-pickers` with `shadcn/ui` Calendar component (`react-day-picker` + `date-fns`).
3. **Icons**: Replace `@mui/icons-material` with `lucide-react`.
4. **Layouts**: Replace MUI `<Grid>`, `<Box>`, `<Container>`, or `<Stack>` with standard Tailwind CSS (`flex`, `grid`, `container`, `space-y-*`).
5. **Typography**: Replace `<Typography>` with standard HTML elements and Tailwind text utilities (`text-lg font-semibold text-gray-900 dark:text-gray-100`).
6. **Inputs / Forms**: Replace `<TextField>`, `<Select>` with `components/ui/input`, `components/ui/select`, etc.

## NEVER Do

- Import entire icon libraries (`import * from "lucide-react"`)
- Use ANY `@mui/*` packages or components. They must be removed and replaced.
- Use `process.env.XXX` — always `import.meta.env.VITE_XXX` (Vite requirement)
- Skip loading states — use skeleton loaders from `components/ui/skeleton.jsx`

## Related Skills

- **expense-state-api** — Redux store, hooks, and API service layer
- **expense-financial-logic** — domain logic behind the UI features
