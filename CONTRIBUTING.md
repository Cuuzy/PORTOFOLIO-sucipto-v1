# Contributing to Profile Website

Thank you for your interest in contributing to this project! We welcome contributions from everyone.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/profile-website.git
   cd profile-website
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Workflow

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

## 📝 Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type when possible
- Use meaningful variable and function names

### React Components
- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Follow React best practices

### Backend APIs
- Document all API endpoints
- Use proper error handling
- Follow RESTful conventions
- Add input validation

### Styling
- Use Tailwind CSS classes
- Follow the existing design system
- Ensure responsive design
- Test on multiple screen sizes

## 🧪 Testing

- Write tests for new features
- Ensure all tests pass before submitting
- Test both frontend and backend changes
- Include edge cases in your tests

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows the style guidelines
- [ ] Tests pass locally
- [ ] No linting errors
- [ ] TypeScript compiles without errors
- [ ] Changes are documented

### PR Description
Include in your PR description:
- **What** changes you made
- **Why** you made these changes
- **How** to test the changes
- **Screenshots** (if UI changes)
- **Breaking changes** (if any)

### PR Title Format
Use conventional commit format:
- `feat: add new feature`
- `fix: resolve bug in component`
- `docs: update README`
- `style: improve button styling`
- `refactor: reorganize file structure`
- `test: add unit tests`
- `chore: update dependencies`

## 🐛 Bug Reports

When reporting bugs, please include:
- **Clear description** of the issue
- **Steps to reproduce** the bug
- **Expected behavior** vs actual behavior
- **Screenshots** or error messages
- **Environment details** (browser, OS, etc.)

## 💡 Feature Requests

For new features, please:
- **Check existing issues** to avoid duplicates
- **Describe the feature** clearly
- **Explain the use case** and benefits
- **Provide mockups** or examples if helpful

## 🔧 Development Setup

### Backend Development
- Located in `backend/` directory
- Uses Encore.ts framework
- PostgreSQL database
- Object storage for files

### Frontend Development
- Located in `frontend/` directory
- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui components

### Database Changes
- Create migration files in `backend/profile/migrations/`
- Use sequential numbering: `4_your_change.up.sql`
- Test migrations thoroughly

## 📚 Resources

- [Encore.ts Documentation](https://encore.dev/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## ❓ Questions?

If you have questions:
- Check existing [GitHub Issues](https://github.com/username/profile-website/issues)
- Start a [GitHub Discussion](https://github.com/username/profile-website/discussions)
- Contact the maintainers

## 🎉 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Special thanks in documentation

Thank you for contributing! 🚀
