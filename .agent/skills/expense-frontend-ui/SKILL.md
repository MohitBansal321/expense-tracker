---
name: expense-frontend-ui
description: Use this skill when building or modifying React components, pages, layouts, or any UI in the Expense Tracker frontend. Covers the tech stack (React 18 + Vite + TailwindCSS v4 + Radix UI + Framer Motion + Lucide icons), component organization (features/ directory), UI primitive patterns (shadcn-style components/ui/), mobile-first design, PWA features, and animation patterns. Trigger when user mentions UI, components, pages, design, layout, styling, TailwindCSS, Radix, animations, responsive design, or mobile.

# Expense Tracker — Frontend UI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 5 |
| Styling | TailwindCSS v4 + CSS |
| UI Primitives | Radix UI (Dialog, Select, Tabs, Slider, Popover, Dropdown, Label, Separator, Toast) |
| Utility Components | `shadcn/ui`-style in `components/ui/` (button, card, input, dialog, select, etc.) |
| Animations | Framer Motion (`AnimatePresence`, `motion.div`) |
| Icons | Lucide React (tree-shaken) |
| Charts | DevExpress React Chart (via `@devexpress/dx-react-chart-material-ui`) |
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
- **Icons**: Always tree-shaken: `import { Plus, Trash2 } from "lucide-react"` — NEVER `import * from "lucide-react"`
- **MUI**: Only for DatePicker and chart components. **Never** for buttons, inputs, modals, cards
- **Animations**: Framer Motion for page transitions and interactive states
- **Responsive**: Mobile-first with bottom nav pattern

## NEVER Do

- Import entire icon libraries (`import * from "lucide-react"`)
- Use MUI for basic UI (buttons, inputs, modals, cards)
- Use `process.env.XXX` — always `import.meta.env.VITE_XXX` (Vite requirement)
- Skip loading states — use skeleton loaders from `components/ui/skeleton.jsx`

## Related Skills

- **expense-state-api** — Redux store, hooks, and API service layer
- **expense-financial-logic** — domain logic behind the UI features
