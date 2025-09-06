import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';

type User = { id: string; email: string; name?: string; role: 'admin' | 'dispatcher' | 'viewer' } | null;

type AuthContextType = {
	user: User;
	token: string | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User>(null);
	const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));

	useEffect(() => {
		if (token) localStorage.setItem('auth_token', token);
		else localStorage.removeItem('auth_token');
	}, [token]);

	const login = useCallback(async (email: string, password: string) => {
		try {
			const res = await api.post('/auth/login', { email, password });
			if (res.data.success) {
				setToken(res.data.data.token);
				setUser(res.data.data.user);
			} else {
				throw new Error(res.data.message || 'Login failed');
			}
		} catch (error: any) {
			throw new Error(error.response?.data?.message || error.message || 'Login failed');
		}
	}, []);

	const logout = useCallback(() => {
		setToken(null);
		setUser(null);
	}, []);

	const value = useMemo(() => ({ user, token, login, logout }), [user, token, login, logout]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}


