import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types/finance.ts';
import {
  getAllUsers,
  getCurrentUser,
  setCurrentUserId,
  saveUser,
  initializeStorage
} from '../lib/storage.ts';

interface AuthContextType {
  user: UserProfile | null;
  allUsers: UserProfile[];
  isAuthenticated: boolean;
  isAppLocked: boolean;
  unlockApp: (passOrPin: string) => boolean;
  lockApp: () => void;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { fullName: string; username: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  setSecurityPin: (newPin: string) => void;
  updatePassword: (oldPass: string, newPass: string) => { success: boolean; error?: string };
  toggleAppLock: (enabled: boolean) => void;
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  // By default, if an authenticated session exists and app lock is enabled, start locked!
  const [isAppLocked, setIsAppLocked] = useState<boolean>(true);

  useEffect(() => {
    initializeStorage();
    const current = getCurrentUser();
    setUser(current);
    setAllUsers(getAllUsers());
    // If user has lock enabled (default true), require unlock before accessing page!
    if (current && current.isAppLockEnabled !== false) {
      setIsAppLocked(true);
    } else {
      setIsAppLocked(false);
    }
  }, []);

  const refreshUsers = () => {
    const users = getAllUsers();
    setAllUsers(users);
    const current = getCurrentUser();
    setUser(current);
  };

  const unlockApp = (passOrPin: string): boolean => {
    if (!user) return false;
    const clean = passOrPin.trim();
    const userPass = user.password || 'password123';
    const userPin = user.securityPin || '123456';

    if (clean === userPass || clean === userPin) {
      setIsAppLocked(false);
      return true;
    }
    return false;
  };

  const lockApp = () => {
    setIsAppLocked(true);
  };

  const setSecurityPin = (newPin: string) => {
    if (!user) return;
    const cleanPin = newPin.trim().replace(/[^0-9]/g, '');
    updateProfile({ securityPin: cleanPin });
  };

  const updatePassword = (oldPass: string, newPass: string): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: 'Tidak ada sesi aktif.' };
    const currentPass = user.password || 'password123';
    if (oldPass !== currentPass) {
      return { success: false, error: 'Password lama salah.' };
    }
    if (newPass.length < 8) {
      return { success: false, error: 'Password baru minimal 8 karakter.' };
    }
    updateProfile({ password: newPass });
    return { success: true };
  };

  const toggleAppLock = (enabled: boolean) => {
    updateProfile({ isAppLockEnabled: enabled });
  };

  const login = async (identifier: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const trimmed = identifier.trim().toLowerCase();
    const users = getAllUsers();
    const found = users.find(
      (u) => u.username.toLowerCase() === trimmed || u.email.toLowerCase() === trimmed
    );

    if (!found) {
      return { success: false, error: 'Username atau email tidak terdaftar.' };
    }

    // Verify password if provided
    const expectedPass = found.password || 'password123';
    if (password && password !== expectedPass) {
      return { success: false, error: 'Password salah. Silakan coba lagi.' };
    }

    setCurrentUserId(found.id);
    setUser(found);
    setIsAppLocked(false); // Unlocked on successful login
    return { success: true };
  };

  const register = async (data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanUsername = data.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const cleanEmail = data.email.trim().toLowerCase();

    if (!cleanUsername) {
      return { success: false, error: 'Username hanya boleh huruf, angka, dan underscore (_).' };
    }
    if (data.password.length < 8) {
      return { success: false, error: 'Password minimal 8 karakter.' };
    }

    const users = getAllUsers();
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: 'Username sudah digunakan oleh akun lain.' };
    }
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain.' };
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      username: cleanUsername,
      fullName: data.fullName.trim(),
      email: cleanEmail,
      password: data.password,
      securityPin: '123456',
      isAppLockEnabled: true,
      currency: 'IDR',
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);
    setCurrentUserId(newUser.id);
    setUser(newUser);
    setAllUsers(getAllUsers());
    setIsAppLocked(false);

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('mitra_keuangan_current_user_id');
    setUser(null);
    setIsAppLocked(true);
  };

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    const users = getAllUsers();
    const target = users.find((u) => u.id === userId) || null;
    setUser(target);
    if (target && target.isAppLockEnabled !== false) {
      setIsAppLocked(true);
    } else {
      setIsAppLocked(false);
    }
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    saveUser(updated);
    setUser(updated);
    setAllUsers(getAllUsers());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        allUsers,
        isAuthenticated: !!user,
        isAppLocked,
        unlockApp,
        lockApp,
        login,
        register,
        logout,
        switchUser,
        updateProfile,
        setSecurityPin,
        updatePassword,
        toggleAppLock,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
