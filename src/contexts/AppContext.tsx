import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type Lang = "am" | "en";

export interface MockUser {
  id: string;
  full_name: string;
  phone_number: string;
  address: string;
  email: string;
  role: "admin" | "user";
}

interface AppContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (am: string, en: string) => string;
  user: MockUser | null;
  signIn: (u: MockUser) => void;
  signOut: () => void;
  isAdmin: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_USER = "ekub.mockUser";
const STORAGE_LANG = "ekub.lang";

const DEFAULT_USER: MockUser = {
  id: "00000000-0000-0000-0000-000000000001",
  full_name: "Abebe Bikila",
  phone_number: "+251911223344",
  address: "Bole, Addis Ababa",
  email: "abebe@ekub.demo",
  role: "user",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "am";
    return (localStorage.getItem(STORAGE_LANG) as Lang) || "am";
  });
  const [user, setUser] = useState<MockUser | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_USER);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_LANG, lang);
    document.documentElement.lang = lang === "am" ? "am" : "en";
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);

  const signIn = (u: MockUser) => {
    setUser(u);
    localStorage.setItem(STORAGE_USER, JSON.stringify(u));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_USER);
  };

  const value = useMemo<AppContextValue>(
    () => ({
      lang,
      setLang,
      t: (am, en) => (lang === "am" ? am : en),
      user,
      signIn,
      signOut,
      isAdmin: user?.role === "admin",
    }),
    [lang, user],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export const DEMO_USER = DEFAULT_USER;
export const DEMO_ADMIN: MockUser = {
  id: "00000000-0000-0000-0000-0000000000ad",
  full_name: "Admin Selamawit",
  phone_number: "+251922334455",
  address: "Kazanchis, Addis Ababa",
  email: "admin@ekub.demo",
  role: "admin",
};
