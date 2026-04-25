import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { formatBirr, PLAN_LABELS, progressPct } from "@/lib/ekub";
import { Activity, Coins, TrendingUp, Users, Wallet, Bell } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, t, lang } = useApp();
  const [memberships, setMemberships] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const [{ data: ms }, { data: ps }] = await Promise.all([
      supabase
        .from("memberships")
        .select("*, ekubs(*)")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false }),
      supabase
        .from("payments")
        .select("*, ekubs(title)")
        .eq("user_id", user.id)
        .order("due_date", { ascending: false })
        .limit(10),
    ]);
    setMemberships(ms || []);
    setPayments(ps || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase
      .channel("dash-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "memberships", filter: `user_id=eq.${user.id}` }, () => {
        load();
        toast.success(t("ቡድንህ ተዘምኗል", "Membership updated"));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "payments", filter: `user_id=eq.${user.id}` }, () => {
        load();
        toast.success(t("ክፍያ ተዘምኗል", "Payment updated"));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-3">{t("እባክዎ ይግቡ", "Please sign in")}</h2>
        <p className="text-muted-foreground mb-6">
          {t("ዳሽቦርድህን ለማየት መለያህን ምረጥ።", "Choose an account to view your dashboard.")}
        </p>
      </div>
    );
  }

  const totalContributed = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const upcoming = payments.filter((p) => p.status === "pending").length;
  const activeEkubs = memberships.filter((m) => m.status === "active" || m.status === "pending").length;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{t("እንኳን ደህና መጡ", "Welcome back")}</p>
          <h1 className="text-3xl font-bold">{user.full_name}</h1>
        </div>
        <Button asChild>
          <Link to="/join">{t("አዲስ እቁብ ተቀላቀል", "Join new Ekub")}</Link>
        </Button>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label={t("ንቁ እቁቦች", "Active Ekubs")} value={String(activeEkubs)} />
        <KpiCard icon={Coins} label={t("የተከፈለ ድምር", "Total contributed")} value={formatBirr(totalContributed)} />
        <KpiCard icon={Bell} label={t("ሊቆጣ ያላቸው", "Upcoming")} value={String(upcoming)} />
        <KpiCard icon={TrendingUp} label={t("የአደጋ ነጥብ", "Risk score")} value="A+" tone="success" />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">{t("የእኔ እቁቦች", "My Ekubs")}</h2>
          <Link to="/join" className="text-sm text-primary hover:underline">
            {t("ተጨማሪ አስስ", "Discover more")}
          </Link>
        </div>
        {loading ? (
          <div className="text-muted-foreground text-sm">{t("በመጫን ላይ...", "Loading...")}</div>
        ) : memberships.length === 0 ? (
          <Card className="bg-panel-gradient">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {t("እስካሁን አንድም እቁብ አልተቀላቀልክም።", "You haven't joined any Ekub yet.")}
              </p>
              <Button asChild>
                <Link to="/join">{t("አሁን ተቀላቀል", "Join now")}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {memberships.map((m) => {
              const e = m.ekubs;
              const pct = progressPct(e.current_members, e.total_members);
              return (
                <Card key={m.id} className="bg-panel-gradient border-border/60">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{e.title}</CardTitle>
                      <Badge variant="outline" className="capitalize">
                        {PLAN_LABELS[e.plan_type as keyof typeof PLAN_LABELS][lang]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("መዋጮ", "Contribution")}</span>
                      <span className="font-medium">{formatBirr(Number(e.contribution_amount))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("ዒላማ ክፍያ", "Target payout")}</span>
                      <span className="font-medium">{formatBirr(Number(e.target_payout))}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          {t("አባላት", "Members")} {e.current_members}/{e.total_members}
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <Progress value={pct} />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link to="/payments">{t("ክፈል", "Pay")}</Link>
                      </Button>
                      <Button asChild size="sm" variant="ghost" className="flex-1">
                        <Link to="/payouts">{t("ክፍያ ቀን", "Payout")}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">{t("የቅርብ ጊዜ ክፍያዎች", "Recent payments")}</h2>
        <Card className="bg-panel-gradient">
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                {t("ምንም ክፍያ የለም።", "No payments yet.")}
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center ${
                          p.status === "paid"
                            ? "bg-success/20 text-success"
                            : p.status === "late"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-warning/20 text-warning"
                        }`}
                      >
                        <Wallet className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.ekubs?.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {t("የመጨረሻ ቀን", "Due")}: {p.due_date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatBirr(Number(p.amount))}</div>
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs ${
                          p.status === "paid"
                            ? "border-success text-success"
                            : p.status === "late"
                            ? "border-destructive text-destructive"
                            : "border-warning text-warning"
                        }`}
                      >
                        {p.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any;
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <Card className="bg-panel-gradient border-border/60">
      <CardContent className="p-4 flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            tone === "success" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
