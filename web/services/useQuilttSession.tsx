'use client';
import React from 'react';
import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { message } from 'antd';

interface QuilttSession {
  token: string;
  userId: string;
  expiresAt: string;
  uid?: string;
  profile_id?: string;
}

interface QuilttContextType {
  session: QuilttSession | null;
  isConnected: boolean;
  loading: boolean;
  connectBank: (email: string, userId: string) => Promise<boolean>;
  disconnect: () => void;
}

type ConnectBankResponse = {
  token?: string;
  userId?: string;
  profile_id?: string;
  expiresAt?: string;
  uid?: string;
  error?: string;
};

const QuilttContext = createContext<QuilttContextType | null>(null);

export const QuilttProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<QuilttSession | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedSession = localStorage.getItem('quiltt_session');
    if (!savedSession) return;

    try {
      const parsedSession: QuilttSession = JSON.parse(savedSession);

      const expiresAt = new Date(parsedSession.expiresAt);
      if (Number.isNaN(expiresAt.getTime())) {
        localStorage.removeItem('quiltt_session');
        return;
      }

      if (expiresAt > new Date()) {
        setSession(parsedSession);
      } else {
        localStorage.removeItem('quiltt_session');
      }
    } catch {
      localStorage.removeItem('quiltt_session');
    }
  }, []);

  const connectBank = useCallback(
    async (email: string, userId: string): Promise<boolean> => {
      setLoading(true);

      try {
        const response = await fetch('/server/api/connect/bank', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentUser: {
              uid: userId,
              email,
            },
          }),
        });

        const data: ConnectBankResponse = await response.json();

        if (response.ok && data.token && data.expiresAt) {
          const newSession: QuilttSession = {
            token: data.token,
            userId: (data.userId ?? data.profile_id) as string,
            expiresAt: data.expiresAt,
            uid: data.uid,
            profile_id: data.profile_id,
          };

          setSession(newSession);
          localStorage.setItem('quiltt_session', JSON.stringify(newSession));

          message.success('Bank connection established successfully!');
          return true;
        } else {
          message.error(data.error || 'Failed to connect bank account');
          return false;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error connecting bank:', error);
        message.error('Network error occurred while connecting bank');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const disconnect = useCallback(() => {
    setSession(null);
    localStorage.removeItem('quiltt_session');
    message.success('Bank account disconnected');
  }, []);

  const value = useMemo<QuilttContextType>(
    () => ({
      session,
      isConnected: !!session,
      loading,
      connectBank,
      disconnect,
    }),
    [session, loading, connectBank, disconnect]
  );

  return (
    <QuilttContext.Provider value={value}>{children}</QuilttContext.Provider>
  );
};

export const useQuilttSession = (): QuilttContextType => {
  const context = useContext(QuilttContext);
  if (!context) {
    throw new Error('useQuilttSession must be used within QuilttProvider');
  }
  return context;
};
