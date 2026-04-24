import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  BellRing,
  CheckCircle2,
  Clock3,
  CreditCard,
  Crown,
  Globe2,
  LayoutDashboard,
  Layers3,
  Lock,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Language = "am" | "en";
type EkubType = "daily" | "weekly" | "monthly" | "quarterly";
type CalcMode = "contribution" | "target";

type CopyGroup = {
  am: string;
  en: string;
};

type NavKey = "dashboard" | "create" | "join" | "payments" | "payouts" | "admin";

type Metric = {
  label: CopyGroup;
  value: string;
  change: CopyGroup;
  icon: typeof Wallet;
};

type EkubCard = {
  title: CopyGroup;
  type: CopyGroup;
  contribution: string;
  target: string;
  members: string;
  progress: number;
  status: CopyGroup;
  due: CopyGroup;
};

type PaymentItem = {
  member: string;
  ekub: string;
  amount: string;
  due: string;
  status: CopyGroup;
  severity: "success" | "warning" | "info";
};

type PayoutItem = {
  order: number;
  member: string;
  date: string;
  amount: string;
  hidden: boolean;
};

const COPY = {
  brand: { am: "ዲጂታል እቁብ", en: "Digital Ekub" },
  tagline: {
    am: "የኢትዮጵያ እቁብን ወደ ዘመናዊ ዲጂታል የገንዘብ መዋቅር የሚያመጣ ደህንነቱ የተጠበቀ ስርዓት።",
    en: "A secure, transparent, automated platform that modernizes Ethiopian community savings groups.",
  },
  subtitle: {
    am: "Mock workflow ከ OTP ግባት እስከ payout orchestration ድረስ በሙሉ የተዘጋጀ።",
    en: "Complete mock workflow from OTP login to payout orchestration, ready for production architecture.",
  },
  loginTitle: { am: "OTP መግቢያ", en: "OTP sign in" },
  dashboard: { am: "ዳሽቦርድ", en: "Dashboard" },
  create: { am: "እቁብ ፍጠር", en: "Create Ekub" },
  join: { am: "እቁብ ተቀላቀል", en: "Join Ekub" },
  payments: { am: "ክፍያዎች", en: "Payments" },
  payouts: { am: "የመክፈያ ቅደም ተከተል", en: "Payout status" },
  admin: { am: "አስተዳዳሪ", en: "Admin" },
} satisfies Record<string, CopyGroup>;

const navItems: { key: NavKey; icon: typeof LayoutDashboard; label: CopyGroup }[] = [
  { key: "dashboard", icon: LayoutDashboard, label: COPY.dashboard },
  { key: "create", icon: Layers3, label: COPY.create },
  { key: "join", icon: Users, label: COPY.join },
  { key: "payments", icon: CreditCard, label: COPY.payments },
  { key: "payouts", icon: BadgeDollarSign, label: COPY.payouts },
  { key: "admin", icon: Crown, label: COPY.admin },
];

const metrics: Metric[] = [
  {
    label: { am: "የዛሬ ስብስብ", en: "Today’s pool" },
    value: "ETB 248,000",
    change: { am: "+12% ከትናንት", en: "+12% vs yesterday" },
    icon: Wallet,
  },
  {
    label: { am: "ንቁ እቁቦች", en: "Active ekubs" },
    value: "38",
    change: { am: "6 አዲስ በዚህ ሳምንት", en: "6 new this week" },
    icon: Sparkles,
  },
  {
    label: { am: "የክፍያ ትክክለኛነት", en: "On-time rate" },
    value: "93.8%",
    change: { am: "Grace 3 ቀን", en: "3-day grace window" },
    icon: ShieldCheck,
  },
  {
    label: { am: "ማዕዶት ክፍትነት", en: "Maedot coverage" },
    value: "18%",
    change: { am: "30% ከፍተኛ ገደብ", en: "30% max allowed" },
    icon: RefreshCcw,
  },
];

const liveEkubs: EkubCard[] = [
  {
    title: { am: "ሐበሻ ቤተሰብ ወርሃዊ", en: "Habesha Family Monthly" },
    type: { am: "ወርሃዊ", en: "Monthly" },
    contribution: "ETB 5,000",
    target: "ETB 100,000",
    members: "20/20",
    progress: 100,
    status: { am: "ንቁ", en: "Active" },
    due: { am: "ቀጣይ ክፍያ 3 ቀን ውስጥ", en: "Next due in 3 days" },
  },
  {
    title: { am: "ገበያ ነጋዴዎች ሳምንታዊ", en: "Market Traders Weekly" },
    type: { am: "ሳምንታዊ", en: "Weekly" },
    contribution: "ETB 2,500",
    target: "ETB 37,500",
    members: "15/15",
    progress: 86,
    status: { am: "እየተሞላ", en: "Filling" },
    due: { am: "Maedot 2 ቦታ ሞልቷል", en: "2 Maedot slots filled" },
  },
  {
    title: { am: "የቀን እቁብ ለአርሶ አደር", en: "Daily Agro Circle" },
    type: { am: "ዕለታዊ", en: "Daily" },
    contribution: "ETB 750",
    target: "ETB 9,000",
    members: "12/12",
    progress: 68,
    status: { am: "ክፍያ በመሰብሰብ ላይ", en: "Collecting" },
    due: { am: "Penalty watch 1 አባል", en: "1 member on penalty watch" },
  },
];

const paymentQueue: PaymentItem[] = [
  {
    member: "Meseret T.",
    ekub: "Habesha Family Monthly",
    amount: "ETB 5,000",
    due: "2026-04-27",
    status: { am: "ከፍሏል", en: "Paid" },
    severity: "success",
  },
  {
    member: "Bereket H.",
    ekub: "Market Traders Weekly",
    amount: "ETB 2,500",
    due: "2026-04-25",
    status: { am: "ማሳሰቢያ ተልኳል", en: "Reminder sent" },
    severity: "warning",
  },
  {
    member: "Maedot Slot #2",
    ekub: "Daily Agro Circle",
    amount: "ETB 750",
    due: "2026-04-24",
    status: { am: "በመክፈል ላይ", en: "Processing" },
    severity: "info",
  },
];

const payoutPlan: PayoutItem[] = [
  { order: 1, member: "Selamawit A.", date: "Apr 30", amount: "ETB 100,000", hidden: false },
  { order: 2, member: "Hidden to others", date: "May 30", amount: "ETB 100,000", hidden: true },
  { order: 3, member: "Hidden to others", date: "Jun 30", amount: "ETB 100,000", hidden: true },
  { order: 4, member: "Hidden to others", date: "Jul 30", amount: "ETB 100,000", hidden: true },
];

const typeLabels: Record<EkubType, CopyGroup> = {
  daily: { am: "ዕለታዊ", en: "Daily" },
  weekly: { am: "ሳምንታዊ", en: "Weekly" },
  monthly: { am: "ወርሃዊ", en: "Monthly" },
  quarterly: { am: "በሶስት ወር", en: "Quarterly" },
};

const cycleLabels: Record<EkubType, CopyGroup> = {
  daily: { am: "ቀናት", en: "days" },
  weekly: { am: "ሳምንታት", en: "weeks" },
  monthly: { am: "ወራት", en: "months" },
  quarterly: { am: "ሩብ ወራት", en: "quarters" },
};

const getText = (language: Language, group: CopyGroup) => group[language];

const Index = () => {
  const [language, setLanguage] = useState<Language>("am");
  const [activeNav, setActiveNav] = useState<NavKey>("dashboard");
  const [calcMode, setCalcMode] = useState<CalcMode>("contribution");
  const [planType, setPlanType] = useState<EkubType>("monthly");
  const [contribution, setContribution] = useState("5000");
  const [targetPayout, setTargetPayout] = useState("100000");
  const [phone, setPhone] = useState("+251911223344");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("246810");
  const [spotlight, setSpotlight] = useState({ x: 50, y: 18 });

  const numericContribution = Number(contribution) || 0;
  const numericTarget = Number(targetPayout) || 0;

  const calculation = useMemo(() => {
    const sourceContribution = calcMode === "contribution" ? numericContribution : numericTarget > 0 ? numericTarget / 20 : 0;
    const sourceTarget = calcMode === "target" ? numericTarget : numericContribution > 0 ? numericContribution * 20 : 0;
    const rawCycles = sourceContribution > 0 ? sourceTarget / sourceContribution : 0;
    const cycles = Number.isFinite(rawCycles) ? rawCycles : 0;
    const valid = sourceContribution > 0 && sourceTarget > 0 && Number.isInteger(cycles) && cycles > 1;

    return {
      contribution: sourceContribution,
      target: sourceTarget,
      cycles,
      members: cycles,
      durationLabel: cycleLabels[planType],
      valid,
      warning:
        language === "am"
          ? "Target payout በ contribution × cycles መመዘን አለበት።"
          : "Target payout must equal contribution × cycles.",
    };
  }, [calcMode, numericContribution, numericTarget, planType, language]);

  const overviewSteps = [
    {
      title: { am: "OTP መግቢያ", en: "OTP access" },
      description: {
        am: "የሙሉ ስም፣ ስልክ ቁጥር፣ ኢሜይል እና አድራሻ በ mock flow ይያዙ።",
        en: "Capture full name, phone, email, and address in a mock onboarding flow.",
      },
      icon: UserCheck,
    },
    {
      title: { am: "የእቁብ ሂሳብ", en: "Calculation engine" },
      description: {
        am: "Contribution ወይም Target ያስገቡ፣ ከዚያ cycles, ቆይታ እና አባላት በራስ-ሰር ይሞሉ።",
        en: "Enter either contribution or target, then cycles, duration, and members are computed automatically.",
      },
      icon: TrendingUp,
    },
    {
      title: { am: "ፍትሃዊ payout", en: "Fair payout" },
      description: {
        am: "Random unique order, lock-after-start, እና hidden payout visibility per member.",
        en: "Random unique order, lock after start, and hidden payout visibility per member.",
      },
      icon: Lock,
    },
  ];

  const riskSignals = [
    {
      title: { am: "Late penalty engine", en: "Late penalty engine" },
      copy: { am: "2% ቅጣት + 3 ቀን grace period", en: "2% penalty + 3-day grace period" },
      value: "2.0%",
    },
    {
      title: { am: "Risk scoring", en: "Risk scoring" },
      copy: { am: "የክፍያ ታሪክ፣ payout consistency እና reminder response", en: "Payment history, payout consistency, and reminder response" },
      value: "84/100",
    },
    {
      title: { am: "Maedot coverage", en: "Maedot coverage" },
      copy: { am: "30% ከፍተኛ ወሰን፣ በእውነተኛ አባል የሚተካ", en: "30% hard cap, replaceable by a real member" },
      value: "18%",
    },
  ];

  const adminCards = [
    {
      title: { am: "ተጠቃሚዎች", en: "Users" },
      value: "1,284",
      note: { am: "43 አዲስ ተመዝጋቢዎች", en: "43 new signups" },
    },
    {
      title: { am: "የሚከታተሉ እቁቦች", en: "Monitored ekubs" },
      value: "72",
      note: { am: "11 በማስጠንቀቂያ ሁኔታ", en: "11 flagged for review" },
    },
    {
      title: { am: "Fraud controls", en: "Fraud controls" },
      value: "99.1%",
      note: { am: "OTP + role access + audit mock", en: "OTP + role access + audit mock" },
    },
  ];

  const handleSpotlight = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setSpotlight({ x, y });
  };

  return (
    <main className="min-h-screen">
      <section
        className="ambient-spotlight surface-grid relative overflow-hidden border-b border-border/70"
        onMouseMove={handleSpotlight}
        style={{ ["--spot-x" as string]: `${spotlight.x}%`, ["--spot-y" as string]: `${spotlight.y}%` }}
      >
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-10 pt-5 sm:px-6 lg:px-8">
          <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/12 shadow-glow">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary/80">EkubOS Ethiopia</p>
                <h1 className="text-2xl font-semibold text-gradient-brand sm:text-3xl">{getText(language, COPY.brand)}</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="border-primary/30 bg-card/60 px-3 py-1 text-xs text-foreground">
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-primary" />
                {language === "am" ? "Mock production architecture" : "Mock production architecture"}
              </Badge>
              <div className="flex items-center rounded-full border border-border bg-card/70 p-1 shadow-elegant backdrop-blur">
                <Button
                  variant={language === "am" ? "hero" : "ghost"}
                  size="sm"
                  className="rounded-full px-4"
                  onClick={() => setLanguage("am")}
                >
                  አማርኛ
                </Button>
                <Button
                  variant={language === "en" ? "hero" : "ghost"}
                  size="sm"
                  className="rounded-full px-4"
                  onClick={() => setLanguage("en")}
                >
                  EN
                </Button>
              </div>
            </div>
          </header>

          <div className="grid flex-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="bg-panel-gradient shadow-elegant rounded-3xl border border-border/70 p-4 backdrop-blur">
              <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/30 text-secondary-foreground">
                    <Globe2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{language === "am" ? "ዋና ልምድ" : "Primary mode"}</p>
                    <p className="font-semibold text-foreground">{language === "am" ? "አማርኛ በቅድሚያ" : "Amharic first"}</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{getText(language, COPY.tagline)}</p>
              </div>

              <nav className="space-y-2">
                {navItems.map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveNav(key)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all",
                      activeNav === key
                        ? "border-primary/40 bg-primary/12 text-foreground shadow-glow"
                        : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={cn("h-4 w-4", activeNav === key ? "text-primary" : "text-muted-foreground")} />
                      <span className="font-medium">{getText(language, label)}</span>
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ))}
              </nav>

              <div className="mt-6 rounded-2xl border border-border bg-surface/80 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <BellRing className="h-4 w-4 text-warning" />
                  {language === "am" ? "የዛሬ ማሳሰቢያዎች" : "Today’s alerts"}
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="rounded-xl bg-accent/60 p-3 text-foreground">{language === "am" ? "2 አባላት ክፍያ ቀርቦባቸዋል" : "2 members approaching due date"}</li>
                  <li className="rounded-xl bg-accent/60 p-3 text-foreground">{language === "am" ? "1 payout በዛሬ ማረጋገጫ ላይ ነው" : "1 payout awaiting confirmation today"}</li>
                </ul>
              </div>
            </aside>

            <div className="space-y-6">
              <section className="bg-panel-gradient shadow-elegant rounded-3xl border border-border/70 p-6 lg:p-8">
                <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
                  <div className="space-y-5">
                    <Badge className="bg-secondary/25 text-secondary-foreground hover:bg-secondary/30">{language === "am" ? "Secure · Transparent · Automated" : "Secure · Transparent · Automated"}</Badge>
                    <div className="space-y-3">
                      <h2 className="max-w-3xl text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                        {language === "am"
                          ? "እቁብ payout በ contribution እና በጊዜ ላይ የተመሠረተ ፍትሃዊ ስርጭት ነው።"
                          : "Ekub payout is proportional to contribution and time, with fair automated distribution."}
                      </h2>
                      <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{getText(language, COPY.subtitle)}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {overviewSteps.map(({ title, description, icon: Icon }, index) => (
                        <Card key={index} className="bg-card/80 shadow-elegant border-border/70">
                          <CardHeader className="space-y-3 pb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                              <Icon className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg">{getText(language, title)}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm leading-6 text-muted-foreground">{getText(language, description)}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button variant="hero" size="lg" className="rounded-full px-6" onClick={() => setActiveNav("create")}>
                        {language === "am" ? "አዲስ እቁብ ጀምር" : "Start a new Ekub"}
                      </Button>
                      <Button variant="panel" size="lg" className="rounded-full px-6" onClick={() => setActiveNav("join")}>
                        {language === "am" ? "ክፍት እቁቦችን ይመልከቱ" : "Browse open Ekubs"}
                      </Button>
                    </div>
                  </div>

                  <Card className="bg-card/85 shadow-glow border-primary/20 animate-glow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Lock className="h-5 w-5 text-primary" />
                        {getText(language, COPY.loginTitle)}
                      </CardTitle>
                      <CardDescription>
                        {language === "am"
                          ? "Dev/mock OTP: 246810 ይጠቀሙ። ከዚህ በኋላ real SMS provider ማገናኘት ቀላል ይሆናል።"
                          : "Dev/mock OTP: use 246810. Real SMS provider integration can replace this flow later."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{language === "am" ? "ስልክ ቁጥር" : "Phone number"}</label>
                        <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+2519..." />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">{language === "am" ? "OTP ኮድ" : "OTP code"}</label>
                          <Input value={otpCode} onChange={(event) => setOtpCode(event.target.value)} maxLength={6} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">{language === "am" ? "ሁኔታ" : "State"}</label>
                          <div className="flex h-10 items-center rounded-md border border-border bg-accent px-3 text-sm text-muted-foreground">
                            {otpVerified
                              ? language === "am"
                                ? "ተረጋግጧል"
                                : "Verified"
                              : otpSent
                                ? language === "am"
                                  ? "OTP ተልኳል"
                                  : "OTP sent"
                                : language === "am"
                                  ? "ዝግጁ"
                                  : "Ready"}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="hero" onClick={() => setOtpSent(true)}>
                          {language === "am" ? "OTP ላክ" : "Send OTP"}
                        </Button>
                        <Button variant="panel" onClick={() => setOtpVerified(otpCode === "246810" && otpSent)}>
                          {language === "am" ? "ኮድ አረጋግጥ" : "Verify code"}
                        </Button>
                      </div>
                      <div className="rounded-2xl border border-border bg-surface/70 p-4 text-sm leading-6 text-muted-foreground">
                        {otpVerified
                          ? language === "am"
                            ? "ተጠቃሚው ገብቷል። ከዚህ በኋላ profile, role, dashboard እና joined ekubs ማሳየት ይቻላል።"
                            : "User is signed in. Profile, role, dashboard, and joined ekubs can now be shown."
                          : language === "am"
                            ? "Mock flow ሲሆን የproduction ስርዓት ውስጥ phone OTP provider በLovable Cloud ይተካል።"
                            : "This mock flow can later be replaced by a production phone OTP provider in Lovable Cloud."}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metrics.map(({ label, value, change, icon: Icon }) => (
                  <Card key={value} className="bg-card/80 shadow-elegant border-border/70 animate-slide-up-fade">
                    <CardContent className="p-5">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{getText(language, label)}</p>
                          <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{getText(language, change)}</p>
                    </CardContent>
                  </Card>
                ))}
              </section>

              <Tabs value={activeNav} onValueChange={(value) => setActiveNav(value as NavKey)} className="space-y-4">
                <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-2xl border border-border bg-card/60 p-2">
                  {navItems.map(({ key, label }) => (
                    <TabsTrigger key={key} value={key} className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      {getText(language, label)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="dashboard" className="space-y-6">
                  <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="bg-panel-gradient shadow-elegant border-border/70">
                      <CardHeader>
                        <CardTitle>{language === "am" ? "የእቁብ ማጠቃለያ" : "Ekub portfolio"}</CardTitle>
                        <CardDescription>
                          {language === "am"
                            ? "Active, filling, እና payment-sensitive groups በአንድ ቦታ።"
                            : "Active, filling, and payment-sensitive groups in one place."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {liveEkubs.map((ekub) => (
                          <div key={ekub.title.en} className="rounded-2xl border border-border bg-card/70 p-4">
                            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <h3 className="text-lg font-semibold text-foreground">{getText(language, ekub.title)}</h3>
                                  <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">{getText(language, ekub.type)}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{ekub.contribution} · {ekub.target}</p>
                              </div>
                              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-foreground">{getText(language, ekub.status)}</Badge>
                            </div>
                            <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                              <span>{language === "am" ? "አባላት" : "Members"}: {ekub.members}</span>
                              <span>{ekub.progress}%</span>
                            </div>
                            <Progress value={ekub.progress} className="h-2.5 bg-accent" />
                            <p className="mt-3 text-sm text-muted-foreground">{getText(language, ekub.due)}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-panel-gradient shadow-elegant border-border/70">
                      <CardHeader>
                        <CardTitle>{language === "am" ? "አደጋ እና ተግባራዊ መለኪያዎች" : "Risk and automation signals"}</CardTitle>
                        <CardDescription>
                          {language === "am" ? "Penalty, grace period, risk score, እና maedot rules በአንድ እይታ።" : "Penalty, grace period, risk score, and Maedot rules at a glance."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {riskSignals.map((signal) => (
                          <div key={signal.title.en} className="rounded-2xl border border-border bg-card/70 p-4">
                            <div className="mb-2 flex items-center justify-between gap-4">
                              <h3 className="font-semibold text-foreground">{getText(language, signal.title)}</h3>
                              <span className="text-lg font-semibold text-primary">{signal.value}</span>
                            </div>
                            <p className="text-sm leading-6 text-muted-foreground">{getText(language, signal.copy)}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="create" className="space-y-6">
                  <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <Card className="bg-panel-gradient shadow-elegant border-border/70">
                      <CardHeader>
                        <CardTitle>{language === "am" ? "Core calculation engine" : "Core calculation engine"}</CardTitle>
                        <CardDescription>
                          {language === "am"
                            ? "Contribution ወይም Target ብቻ ያስገቡ፤ system የቀረውን ሁሉ ይሂሳብ።"
                            : "Enter either contribution or target; the system computes the rest automatically."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{language === "am" ? "የእቁብ አይነት" : "Plan type"}</label>
                            <Select value={planType} onValueChange={(value) => setPlanType(value as EkubType)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(typeLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {getText(language, label)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{language === "am" ? "Input mode" : "Input mode"}</label>
                            <div className="flex rounded-2xl border border-border bg-card/60 p-1">
                              <Button
                                variant={calcMode === "contribution" ? "hero" : "ghost"}
                                className="flex-1 rounded-xl"
                                onClick={() => setCalcMode("contribution")}
                              >
                                Contribution
                              </Button>
                              <Button
                                variant={calcMode === "target" ? "hero" : "ghost"}
                                className="flex-1 rounded-xl"
                                onClick={() => setCalcMode("target")}
                              >
                                Target
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{language === "am" ? "Contribution" : "Contribution"}</label>
                            <Input value={contribution} onChange={(event) => setContribution(event.target.value)} disabled={calcMode === "target"} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{language === "am" ? "Target payout" : "Target payout"}</label>
                            <Input value={targetPayout} onChange={(event) => setTargetPayout(event.target.value)} disabled={calcMode === "contribution"} />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="rounded-2xl border border-border bg-card/70 p-4">
                            <p className="text-sm text-muted-foreground">{language === "am" ? "Cycles" : "Cycles"}</p>
                            <p className="mt-2 text-3xl font-semibold text-foreground">{Number.isInteger(calculation.cycles) ? calculation.cycles : "—"}</p>
                          </div>
                          <div className="rounded-2xl border border-border bg-card/70 p-4">
                            <p className="text-sm text-muted-foreground">{language === "am" ? "Members" : "Members"}</p>
                            <p className="mt-2 text-3xl font-semibold text-foreground">{Number.isInteger(calculation.members) ? calculation.members : "—"}</p>
                          </div>
                          <div className="rounded-2xl border border-border bg-card/70 p-4">
                            <p className="text-sm text-muted-foreground">{language === "am" ? "Duration" : "Duration"}</p>
                            <p className="mt-2 text-2xl font-semibold text-foreground">
                              {Number.isInteger(calculation.cycles)
                                ? `${calculation.cycles} ${getText(language, calculation.durationLabel)}`
                                : "—"}
                            </p>
                          </div>
                        </div>

                        <div className={cn("rounded-2xl border p-4 text-sm leading-6", calculation.valid ? "border-success/30 bg-success/10 text-foreground" : "border-destructive/30 bg-destructive/10 text-foreground") }>
                          {calculation.valid
                            ? language === "am"
                              ? "Configuration ትክክል ነው። Target = Contribution × Cycles እና Members = Cycles."
                              : "Configuration is valid. Target = Contribution × Cycles and Members = Cycles."
                            : calculation.warning}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button variant="hero">{language === "am" ? "Mock እቁብ ፍጠር" : "Create mock Ekub"}</Button>
                          <Button variant="panel">{language === "am" ? "Draft አስቀምጥ" : "Save draft"}</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-panel-gradient shadow-elegant border-border/70">
                      <CardHeader>
                        <CardTitle>{language === "am" ? "የስርዓት ፍሰት" : "System flow"}</CardTitle>
                        <CardDescription>
                          {language === "am" ? "Create → Join → Maedot → Start → Payout → Payment reminders" : "Create → Join → Maedot → Start → Payout → Payment reminders"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { am: "1. ተጠቃሚው እቁብ ይፈጥራል", en: "1. User creates an Ekub" },
                          { am: "2. System cycles, members, duration ይሂሳብ", en: "2. System computes cycles, members, duration" },
                          { am: "3. አባላት ይቀላቀላሉ", en: "3. Members join" },
                          { am: "4. ካልሞላ Maedot እስከ 30% ይሞላ", en: "4. If not full, Maedot fills up to 30%" },
                          { am: "5. ሙሉ ሲሆን payout order ይመነጫል", en: "5. Once full, payout order is generated" },
                          { am: "6. ክፍያዎች ይሰበሰባሉ እና reminders ይላካሉ", en: "6. Contributions are collected and reminders are sent" },
                          { am: "7. payout ይፈጸማል", en: "7. Payout is executed" },
                        ].map((step) => (
                          <div key={step.en} className="flex items-start gap-3 rounded-2xl border border-border bg-card/70 p-4">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                            <p className="text-sm leading-6 text-muted-foreground">{getText(language, step)}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="join" className="space-y-6">
                  <Card className="bg-panel-gradient shadow-elegant border-border/70">
                    <CardHeader>
                      <CardTitle>{language === "am" ? "ክፍት እቁቦች" : "Open Ekubs"}</CardTitle>
                      <CardDescription>
                        {language === "am" ? "Public discovery ከ transparent metrics ጋር፣ payout order ግን ለግል ተደርጎ ይቀመጣል።" : "Public discovery with transparent metrics, while payout order remains private per member."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 lg:grid-cols-3">
                      {liveEkubs.map((ekub) => (
                        <div key={ekub.title.am} className="rounded-3xl border border-border bg-card/75 p-5 shadow-elegant transition-transform duration-200 hover:-translate-y-1">
                          <div className="mb-4 flex items-center justify-between">
                            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-foreground">{getText(language, ekub.type)}</Badge>
                            <span className="text-sm text-muted-foreground">{ekub.members}</span>
                          </div>
                          <h3 className="text-xl font-semibold text-foreground">{getText(language, ekub.title)}</h3>
                          <p className="mt-2 text-sm text-muted-foreground">{ekub.contribution} · {ekub.target}</p>
                          <Progress value={ekub.progress} className="mt-4 h-2.5" />
                          <p className="mt-3 text-sm text-muted-foreground">{getText(language, ekub.due)}</p>
                          <div className="mt-5 flex gap-3">
                            <Button variant="hero" className="flex-1">{language === "am" ? "ተቀላቀል" : "Join"}</Button>
                            <Button variant="panel" className="flex-1">{language === "am" ? "ዝርዝር" : "Details"}</Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments" className="space-y-6">
                  <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <Card className="bg-panel-gradient shadow-elegant border-border/70">
                      <CardHeader>
                        <CardTitle>{language === "am" ? "Payment queue" : "Payment queue"}</CardTitle>
                        <CardDescription>
                          {language === "am" ? "Track contributions, reminders, penalty watch, እና manual overrides." : "Track contributions, reminders, penalty watch, and manual overrides."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {paymentQueue.map((payment) => (
                          <div key={`${payment.member}-${payment.ekub}`} className="rounded-2xl border border-border bg-card/70 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <h3 className="font-semibold text-foreground">{payment.member}</h3>
                                <p className="text-sm text-muted-foreground">{payment.ekub}</p>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "border px-3 py-1",
                                  payment.severity === "success" && "border-success/30 bg-success/10 text-foreground",
                                  payment.severity === "warning" && "border-warning/30 bg-warning/10 text-foreground",
                                  payment.severity === "info" && "border-info/30 bg-info/10 text-foreground",
                                )}
                              >
                                {getText(language, payment.status)}
                              </Badge>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                              <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Amount</p>
                                <p className="mt-1 text-sm font-medium text-foreground">{payment.amount}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Due</p>
                                <p className="mt-1 text-sm font-medium text-foreground">{payment.due}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Action</p>
                                <p className="mt-1 text-sm font-medium text-foreground">{language === "am" ? "Reminder / Pay / Waive" : "Reminder / Pay / Waive"}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-panel-gradient shadow-elegant border-border/70">
                      <CardHeader>
                        <CardTitle>{language === "am" ? "Late detection" : "Late detection"}</CardTitle>
                        <CardDescription>
                          {language === "am" ? "Grace period ከጨረሰ በኋላ automatic late state እና penalty accumulation." : "Automatic late state and penalty accumulation after the grace period ends."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4">
                          <p className="text-sm font-medium text-foreground">{language === "am" ? "Bereket H. · 1 ቀን ዘግይቷል" : "Bereket H. · 1 day late"}</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{language === "am" ? "Grace period ውስጥ ነው፣ ቅጣት ገና አልተፈጠረም።" : "Still within the grace period, no penalty applied yet."}</p>
                        </div>
                        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
                          <p className="text-sm font-medium text-foreground">{language === "am" ? "Abel G. · 4 ቀን ዘግይቷል" : "Abel G. · 4 days late"}</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{language === "am" ? "2% penalty ተጨምሯል፣ risk score በቀስታ እየወረደ ነው።" : "2% penalty added, with risk score gradually reduced."}</p>
                        </div>
                        <Button variant="panel" className="w-full">{language === "am" ? "Penalty mock batch አስኬድ" : "Run penalty mock batch"}</Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="payouts" className="space-y-6">
                  <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                    <Card className="bg-panel-gradient shadow-elegant border-border/70">
                      <CardHeader>
                        <CardTitle>{language === "am" ? "Payout order engine" : "Payout order engine"}</CardTitle>
                        <CardDescription>
                          {language === "am" ? "Shuffle members list → assign unique payout order → lock after start." : "Shuffle member list → assign unique payout order → lock after start."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {payoutPlan.map((item) => (
                          <div key={item.order} className="rounded-2xl border border-border bg-card/70 p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">{language === "am" ? `ክፍያ ቅደም ተከተል #${item.order}` : `Payout slot #${item.order}`}</p>
                                <p className="mt-1 text-lg font-semibold text-foreground">{item.hidden && language === "am" ? "ለሌሎች ተደብቋል" : item.member}</p>
                              </div>
                              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-foreground">{item.amount}</Badge>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">{language === "am" ? `ቀን: ${item.date}` : `Date: ${item.date}`}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-panel-gradient shadow-elegant border-border/70">
                      <CardHeader>
                        <CardTitle>{language === "am" ? "Visibility rules" : "Visibility rules"}</CardTitle>
                        <CardDescription>
                          {language === "am" ? "ተጠቃሚዎች የራሳቸውን payout slot ብቻ ያያሉ፣ admin እና creator ግን ሁሉንም ያያሉ።" : "Members only see their own payout slot, while admins and creators can oversee all schedules."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
                          <p className="font-medium text-foreground">{language === "am" ? "Current member view" : "Current member view"}</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{language === "am" ? "#1 ብቻ ይታያል፣ ሌሎቹ ቦታዎች hidden ናቸው።" : "Only slot #1 is visible; all other slots remain hidden."}</p>
                        </div>
                        <div className="rounded-2xl border border-info/30 bg-info/10 p-4">
                          <p className="font-medium text-foreground">{language === "am" ? "Admin view" : "Admin view"}</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{language === "am" ? "Unique order validation, conflict detection, እና lock state ሁሉም ይታያሉ።" : "Unique order validation, conflict detection, and lock state are all visible."}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="admin" className="space-y-6">
                  <section className="grid gap-4 md:grid-cols-3">
                    {adminCards.map((card) => (
                      <Card key={card.title.en} className="bg-panel-gradient shadow-elegant border-border/70">
                        <CardContent className="p-5">
                          <p className="text-sm text-muted-foreground">{getText(language, card.title)}</p>
                          <p className="mt-3 text-4xl font-semibold text-foreground">{card.value}</p>
                          <p className="mt-2 text-sm text-muted-foreground">{getText(language, card.note)}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </section>

                  <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                    <Card className="bg-panel-gradient shadow-elegant border-border/70">
                      <CardHeader>
                        <CardTitle>{language === "am" ? "Admin actions" : "Admin actions"}</CardTitle>
                        <CardDescription>
                          {language === "am" ? "Users, ekubs, analytics, and operational controls for platform management." : "Users, ekubs, analytics, and operational controls for platform management."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-3 sm:grid-cols-2">
                        {[
                          { am: "ተጠቃሚ አስተዳደር", en: "Manage users", icon: Users },
                          { am: "እቁብ ቁጥጥር", en: "Monitor Ekubs", icon: Layers3 },
                          { am: "Risk analytics", en: "Risk analytics", icon: TrendingUp },
                          { am: "Fraud controls", en: "Fraud controls", icon: ShieldCheck },
                        ].map(({ am, en, icon: Icon }) => (
                          <button key={en} type="button" className="rounded-2xl border border-border bg-card/75 p-4 text-left transition-transform duration-200 hover:-translate-y-1 hover:border-primary/40">
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                              <Icon className="h-5 w-5" />
                            </div>
                            <p className="font-medium text-foreground">{language === "am" ? am : en}</p>
                          </button>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-panel-gradient shadow-elegant border-border/70">
                      <CardHeader>
                        <CardTitle>{language === "am" ? "Security posture" : "Security posture"}</CardTitle>
                        <CardDescription>
                          {language === "am" ? "Role isolation, row-level access, encrypted credentials, input validation እና audit-friendly architecture." : "Role isolation, row-level access, encrypted credentials, input validation, and audit-friendly architecture."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: { am: "Roles stored separately", en: "Roles stored separately" }, value: "100%" },
                          { label: { am: "Sensitive access isolation", en: "Sensitive access isolation" }, value: "RLS" },
                          { label: { am: "Mock OTP readiness", en: "Mock OTP readiness" }, value: "Ready" },
                        ].map((item) => (
                          <div key={item.value + item.label.en} className="flex items-center justify-between rounded-2xl border border-border bg-card/70 p-4">
                            <span className="text-sm text-muted-foreground">{getText(language, item.label)}</span>
                            <span className="text-lg font-semibold text-primary">{item.value}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
