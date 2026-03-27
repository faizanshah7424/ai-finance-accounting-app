# Contributing to AI Finance & Accounting App

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🎯 How to Contribute

### 1. Fork the Repository
Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork
```bash
git clone https://github.com/your-username/ai-finance-accounts-app.git
cd ai-finance-accounts-app
```

### 3. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes
- Follow the existing code style
- Add comments for complex logic
- Test your changes thoroughly

### 5. Commit Your Changes
```bash
git commit -m "feat: add your feature description"
```

### 6. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

### 7. Open a Pull Request
Go to the original repository and click "New Pull Request".

---

## 📝 Code Style Guidelines

### JavaScript/Node.js
- Use `const` and `let` (no `var`)
- Use async/await for asynchronous code
- Follow ESLint recommendations
- Use meaningful variable names

### Python (AI Service)
- Follow PEP 8 style guide
- Use type hints where possible
- Add docstrings to functions
- Use descriptive variable names

### TypeScript/React
- Use TypeScript for type safety
- Use functional components with hooks
- Follow React best practices
- Add proper type definitions

---

## 🧪 Testing

Before submitting a PR, ensure:

1. **Backend tests pass:**
   ```bash
   npm test
   ```

2. **Frontend builds successfully:**
   ```bash
   cd web
   npm run build
   ```

3. **AI service runs without errors:**
   ```bash
   cd analysis-api
   uvicorn main:app --reload
   ```

---

## 📋 Pull Request Guidelines

### PR Title Format
```
type: brief description
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added where necessary
- [ ] Documentation updated
```

---

## 🐛 Reporting Issues

### Bug Reports
Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots (if applicable)

### Feature Requests
Include:
- Problem statement
- Proposed solution
- Use cases
- Alternatives considered

---

## 💬 Community

- **Discussions**: For questions and ideas
- **Issues**: For bugs and feature requests
- **Email**: Contact maintainers for sensitive matters

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AI Finance & Accounting App! 🎉
