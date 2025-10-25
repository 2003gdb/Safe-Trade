'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AdminUser, LoginRequest } from '../types';
import { adminAPIService } from '../services/AdminAPIService';

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AdminUser }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  
  useEffect(() => {
    const checkExistingAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const token = adminAPIService.getToken();
        if (token) {
          const isValid = await adminAPIService.validateToken();
          if (isValid) {
            
            
            
            const userData: AdminUser = {
              id: 0,
              email: 'admin@safetrade.com',
              name: 'Administrador',
              role: 'admin',
              lastLogin: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            };

            dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
          } else {
            dispatch({ type: 'LOGOUT' });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkExistingAuth();
  }, []);

  
  const login = async (credentials: LoginRequest) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await adminAPIService.login(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.admin });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  
  const logout = () => {
    adminAPIService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}