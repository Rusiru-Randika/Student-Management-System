import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, AuthContext } from "./AuthContext.jsx";
import api from "../services/api.js";

// Mock the api module
vi.mock("../services/api.js");

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("should initialize with no user when no token in localStorage", async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

    const { result } = renderHook(() => React.useContext(AuthContext), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBe(null);
  });

  it("should initialize with user when valid token in localStorage", async () => {
    const mockToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    localStorageMock.getItem.mockReturnValue(mockToken);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

    const { result } = renderHook(() => React.useContext(AuthContext), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual({
      id: 1,
      username: "testuser",
      iat: 1516239022,
    });
  });

  it("should remove invalid token from localStorage", async () => {
    localStorageMock.getItem.mockReturnValue("invalid-token");

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

    const { result } = renderHook(() => React.useContext(AuthContext), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    expect(result.current.user).toBe(null);
  });

  it("should login successfully", async () => {
    const mockToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    api.post.mockResolvedValue({ data: { token: mockToken } });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

    const { result } = renderHook(() => React.useContext(AuthContext), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login("testuser", "password123");
    });

    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      username: "testuser",
      password: "password123",
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith("token", mockToken);
    expect(result.current.user).toEqual({
      id: 1,
      username: "testuser",
      iat: 1516239022,
    });
  });

  it("should handle login with invalid token response", async () => {
    api.post.mockResolvedValue({ data: { token: "invalid-token" } });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

    const { result } = renderHook(() => React.useContext(AuthContext), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.login("testuser", "password123");
      });
    }).rejects.toThrow("Invalid token received");

    expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    expect(result.current.user).toBe(null);
  });

  it("should logout successfully", async () => {
    const mockToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    localStorageMock.getItem.mockReturnValue(mockToken);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

    const { result } = renderHook(() => React.useContext(AuthContext), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeTruthy();

    act(() => {
      result.current.logout();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    expect(result.current.user).toBe(null);
  });
});
