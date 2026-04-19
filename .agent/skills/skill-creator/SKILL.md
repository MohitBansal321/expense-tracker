---
name: skill-creator
description: Guide for creating effective skills for this project. Use this skill when creating a new skill or updating an existing skill that extends AI capabilities with specialized knowledge, workflows, or tool integrations for the Expense Tracker project.

# Skill Creator

Create and maintain skills for the Expense Tracker project.

## Skill Structure

```
skill-name/
├── SKILL.md          # Required — YAML frontmatter + markdown instructions
└── references/       # Optional — detailed docs loaded on-demand
    └── detailed-patterns.md
```

## SKILL.md Format

```markdown
---
name: skill-name
description: When to trigger this skill. Include what it does AND specific trigger words/contexts. This is the ONLY field used for matching.

# Skill Title

## Concise instructions...
(Keep under 500 lines. Move detailed reference material to references/ files.)
```

## Creating a New Skill

1. **Identify the need** — What knowledge does CI need that it doesn't already have?
2. **Gather concrete examples** — How will the skill be used?
3. **Create SKILL.md** in `.agent/skills/<skill-name>/SKILL.md`
4. **Write the frontmatter** — `name` + `description` (trigger conditions)
5. **Write instructions** — Concise, actionable, with code examples from THIS project
6. **Add references/** — For detailed patterns that don't need to always be in context
7. **Cross-reference** — Link to related skills in "Related Skills" section

## Principles

- **Project-specific** — Include actual file paths, patterns, and conventions from this codebase
- **Concise** — Only add information the AI doesn't already know
- **Examples > Explanations** — Show code patterns, not theory
- **Progressive disclosure** — Core in SKILL.md, details in references/

## Existing Skills

| Skill | Triggers On |
|-------|-------------|
| `expense-api-scaffold` | New endpoints, modules, scaffolding |
| `expense-auth-security` | Auth, JWT, passwords, protected routes |
| `expense-database` | MongoDB, Mongoose, schemas, queries, Redis |
| `expense-frontend-ui` | React components, UI, styling, animations |
| `expense-state-api` | Hooks, API calls, Redux, services |
| `expense-financial-logic` | Transactions, budgets, reports, analytics |
| `expense-deployment` | Deploy, env vars, server config, production |
| `skill-creator` | Creating or updating skills |
