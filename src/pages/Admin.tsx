import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { formatBirr, PLAN_LABELS } from "@/lib/ekub";
import { ShieldAlert, Users, Coins, Activity, Pause, Play } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { t, lang, isAdmin } = useApp();
  const [ekubs, setEkubs] = useState<any[]>([]);
  const [stats, setStats] = useState({ ekubs: 0, members: 0, paid: 0, pending: 0 });

  async function load() {
    const [{ data: es }, { count: members }, { data: pays }, { count: pending }] = await Promise.all([
      supabase.from("ekubs").select("*").order("created_at", { ascending: false }),
      supabase.from("memberships").select("*", { count: "exact", head: true }),
      supabase.from("payments").select("amount").eq("status", "paid"),
      supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    setEkubs(es || []);
    const paid = (pays || []).reduce((s, p) => s + Number(p.amount), 0);
    setStats({ ekubs: es?.length || 0, members: members || 0, paid, pending: pending || 0 });
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "ekubs" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "memberships" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  async function toggleStatus(e: any) {
    const next = e.status === "active" ? "open" : e.status === "open" ? "active" : "open";
    const { error } = await supabase.from("ekubs").update({ status: next }).eq("id", e.id);
    if (error) toast.error(error.message);
    else toast.success(t("ሁኔታ ተቀየረ", "Status updated"));
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h2 className="text-2xl font-bold mb-1">{t("ፍቃድ የለህም", "Access restricted")}</h2>
        <p className="text-muted-foreground">
          {t("እንደ አስተዳዳሪ ብቻ ይመዝገቡ።", "Sign in as admin to view this panel.")}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldAlert className="h-7 w-7 text-primary" />
          {t("የአስተዳዳሪ ፓነል", "Admin panel")}
        </h1>
        <p className="text-muted-foreground">
          {t("የመድረኩን ጤና አስተዳድር።", "Monitor and manage the platform.")}
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Activity} label={t("ጠቅላላ እቁቦች", "Total Ekubs")} value={String(stats.ekubs)} />
        <Kpi icon={Users} label={t("አባላት", "Members")} value={String(stats.members)} />
        <Kpi icon={Coins} label={t("የተከፈለ", "Paid total")} value={formatBirr(stats.paid)} />
        <Kpi icon={Activity} label={t("ሊከፈሉ", "Pending pmts")} value={String(stats.pending)} />
      </div>

      <Card className="bg-panel-gradient">
        <CardHeader>
          <CardTitle className="text-lg">{t("ሁሉም እቁቦች", "All Ekubs")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">{t("ስም", "Name")}</th>
                <th className="text-left p-3">{t("ድግግሞሽ", "Plan")}</th>
                <th className="text-right p-3">{t("መዋጮ", "Contribution")}</th>
                <th className="text-right p-3">{t("ዒላማ", "Target")}</th>
                <th className="text-center p-3">{t("አባላት", "Members")}</th>
                <th className="text-center p-3">{t("ሁኔታ", "Status")}</th>
                <th className="text-right p-3">{t("ድርጊት", "Action")}</th>
              </tr>
            </thead>
            <tbody>
              {ekubs.map((e) => (
                <tr key={e.id} className="border-t border-border/40 hover:bg-background/30">
                  <td className="p-3 font-medium">{e.title}</td>
                  <td className="p-3">{PLAN_LABELS[e.plan_type as keyof typeof PLAN_LABELS][lang]}</td>
                  <td className="p-3 text-right">{formatBirr(Number(e.contribution_amount))}</td>
                  <td className="p-3 text-right">{formatBirr(Number(e.target_payout))}</td>
                  <td className="p-3 text-center">
                    {e.current_members}/{e.total_members}
                  </td>
                  <td className="p-3 text-center">
                    <Badge
                      variant="outline"
                      className={`capitalize ${
                        e.status === "active"
                          ? "border-success text-success"
                          : e.status === "full"
                          ? "border-warning text-warning"
                          : ""
                      }`}
                    >
                      {e.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => toggleStatus(e)} className="gap-1">
                      {e.status === "active" ? (
                        <>
                          <Pause className="h-3 w-3" /> {t("ቆም", "Pause")}
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3" /> {t("አንቃ", "Activate")}
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="bg-panel-gradient border-border/60">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
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
