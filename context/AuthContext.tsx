import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  id: string;
  username: string;
  cccd: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'FILLER';
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<AuthUser | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('auth_user').then(val => {
      if (val) setUserState(JSON.parse(val));
    });
  }, []);

  const setUser = (u: AuthUser | null) => {
    setUserState(u);
    if (u) {
      AsyncStorage.setItem('auth_user', JSON.stringify(u));
    } else {
      AsyncStorage.removeItem('auth_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);