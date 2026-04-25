import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { formatBirr } from "@/lib/ekub";
import { Calendar, CheckCircle2, Lock, Trophy } from "lucide-react";

export default function Payouts() {
  const { t, user, isAdmin } = useApp();
  const [memberships, setMemberships] = useState<any[]>([]);

  async function load() {
    if (!user) return;
    let q = supabase.from("memberships").select("*, ekubs(*)").order("payout_order");
    if (!isAdmin) q = q.eq("user_id", user.id);
    const { data } = await q;
    setMemberships(data || []);
  }

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase
      .channel("payouts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "memberships" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">{t("እባክዎ ይግቡ", "Please sign in")}</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{t("የክፍያ ቀን", "Payout schedule")}</h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? t("የሁሉንም አባላት ክፍያ ቅደም ተከተል ተመልከት።", "View payout order for all members.")
            : t("የራስህን ቅደም ተከተል ብቻ ታያለህ።", "You see only your own payout slot.")}
        </p>
      </header>

      {memberships.length === 0 ? (
        <Card className="bg-panel-gradient">
          <CardContent className="p-8 text-center text-muted-foreground">
            {t("ገና አንድም እቁብ የለህም።", "No memberships yet.")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {memberships.map((m) => {
            const e = m.ekubs;
            const isMe = m.user_id === user.id;
            const today = new Date();
            const payoutDate = m.payout_date ? new Date(m.payout_date) : null;
            const isPast = payoutDate && payoutDate < today;
            return (
              <Card key={m.id} className="bg-panel-gradient border-border/60">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{e.title}</CardTitle>
                    <Badge variant={isMe ? "default" : "outline"} className="capitalize">
                      #{m.payout_order ?? "?"}
                      {isMe && " · " + t("እኔ", "Me")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {t("የክፍያ ቀን", "Payout date")}:{" "}
                      <span className="text-foreground font-medium">
                        {m.payout_date ?? t("ገና አልተወሰነም", "Not scheduled")}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("የሚቀበለው", "Will receive")}</span>
                    <span className="font-bold text-primary">{formatBirr(Number(e.target_payout))}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                    {m.payout_locked ? (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="h-3 w-3" /> {t("ተቆልፏል", "Locked")}
                      </Badge>
                    ) : isPast ? (
                      <Badge variant="outline" className="border-success text-success gap-1">
                        <Trophy className="h-3 w-3" /> {t("ተከፍሏል", "Paid out")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" /> {t("የታቀደ", "Scheduled")}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
