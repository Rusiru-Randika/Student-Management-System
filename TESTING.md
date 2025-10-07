# Testing Documentation

## Overview

This document provides information about the unit tests implemented for the Student Management System web application.

## Test Structure

### Backend Tests (Jest + Supertest)

Located in `backend/__tests__/`

#### Test Files:

- `auth.test.js` - Tests for authentication routes
- `students.test.js` - Tests for student CRUD operations
- `middleware/auth.test.js` - Tests for JWT authentication middleware

#### Coverage:

- ✅ Login endpoint (valid/invalid credentials)
- ✅ Student CRUD operations (Create, Read, Update, Delete)
- ✅ Authentication middleware (token validation)
- ✅ Input validation
- ✅ Error handling
- ✅ Pagination and search functionality

### Frontend Tests (Vitest + React Testing Library)

Located in `frontend/src/`

#### Test Files:

- `components/StudentForm.test.jsx` - Tests for student form component
- `components/StudentList.test.jsx` - Tests for student list component
- `context/AuthContext.test.jsx` - Tests for authentication context
- `services/api.test.js` - Tests for API service

#### Coverage:

- ✅ Component rendering
- ✅ User interactions (form input, button clicks)
- ✅ Form validation
- ✅ API calls and mocking
- ✅ Authentication flow
- ✅ Error handling
- ✅ Search and pagination

## Running Tests

### Backend Tests

```bash
cd backend

# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm test -- --coverage
```

### Frontend Tests

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage

# Run tests in UI mode
npm test -- --ui
```

## Test Configuration

### Backend (Jest)

Configuration file: `backend/jest.config.js`

- **Test Environment**: Node.js
- **Test Pattern**: `**/__tests__/**/*.test.js`
- **Coverage**: Excludes `node_modules` and main entry point

### Frontend (Vitest)

Configuration file: `frontend/vite.config.js`

- **Test Environment**: jsdom (browser simulation)
- **Setup File**: `src/test/setup.js`
- **Coverage Provider**: v8
- **Global Utilities**: Available without imports

## Writing New Tests

### Backend Example

```javascript
const request = require("supertest");
const app = require("../src/index");

describe("New Feature", () => {
  it("should do something", async () => {
    const response = await request(app)
      .get("/api/endpoint")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
  });
});
```

### Frontend Example

```javascript
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Mock External Dependencies**: Use mocks for API calls and database queries
3. **Test User Behavior**: Focus on how users interact with the application
4. **Clear Test Names**: Describe what the test does
5. **Arrange-Act-Assert**: Structure tests with setup, action, and verification
6. **Clean Up**: Reset mocks and state between tests

## Continuous Integration

Tests should be run automatically in CI/CD pipelines before deploying:

```yaml
# Example GitHub Actions workflow
- name: Run Backend Tests
  run: |
    cd backend
    npm install
    npm test

- name: Run Frontend Tests
  run: |
    cd frontend
    npm install
    npm test
```

## Coverage Goals

- **Backend**: Aim for >80% code coverage
- **Frontend**: Aim for >70% code coverage
- **Critical Paths**: 100% coverage for authentication and data validation

## Troubleshooting

### Common Issues

1. **Mock not working**: Ensure `jest.clearAllMocks()` is called in `beforeEach`
2. **Async test timeout**: Increase timeout or check for missing `await`
3. **Component not found**: Check if component is properly exported
4. **Token errors**: Verify `process.env.JWT_SECRET` is set in tests

### Debug Mode

```bash
# Backend
node --inspect-brk node_modules/.bin/jest --runInBand

# Frontend
npm test -- --inspect-brk
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
