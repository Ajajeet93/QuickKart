# Contributing to QuickKart

## Gitflow Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code only. Protected branch. |
| `develop` | Integration branch. All features merge here first. |
| `feature/*` | New features — branch off `develop`, merge back via PR. |
| `fix/*` | Bug fixes — branch off `develop`. |
| `hotfix/*` | Critical production fixes — branch off `main`. |

```
main ──────────────────────────────────────────► (production)
  └── develop ─────────────────────────────────► (integration)
        ├── feature/add-payment-gateway
        ├── feature/subscription-cron
        └── fix/cart-null-reference
```

## Getting Started

```bash
# Clone repository
git clone https://github.com/Ajajeet93/QuickKart.git
cd QuickKart

# Start a feature
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

## Commit Message Format (Conventional Commits)

All commit messages MUST follow this format:

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

### Types
| Type | When to use |
|------|------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style, formatting |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |
| `security` | Security fixes |

### Examples
```bash
git commit -m "feat(cart): add null safety for deleted products"
git commit -m "fix(auth): remove redundant double logout call"
git commit -m "docs: update README with setup instructions"
```

## Pull Request Process

1. Push your branch: `git push origin feature/your-feature-name`
2. Open a PR from your branch → `develop`
3. PR title must follow Conventional Commits format
4. PR must pass all checks (ESLint, npm audit)
5. Requires 1 reviewer approval before merge
6. Squash-merge to keep history clean

## Code Style

- **JavaScript**: ESLint with security plugin (`eslint-plugin-security`)
- **Imports**: CommonJS (`require`) on server, ESM (`import`) on client/admin
- **Indentation**: 4 spaces
- **Quotes**: Single quotes on server, double quotes on client JSX

## Security

- Never commit `.env` files (they are in `.gitignore`)
- Never commit API keys or secrets
- Run `npm audit` before every PR

## Questions?

Contact: Ajeet Yadav — [LinkedIn](https://www.linkedin.com/in/ajeet930/) | [GitHub](https://github.com/Ajajeet93)
