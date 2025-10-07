const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRoutes = require('../src/routes/auth');
const db = require('../src/db');

// Mock database
jest.mock('../src/db');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: hashedPassword,
      };

      db.query.mockResolvedValue({ rows: [mockUser] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.username).toBe('testuser');
      expect(decoded.id).toBe(1);
    });

    it('should return 400 when username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username and password are required');
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username and password are required');
    });

    it('should return 401 when user does not exist', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 when password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: hashedPassword,
      };

      db.query.mockResolvedValue({ rows: [mockUser] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should handle database errors', async () => {
      db.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(500);
    });
  });
});
