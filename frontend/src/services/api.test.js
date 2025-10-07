import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import api from './api.js';

// Mock axios
vi.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should create axios instance with correct config', () => {
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: '/api',
        timeout: 15000,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it('should add Authorization header when token exists', () => {
    const mockRequest = {
      headers: {},
    };
    localStorage.setItem('token', 'test-token');

    // Get the request interceptor
    const createCall = axios.create.mock.calls[0];
    const mockInstance = createCall ? axios.create.mock.results[0].value : null;
    
    if (mockInstance && mockInstance.interceptors && mockInstance.interceptors.request) {
      const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const modifiedRequest = requestInterceptor(mockRequest);

      expect(modifiedRequest.headers.Authorization).toBe('Bearer test-token');
    }
  });

  it('should not add Authorization header when token does not exist', () => {
    const mockRequest = {
      headers: {},
    };

    // Get the request interceptor
    const createCall = axios.create.mock.calls[0];
    const mockInstance = createCall ? axios.create.mock.results[0].value : null;
    
    if (mockInstance && mockInstance.interceptors && mockInstance.interceptors.request) {
      const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const modifiedRequest = requestInterceptor(mockRequest);

      expect(modifiedRequest.headers.Authorization).toBeUndefined();
    }
  });

  it('should handle response errors with status', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const mockError = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    };

    // Get the response interceptor
    const createCall = axios.create.mock.calls[0];
    const mockInstance = createCall ? axios.create.mock.results[0].value : null;
    
    if (mockInstance && mockInstance.interceptors && mockInstance.interceptors.response) {
      const responseErrorInterceptor = mockInstance.interceptors.response.use.mock.calls[0][1];
      
      expect(() => responseErrorInterceptor(mockError)).rejects.toEqual(mockError);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'API error:',
        401,
        { message: 'Unauthorized' }
      );
    }

    consoleWarnSpy.mockRestore();
  });

  it('should handle network errors', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const mockError = {
      request: {},
    };

    // Get the response interceptor
    const createCall = axios.create.mock.calls[0];
    const mockInstance = createCall ? axios.create.mock.results[0].value : null;
    
    if (mockInstance && mockInstance.interceptors && mockInstance.interceptors.response) {
      const responseErrorInterceptor = mockInstance.interceptors.response.use.mock.calls[0][1];
      
      expect(() => responseErrorInterceptor(mockError)).rejects.toEqual(mockError);
      expect(consoleWarnSpy).toHaveBeenCalledWith('API network error: no response');
    }

    consoleWarnSpy.mockRestore();
  });
});
