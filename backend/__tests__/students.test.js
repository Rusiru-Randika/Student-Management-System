const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const studentRoutes = require('../src/routes/students');
const db = require('../src/db');

// Mock database
jest.mock('../src/db');

const app = express();
app.use(express.json());
app.use('/api/students', studentRoutes);

describe('Students Routes', () => {
  let token;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    token = jwt.sign({ id: 1, username: 'testuser' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  });

  describe('GET /api/students', () => {
    it('should return paginated students with search', async () => {
      const mockStudents = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '1234567890', course: 'CS', enrolment_date: '2024-01-01', is_active: true },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', course: 'IT', enrolment_date: '2024-01-02', is_active: true },
      ];
      
      db.query
        .mockResolvedValueOnce({ rows: mockStudents })
        .mockResolvedValueOnce({ rows: [{ total: '2' }] });

      const response = await request(app)
        .get('/api/students')
        .query({ search: 'John', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.students).toHaveLength(2);
      expect(response.body.pagination).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app).get('/api/students');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    it('should return 400 when token is invalid', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired token.');
    });

    it('should handle default pagination values', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ total: '0' }] });

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM students WHERE name ILIKE $1 AND is_active = true ORDER BY id DESC LIMIT $2 OFFSET $3',
        ['%%', 10, 0]
      );
    });
  });

  describe('GET /api/students/:id', () => {
    it('should return a student by id', async () => {
      const mockStudent = { 
        id: 1, 
        name: 'John Doe', 
        email: 'john@example.com', 
        phone: '1234567890', 
        course: 'CS', 
        enrolment_date: '2024-01-01',
        is_active: true 
      };
      
      db.query.mockResolvedValue({ rows: [mockStudent] });

      const response = await request(app)
        .get('/api/students/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStudent);
    });

    it('should return 404 when student not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/students/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Student not found');
    });

    it('should return 400 when id is invalid', async () => {
      const response = await request(app)
        .get('/api/students/invalid')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid student id');
    });

    it('should return 400 when id is negative', async () => {
      const response = await request(app)
        .get('/api/students/-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid student id');
    });
  });

  describe('POST /api/students', () => {
    it('should create a new student', async () => {
      const newStudent = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        course: 'CS',
        enrolment_date: '2024-01-01',
      };

      db.query.mockResolvedValue({ rows: [{ id: 1 }] });

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${token}`)
        .send(newStudent);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: 1, ...newStudent });
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'john@example.com',
          phone: '1234567890',
          course: 'CS',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Name is required');
    });

    it('should return 400 when name is empty string', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '   ',
          email: 'john@example.com',
          phone: '1234567890',
          course: 'CS',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Name is required');
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          phone: '1234567890',
          course: 'CS',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email is required');
    });
  });

  describe('PUT /api/students/:id', () => {
    it('should update a student', async () => {
      const updateData = {
        name: 'John Updated',
        email: 'john.updated@example.com',
        phone: '1234567890',
        course: 'CS',
        enrolment_date: '2024-01-01',
      };

      db.query.mockResolvedValue({ rowCount: 1 });

      const response = await request(app)
        .put('/api/students/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Student updated successfully');
    });

    it('should return 404 when student not found', async () => {
      db.query.mockResolvedValue({ rowCount: 0 });

      const response = await request(app)
        .put('/api/students/999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          course: 'CS',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Student not found');
    });

    it('should return 400 when id is invalid', async () => {
      const response = await request(app)
        .put('/api/students/invalid')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          email: 'john@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid student id');
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .put('/api/students/1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'john@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Name is required');
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('should soft delete a student', async () => {
      db.query.mockResolvedValue({ rowCount: 1 });

      const response = await request(app)
        .delete('/api/students/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE students SET is_active = false WHERE id = $1',
        [1]
      );
    });

    it('should return 404 when student not found', async () => {
      db.query.mockResolvedValue({ rowCount: 0 });

      const response = await request(app)
        .delete('/api/students/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Student not found');
    });

    it('should return 400 when id is invalid', async () => {
      const response = await request(app)
        .delete('/api/students/invalid')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid student id');
    });
  });
});
