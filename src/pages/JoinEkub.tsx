import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { formatBirr, PLAN_LABELS, progressPct, nextDueDate } from "@/lib/ekub";
import { Search, Users, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function JoinEkub() {
  const { t, lang, user } = useApp();
  const nav = useNavigate();
  const [ekubs, setEkubs] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [joining, setJoining] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("ekubs")
      .select("*")
      .in("status", ["open", "draft"])
      .order("created_at", { ascending: false });
    setEkubs(data || []);
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel("join-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "ekubs" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "memberships" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  async function handleJoin(e: any) {
    if (!user) {
      toast.error(t("እባክዎ ይግቡ", "Please sign in"));
      return;
    }
    if (e.current_members >= e.total_members) {
      toast.error(t("እቁቡ ሞልቷል", "Ekub is full"));
      return;
    }
    setJoining(e.id);

    const { data: existing } = await supabase
      .from("memberships")
      .select("id")
      .eq("ekub_id", e.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      toast.info(t("አስቀድመህ ተቀላቅለሃል", "You already joined"));
      setJoining(null);
      return;
    }

    const newOrder = e.current_members + 1;
    const { error: mErr } = await supabase.from("memberships").insert({
      ekub_id: e.id,
      user_id: user.id,
      member_kind: "user",
      status: "active",
      payout_order: newOrder,
      payout_date: nextDueDate(e.plan_type, new Date(Date.now() + (newOrder - 1) * PLAN_LABELS[e.plan_type as keyof typeof PLAN_LABELS].days * 86400000)),
    });
    if (mErr) {
      toast.error(mErr.message);
      setJoining(null);
      return;
    }

    const newCount = newOrder;
    const newStatus = newCount >= e.total_members ? "full" : "open";
    await supabase.from("ekubs").update({ current_members: newCount, status: newStatus }).eq("id", e.id);

    // Seed first pending payment
    await supabase.from("payments").insert({
      ekub_id: e.id,
      user_id: user.id,
      amount: e.contribution_amount,
      due_date: nextDueDate(e.plan_type),
      status: "pending",
    });

    toast.success(t("እቁቡን ተቀላቅለሃል!", "You joined the Ekub!"));
    setJoining(null);
    nav("/dashboard");
  }

  const filtered = ekubs.filter((e) =>
    [e.title, e.description, e.notes_am, e.notes_en].join(" ").toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("የተከፈቱ እቁቦች", "Open Ekubs")}</h1>
          <p className="text-muted-foreground">
            {t("ለአንተ የሚስማማ ቡድን ምረጥ።", "Pick the circle that fits you.")}
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("ፈልግ...", "Search...")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="bg-panel-gradient">
          <CardContent className="p-8 text-center text-muted-foreground">
            {t("ምንም ክፍት እቁብ አልተገኘም።", "No open Ekubs found.")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => {
            const pct = progressPct(e.current_members, e.total_members);
            return (
              <Card key={e.id} className="bg-panel-gradient border-border/60 hover:shadow-glow transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{e.title}</CardTitle>
                    <Badge variant="outline" className="shrink-0 capitalize">
                      {PLAN_LABELS[e.plan_type as keyof typeof PLAN_LABELS][lang]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {lang === "am" ? e.notes_am || e.description : e.notes_en || e.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Stat label={t("መዋጮ", "Contribution")} value={formatBirr(Number(e.contribution_amount))} />
                    <Stat label={t("ዒላማ", "Target")} value={formatBirr(Number(e.target_payout))} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground inline-flex items-center gap-1">
                        <Users className="h-3 w-3" /> {e.current_members}/{e.total_members}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} />
                  </div>
                  <Button
                    onClick={() => handleJoin(e)}
                    disabled={joining === e.id || e.current_members >= e.total_members}
                    className="w-full gap-2"
                  >
                    {joining === e.id ? t("በመቀላቀል ላይ...", "Joining...") : t("ተቀላቀል", "Join")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/40 px-3 py-2">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
