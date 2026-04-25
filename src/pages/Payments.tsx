import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { formatBirr, nextDueDate, PLAN_LABELS } from "@/lib/ekub";
import { toast } from "sonner";
import { CheckCircle2, Wallet, AlertTriangle, Plus } from "lucide-react";

export default function Payments() {
  const { t, user } = useApp();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("payments")
      .select("*, ekubs(*)")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true });
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase
      .channel("pay-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function pay(p: any) {
    setPaying(p.id);
    const ref = `MOCK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const { error } = await supabase
      .from("payments")
      .update({ status: "paid", paid_at: new Date().toISOString(), transaction_ref: ref })
      .eq("id", p.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("ክፍያ ተሳክቷል!", "Payment successful!"), { description: ref });
      // Auto-create next pending if recurring and ekub still active
      if (p.ekubs) {
        await supabase.from("payments").insert({
          ekub_id: p.ekub_id,
          user_id: user!.id,
          amount: p.ekubs.contribution_amount,
          due_date: nextDueDate(p.ekubs.plan_type, new Date(p.due_date)),
          status: "pending",
        });
      }
    }
    setPaying(null);
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">{t("እባክዎ ይግቡ", "Please sign in")}</h2>
      </div>
    );
  }

  const pending = items.filter((i) => i.status !== "paid");
  const paid = items.filter((i) => i.status === "paid");
  const totalDue = pending.reduce((s, i) => s + Number(i.amount) + Number(i.penalty_amount || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{t("ክፍያዎች", "Payments")}</h1>
        <p className="text-muted-foreground">
          {t("የመጪ እና የቆዩ ክፍያዎችህን አስተዳድር።", "Manage your upcoming and past contributions.")}
        </p>
      </header>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-panel-gradient">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">{t("የሚቀጥሉ", "Outstanding")}</div>
            <div className="text-2xl font-bold text-warning">{formatBirr(totalDue)}</div>
          </CardContent>
        </Card>
        <Card className="bg-panel-gradient">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">{t("የተከፈሉ ብዛት", "Paid count")}</div>
            <div className="text-2xl font-bold text-success">{paid.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-panel-gradient">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">{t("የቅጣት ሚዛን", "Penalty balance")}</div>
            <div className="text-2xl font-bold">
              {formatBirr(items.reduce((s, i) => s + Number(i.penalty_amount || 0), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-panel-gradient">
        <CardHeader>
          <CardTitle className="text-lg">{t("ሊከፈሉ ያላቸው", "Due now")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-muted-foreground text-sm">{t("በመጫን ላይ...", "Loading...")}</div>
          ) : pending.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {t("ምንም ሊከፈል የሚገባ ክፍያ የለም።", "Nothing due — you're all caught up!")}
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {pending.map((p) => {
                const overdue = new Date(p.due_date) < new Date();
                return (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          overdue ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"
                        }`}
                      >
                        {overdue ? <AlertTriangle className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.ekubs?.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {t("የመጨረሻ ቀን", "Due")}: {p.due_date} ·{" "}
                          {PLAN_LABELS[p.ekubs?.plan_type as keyof typeof PLAN_LABELS]?.en}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold">{formatBirr(Number(p.amount))}</div>
                        {overdue && (
                          <Badge variant="outline" className="border-destructive text-destructive text-xs">
                            {t("ዘግይቷል", "Overdue")}
                          </Badge>
                        )}
                      </div>
                      <Button size="sm" onClick={() => pay(p)} disabled={paying === p.id}>
                        {paying === p.id ? t("በመክፈል...", "Paying...") : t("አሁን ክፈል", "Pay now")}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="bg-panel-gradient">
        <CardHeader>
          <CardTitle className="text-lg">{t("የክፍያ ታሪክ", "Payment history")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {paid.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              {t("ገና ምንም ክፍያ የለም።", "No payments yet.")}
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {paid.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-success/20 text-success flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{p.ekubs?.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {t("የተከፈለ", "Paid")}: {new Date(p.paid_at).toLocaleString()} · {p.transaction_ref}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold">{formatBirr(Number(p.amount))}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
