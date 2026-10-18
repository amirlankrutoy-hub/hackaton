"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { APP_MODE } from "@/lib/config";
import { demoStore } from "@/lib/demoStore";
import { getBrowserSupabase } from "@/lib/supabase/browser";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (APP_MODE === "demo") {
      // localStorage доступен только в браузере — читаем после монтирования.
      Promise.resolve().then(() => {
        const acc = demoStore.sessionUser();
        setUser(acc ? { id: acc.id, email: acc.email, name: acc.name } : null);
        setReady(true);
      });
      return;
    }
    const supabase = getBrowserSupabase();
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      setUser(u ? { id: u.id, email: u.email, name: u.user_metadata?.name } : null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      setUser(u ? { id: u.id, email: u.email, name: u.user_metadata?.name } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const register = useCallback(async ({ name, username, email, password, grade }) => {
    if (APP_MODE === "demo") {
      const acc = await demoStore.register({ name, username, email, password, grade });
      setUser({ id: acc.id, email: acc.email, name: acc.name });
      return { needsConfirmation: false, account: acc };
    }
    const supabase = getBrowserSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, username, grade } },
    });
    if (error) throw new Error(translateAuthError(error.message));
    return { needsConfirmation: !data.session };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    if (APP_MODE === "demo") {
      const acc = await demoStore.login({ email, password });
      setUser({ id: acc.id, email: acc.email, name: acc.name });
      return;
    }
    const { error } = await getBrowserSupabase().auth.signInWithPassword({ email, password });
    if (error) throw new Error(translateAuthError(error.message));
  }, []);

  const logout = useCallback(async () => {
    if (APP_MODE === "demo") demoStore.logout();
    else await getBrowserSupabase().auth.signOut();
    setUser(null);
  }, []);

  const getToken = useCallback(async () => {
    if (APP_MODE === "demo") return null;
    const { data } = await getBrowserSupabase().auth.getSession();
    return data.session?.access_token || null;
  }, []);

  const value = useMemo(() => ({ mode: APP_MODE, user, ready, register, login, logout, getToken }), [user, ready, register, login, logout, getToken]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function translateAuthError(message) {
  if (/invalid login/i.test(message)) return "Неверный email или пароль";
  if (/already registered/i.test(message)) return "Пользователь с таким email уже зарегистрирован";
  if (/password/i.test(message)) return "Пароль слишком простой: минимум 6 символов";
  if (/email/i.test(message)) return "Проверьте адрес электронной почты";
  return message;
}

export function useAuth() {
  return useContext(AuthContext);
}
