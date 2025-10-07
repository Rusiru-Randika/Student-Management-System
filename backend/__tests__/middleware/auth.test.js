const jwt = require('jsonwebtoken');
const { verifyToken } = require('../../src/middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('should call next() when valid token is provided', () => {
      const token = jwt.sign({ id: 1, username: 'testuser' }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      req.headers.authorization = `Bearer ${token}`;

      verifyToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual(
        expect.objectContaining({
          id: 1,
          username: 'testuser',
        })
      );
    });

    it('should return 401 when no authorization header is provided', () => {
      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied. No token provided.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', () => {
      req.headers.authorization = 'InvalidFormat token123';

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied. No token provided.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when token is invalid', () => {
      req.headers.authorization = 'Bearer invalidtoken';

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid or expired token.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when token is expired', () => {
      const token = jwt.sign({ id: 1, username: 'testuser' }, process.env.JWT_SECRET, {
        expiresIn: '-1h', // Expired token
      });
      req.headers.authorization = `Bearer ${token}`;

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid or expired token.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when token has wrong secret', () => {
      const token = jwt.sign({ id: 1, username: 'testuser' }, 'wrong-secret', {
        expiresIn: '1h',
      });
      req.headers.authorization = `Bearer ${token}`;

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid or expired token.',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
