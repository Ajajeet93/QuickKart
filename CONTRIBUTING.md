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

# Install root dependencies (Husky pre-commit hooks)
npm install

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
| `ci` | CI/CD pipeline changes |
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
git commit -m "ci: add npm audit stage to Jenkinsfile"
git commit -m "docs: update README with Docker Compose instructions"
```

## Pull Request Process

1. Push your branch: `git push origin feature/your-feature-name`
2. Open a PR from your branch → `develop`
3. PR title must follow Conventional Commits format
4. PR must pass all CI checks (ESLint, npm audit)
5. Requires 1 reviewer approval before merge
6. Squash-merge to keep history clean

## Pre-Commit Hooks (Husky)

A Husky pre-commit hook runs **ESLint** automatically before every commit.
If ESLint reports errors, the commit is rejected — fix the errors first.

```bash
# To bypass in emergencies (NOT recommended):
git commit --no-verify -m "emergency fix"
```

## Code Style

- **JavaScript**: ESLint with security plugin (`eslint-plugin-security`)
- **Imports**: CommonJS (`require`) on server, ESM (`import`) on client/admin
- **Indentation**: 4 spaces
- **Quotes**: Single quotes on server, double quotes on client JSX

## Security

- Never commit `.env` files (they are in `.gitignore`)
- Never commit AWS credentials or API keys
- Use `AWS Secrets Manager` for all production secrets
- Run `npm audit` before every PR

## Questions?

Contact: Ajeet Yadav — [LinkedIn](https://www.linkedin.com/in/ajeet930/) | [GitHub](https://github.com/Ajajeet93)
