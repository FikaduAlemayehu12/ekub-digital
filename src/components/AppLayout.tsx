import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Globe, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp, DEMO_USER, DEMO_ADMIN } from "@/contexts/AppContext";

const NAV = [
  { to: "/", am: "መነሻ", en: "Home" },
  { to: "/dashboard", am: "ዳሽቦርድ", en: "Dashboard" },
  { to: "/join", am: "እቁብ ይቀላቀሉ", en: "Join Ekub" },
  { to: "/create", am: "እቁብ ይፍጠሩ", en: "Create Ekub" },
  { to: "/payments", am: "ክፍያዎች", en: "Payments" },
  { to: "/payouts", am: "ክፍያ ቀን", en: "Payouts" },
  { to: "/admin", am: "አስተዳዳሪ", en: "Admin" },
];

export default function AppLayout() {
  const { lang, setLang, t, user, signIn, signOut, isAdmin } = useApp();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => setOpen(false), [loc.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-background/75">
        <div className="container mx-auto flex items-center gap-4 py-3 px-4">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="inline-flex h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-warning items-center justify-center text-primary-foreground shadow-glow">
              እ
            </span>
            <span className="text-gradient-brand">Ekub<span className="text-foreground">Net</span></span>
          </NavLink>

          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`
                }
              >
                {t(n.am, n.en)}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === "am" ? "en" : "am")}
              className="gap-1.5"
            >
              <Globe className="h-4 w-4" />
              {lang === "am" ? "EN" : "አማ"}
            </Button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="text-right leading-tight hidden sm:block">
                  <div className="text-sm font-medium flex items-center gap-1 justify-end">
                    {isAdmin && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                    {user.full_name}
                  </div>
                  <div className="text-xs text-muted-foreground">{user.phone_number}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={signOut} title={t("ውጣ", "Sign out")}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1">
                <Button size="sm" variant="outline" onClick={() => signIn(DEMO_USER)}>
                  {t("እንደ ተጠቃሚ ግባ", "Sign in as user")}
                </Button>
                <Button size="sm" variant="default" onClick={() => signIn(DEMO_ADMIN)}>
                  {t("እንደ አስተዳዳሪ", "Sign in as admin")}
                </Button>
              </div>
            )}

            <button
              onClick={() => setOpen((o) => !o)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent"
              aria-label="menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-border/60 bg-background">
            <div className="container mx-auto px-4 py-3 grid gap-1">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === "/"}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? "bg-primary/15 text-primary" : "hover:bg-accent"
                    }`
                  }
                >
                  {t(n.am, n.en)}
                </NavLink>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {!user && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => signIn(DEMO_USER)}>
                      {t("ተጠቃሚ", "User")}
                    </Button>
                    <Button size="sm" onClick={() => signIn(DEMO_ADMIN)}>
                      {t("አስተዳዳሪ", "Admin")}
                    </Button>
                  </>
                )}
                {user && (
                  <Button size="sm" variant="outline" className="col-span-2" onClick={signOut}>
                    {t("ውጣ", "Sign out")} — {user.full_name}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/60 bg-surface/40">
        <div className="container mx-auto px-4 py-8 grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="font-bold text-gradient-brand text-lg mb-2">EkubNet</div>
            <p className="text-muted-foreground">
              {t(
                "ዘመናዊ፣ ግልጽ እና አስተማማኝ የኢትዮጵያ ዲጂታል እቁብ መድረክ።",
                "A modern, transparent and trustworthy Ethiopian digital Ekub platform.",
              )}
            </p>
          </div>
          <div>
            <div className="font-semibold mb-2">{t("አገናኞች", "Links")}</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>{t("የእቁብ ህግ", "Ekub rules")}</li>
              <li>{t("የግላዊነት መግለጫ", "Privacy")}</li>
              <li>{t("ድጋፍ", "Support")}</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">{t("እመኑን", "Trust")}</div>
            <p className="text-muted-foreground">
              {t(
                "ሁሉም ግብይቶች በቀጥታ ይመዘገባሉ። የክፍያ ሥርዓት ቅደም ተከተል ፍትሐዊና አውቶማቲክ ነው።",
                "Every transaction is logged in real-time. Payout ordering is fair and automated.",
              )}
            </p>
          </div>
        </div>
        <div className="text-center text-xs text-muted-foreground py-4 border-t border-border/40">
          © {new Date().getFullYear()} EkubNet · {t("ሁሉም መብቶች የተጠበቁ ናቸው", "All rights reserved")}
        </div>
      </footer>
    </div>
  );
}
