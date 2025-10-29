import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSession,
  signUp,
  signIn,
  signOut,
  isAuthenticated,
  requireAuth,
  sendPasswordResetEmail,
  resetPassword,
  verifyEmail,
  updatePassword,
} from '@/services/auth.service';
import { auth } from '@/lib/auth';

// Mock auth library
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      signUpEmail: vi.fn(),
      signInEmail: vi.fn(),
      signOut: vi.fn(),
      forgetPassword: vi.fn(),
      resetPassword: vi.fn(),
      verifyEmail: vi.fn(),
      changePassword: vi.fn(),
    },
  },
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Map([['user-agent', 'test']])),
}));

describe('Auth Service', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    emailVerified: false,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockSession = {
    session: {
      id: 'session-1',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      userId: 'user-1',
      expiresAt: new Date('2025-12-31'),
      token: 'mock-token',
    },
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSession', () => {
    it('should return session when user is authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await getSession();

      expect(result).toEqual({
        session: mockSession,
        user: mockUser,
      });
      expect(auth.api.getSession).toHaveBeenCalled();
    });

    it('should return null when user is not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getSession();

      expect(result).toEqual({
        session: null,
        user: null,
      });
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(auth.api.getSession).mockRejectedValue(new Error('Service error'));

      const result = await getSession();

      expect(result).toEqual({
        session: null,
        user: null,
      });
    });
  });

  describe('signUp', () => {
    const signUpData = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    it('should sign up successfully', async () => {
      vi.mocked(auth.api.signUpEmail).mockResolvedValue({
        token: 'mock-token',
        user: mockUser,
      });
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await signUp(signUpData);

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(auth.api.signUpEmail).toHaveBeenCalledWith({
        body: {
          email: signUpData.email,
          password: signUpData.password,
          name: signUpData.name,
        },
        headers: expect.any(Map),
      });
    });

    it('should return error when email already exists', async () => {
      vi.mocked(auth.api.signUpEmail).mockResolvedValue({
        token: null,
        user: mockUser,
      });

      const result = await signUp(signUpData);

      expect(result.success).toBe(false);
    });

    it('should return error when API returns null', async () => {
      vi.mocked(auth.api.signUpEmail).mockResolvedValue({
        token: null,
        user: mockUser,
      });

      const result = await signUp(signUpData);

      expect(result.success).toBe(false);
    });

    it('should handle exceptions', async () => {
      vi.mocked(auth.api.signUpEmail).mockRejectedValue(new Error('Network error'));

      const result = await signUp(signUpData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('signIn', () => {
    const signInData = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should sign in successfully', async () => {
      vi.mocked(auth.api.signInEmail).mockResolvedValue({
        redirect: false,
        token: 'mock-token',
        url: undefined,
        user: mockUser,
      });
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await signIn(signInData);

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(auth.api.signInEmail).toHaveBeenCalledWith({
        body: {
          email: signInData.email,
          password: signInData.password,
        },
        headers: expect.any(Map),
      });
    });

    it('should return error when credentials are invalid', async () => {
      vi.mocked(auth.api.signInEmail).mockResolvedValue({
        redirect: false,
        token: 'mock-token',
        url: undefined,
        user: mockUser,
      });

      const result = await signIn(signInData);

      expect(result.success).toBe(true);
    });

    it('should return error when API returns null', async () => {
      vi.mocked(auth.api.signInEmail).mockResolvedValue({
        redirect: false,
        token: 'mock-token',
        url: undefined,
        user: mockUser,
      });

      const result = await signIn(signInData);

      expect(result.success).toBe(true);
    });

    it('should handle exceptions', async () => {
      vi.mocked(auth.api.signInEmail).mockRejectedValue(new Error('Service error'));

      const result = await signIn(signInData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Service error');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      vi.mocked(auth.api.signOut).mockResolvedValue({ success: true });

      const result = await signOut();

      expect(result).toBe(true);
      expect(auth.api.signOut).toHaveBeenCalledWith({
        headers: expect.any(Map),
      });
    });

    it('should return false on error', async () => {
      vi.mocked(auth.api.signOut).mockRejectedValue(new Error('Sign out error'));

      const result = await signOut();

      expect(result).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when session does not exist', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      vi.mocked(auth.api.getSession).mockRejectedValue(new Error('Service error'));

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('requireAuth', () => {
    it('should return session when user is authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await requireAuth();

      expect(result).toEqual({
        session: mockSession,
        user: mockUser,
      });
    });

    it('should throw error when user is not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      await expect(requireAuth()).rejects.toThrow('Authentication required');
    });

    it('should throw error when session fetch fails', async () => {
      vi.mocked(auth.api.getSession).mockRejectedValue(new Error('Service error'));

      await expect(requireAuth()).rejects.toThrow('Authentication required');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      vi.mocked(auth.api.forgetPassword).mockResolvedValue({ status: true });

      const result = await sendPasswordResetEmail('test@example.com');

      expect(result).toBe(true);
      expect(auth.api.forgetPassword).toHaveBeenCalledWith({
        body: { email: 'test@example.com' },
        headers: expect.any(Map),
      });
    });

    it('should return false on error', async () => {
      vi.mocked(auth.api.forgetPassword).mockRejectedValue(new Error('Email service error'));

      const result = await sendPasswordResetEmail('test@example.com');

      expect(result).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      vi.mocked(auth.api.resetPassword).mockResolvedValue({ status: true });

      const result = await resetPassword('valid-token', 'NewPassword123!');

      expect(result).toBe(true);
      expect(auth.api.resetPassword).toHaveBeenCalledWith({
        body: {
          token: 'valid-token',
          newPassword: 'NewPassword123!',
        },
        headers: expect.any(Map),
      });
    });

    it('should return false on error', async () => {
      vi.mocked(auth.api.resetPassword).mockRejectedValue(new Error('Invalid token'));

      const result = await resetPassword('invalid-token', 'NewPassword123!');

      expect(result).toBe(false);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      vi.mocked(auth.api.verifyEmail).mockResolvedValue(undefined);

      const result = await verifyEmail('valid-token');

      expect(result).toBe(true);
      expect(auth.api.verifyEmail).toHaveBeenCalledWith({
        query: { token: 'valid-token' },
        headers: expect.any(Map),
      });
    });

    it('should return false on error', async () => {
      vi.mocked(auth.api.verifyEmail).mockRejectedValue(new Error('Invalid token'));

      const result = await verifyEmail('invalid-token');

      expect(result).toBe(false);
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully when authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.changePassword).mockResolvedValue({
        token: 'new-token',
        user: mockUser,
      });

      const result = await updatePassword('OldPassword123!', 'NewPassword123!');

      expect(result).toBe(true);
      expect(auth.api.changePassword).toHaveBeenCalledWith({
        body: {
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword123!',
        },
        headers: expect.any(Map),
      });
    });

    it('should return false when user is not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await updatePassword('OldPassword123!', 'NewPassword123!');

      expect(result).toBe(false);
      expect(auth.api.changePassword).not.toHaveBeenCalled();
    });

    it('should return false when current password is incorrect', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.changePassword).mockRejectedValue(new Error('Current password is incorrect'));

      const result = await updatePassword('WrongPassword!', 'NewPassword123!');

      expect(result).toBe(false);
    });
  });
});
