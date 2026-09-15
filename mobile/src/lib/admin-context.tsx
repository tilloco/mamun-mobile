import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, AdminModuleTree } from './api';
import { getAdminKey, saveAdminKey, clearAdminKey } from './storage';

interface AdminContextValue {
  adminKey: string | null;
  tree: AdminModuleTree[];
  isLoading: boolean;
  error: string | null;
  selectedLessonId: string | null;
  setSelectedLessonId: (id: string | null) => void;
  saveKey: (key: string) => Promise<void>;
  clearKey: () => Promise<void>;
  reload: () => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [tree, setTree] = useState<AdminModuleTree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const reload = useCallback(async (key?: string) => {
    const k = key ?? adminKey;
    if (!k) {
      setTree([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.listModulesAdmin(k);
      setTree(data);
    } catch (e: any) {
      setError(e.message || "Yuklab bo'lmadi");
      setTree([]);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  useEffect(() => {
    (async () => {
      const stored = await getAdminKey();
      if (stored) {
        setAdminKey(stored);
        await reload(stored);
      } else {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveKey = useCallback(
    async (key: string) => {
      await saveAdminKey(key);
      setAdminKey(key);
      await reload(key);
    },
    [reload],
  );

  const clearKey = useCallback(async () => {
    await clearAdminKey();
    setAdminKey(null);
    setTree([]);
  }, []);

  return (
    <AdminContext.Provider
      value={{ adminKey, tree, isLoading, error, selectedLessonId, setSelectedLessonId, saveKey, clearKey, reload: () => reload() }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin AdminProvider ichida ishlatilishi kerak');
  return ctx;
}