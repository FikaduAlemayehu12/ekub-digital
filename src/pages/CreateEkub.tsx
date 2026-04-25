import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { calcTargetPayout, formatBirr, PLAN_LABELS, PlanType } from "@/lib/ekub";
import { toast } from "sonner";
import { Coins, Calendar, Users, Sparkles } from "lucide-react";

export default function CreateEkub() {
  const { t, lang, user } = useApp();
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    plan_type: "weekly" as PlanType,
    contribution_amount: 1000,
    cycle_count: 10,
    total_members: 10,
    maedot_limit_percent: 30,
    grace_period_days: 3,
    late_penalty_percent: 2,
  });
  const [submitting, setSubmitting] = useState(false);

  const target = calcTargetPayout(form.contribution_amount, form.cycle_count);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error(t("እባክዎ ይግቡ", "Please sign in"));
      return;
    }
    if (!form.title.trim()) {
      toast.error(t("ርዕስ አስገባ", "Enter a title"));
      return;
    }
    if (form.cycle_count !== form.total_members) {
      toast.error(t("የዙር ቁጥር እና የአባላት ቁጥር መመሳሰል አለበት", "Cycles must equal total members"));
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from("ekubs")
      .insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        plan_type: form.plan_type,
        contribution_amount: form.contribution_amount,
        cycle_count: form.cycle_count,
        total_members: form.total_members,
        target_payout: target,
        current_members: 1,
        status: "open",
        created_by: user.id,
        maedot_limit_percent: form.maedot_limit_percent,
        grace_period_days: form.grace_period_days,
        late_penalty_percent: form.late_penalty_percent,
        notes_am: lang === "am" ? form.description : null,
        notes_en: lang === "en" ? form.description : null,
        start_date: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (error || !data) {
      toast.error(error?.message || "Failed");
      setSubmitting(false);
      return;
    }

    // Auto-add creator as first member
    await supabase.from("memberships").insert({
      ekub_id: data.id,
      user_id: user.id,
      member_kind: "user",
      status: "active",
      payout_order: 1,
    });

    toast.success(t("እቁቡ ተፈጥሯል!", "Ekub created!"));
    setSubmitting(false);
    nav("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{t("አዲስ እቁብ ፍጠር", "Create new Ekub")}</h1>
        <p className="text-muted-foreground">
          {t("የቡድንህን ህጎች አስቀምጥ — ሁሉም ግልጽና አውቶማቲክ ናቸው።", "Set the rules — everything is transparent and automated.")}
        </p>
      </header>

      <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-panel-gradient border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">{t("መሰረታዊ መረጃ", "Basics")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t("የእቁብ ስም", "Ekub name")}</Label>
                <Input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder={t("ለምሳሌ: የቦሌ ቤተሰብ እቁብ", "e.g. Bole family Ekub")}
                  required
                />
              </div>
              <div>
                <Label>{t("መግለጫ", "Description")}</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder={t("የቡድኑ አላማና ህጎች...", "Purpose and rules of the circle...")}
                  rows={3}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t("የክፍያ ድግግሞሽ", "Payment cadence")}</Label>
                  <Select value={form.plan_type} onValueChange={(v) => update("plan_type", v as PlanType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(PLAN_LABELS) as PlanType[]).map((p) => (
                        <SelectItem key={p} value={p}>
                          {PLAN_LABELS[p][lang]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("የመዋጮ መጠን (ብር)", "Contribution (Birr)")}</Label>
                  <Input
                    type="number"
                    min={50}
                    value={form.contribution_amount}
                    onChange={(e) => update("contribution_amount", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>{t("የዙር ብዛት", "Cycle count")}</Label>
                  <Input
                    type="number"
                    min={2}
                    value={form.cycle_count}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      update("cycle_count", v);
                      update("total_members", v);
                    }}
                  />
                </div>
                <div>
                  <Label>{t("የአባላት ብዛት", "Total members")}</Label>
                  <Input
                    type="number"
                    min={2}
                    value={form.total_members}
                    onChange={(e) => update("total_members", Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-panel-gradient border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">{t("ህጎች", "Rules")}</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>{t("የእፎይታ ቀን", "Grace days")}</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.grace_period_days}
                  onChange={(e) => update("grace_period_days", Number(e.target.value))}
                />
              </div>
              <div>
                <Label>{t("የዘገየ ቅጣት %", "Late penalty %")}</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.late_penalty_percent}
                  onChange={(e) => update("late_penalty_percent", Number(e.target.value))}
                />
              </div>
              <div>
                <Label>{t("የማእዶት ወሰን %", "Maedot cap %")}</Label>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  value={form.maedot_limit_percent}
                  onChange={(e) => update("maedot_limit_percent", Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-panel-gradient border-primary/40 shadow-glow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t("ማጠቃለያ", "Summary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row icon={Coins} label={t("ዒላማ ክፍያ", "Target payout")} value={formatBirr(target)} highlight />
              <Row icon={Calendar} label={t("ድግግሞሽ", "Cadence")} value={PLAN_LABELS[form.plan_type][lang]} />
              <Row icon={Users} label={t("አባላት", "Members")} value={`${form.total_members}`} />
              <p className="text-xs text-muted-foreground pt-2 border-t border-border/40">
                {t(
                  "ቀመር: ዒላማ = መዋጮ × ዙር። ሁሉም ተሳታፊ በትክክል ተመሳሳይ መጠን ይከፍላል እና ይቀበላል።",
                  "Formula: Target = Contribution × Cycles. Every member pays and receives the same amount.",
                )}
              </p>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? t("በመፍጠር ላይ...", "Creating...") : t("እቁብ ፍጠር", "Create Ekub")}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: any;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className={highlight ? "text-primary font-bold text-base" : "font-medium"}>{value}</span>
    </div>
  );
}
