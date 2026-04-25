import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck, Users, Coins, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { ETH_IMAGES } from "@/lib/eth-images";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatBirr } from "@/lib/ekub";
import HeroSlideshow from "@/components/HeroSlideshow";

export default function Home() {
  const { t, lang } = useApp();
  const [stats, setStats] = useState({ ekubs: 0, members: 0, paid: 0 });

  useEffect(() => {
    (async () => {
      const [{ count: ekubs }, { count: members }, { data: pays }] = await Promise.all([
        supabase.from("ekubs").select("*", { count: "exact", head: true }),
        supabase.from("memberships").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("amount").eq("status", "paid"),
      ]);
      const paid = (pays || []).reduce((s, p) => s + Number(p.amount || 0), 0);
      setStats({ ekubs: ekubs || 0, members: members || 0, paid });
    })();
  }, []);

  const motivations = [
    {
      am: "ብቻህን አታጠራቅም — ከማህበረሰብህ ጋር ቁጠብ።",
      en: "Don't save alone — save with your community.",
      icon: Users,
    },
    {
      am: "እያንዳንዱ ብር በዲጂታል ይመዘገባል፤ ምንም ጥርጣሬ የለም።",
      en: "Every birr is logged digitally — zero ambiguity.",
      icon: ShieldCheck,
    },
    {
      am: "ፍትሃዊ ቅደም ተከተል፣ ተጠቃሚዎች እንደ ድርሻቸው ይከፈላሉ።",
      en: "Fair ordering — payouts proportional to contribution & time.",
      icon: Activity,
    },
    {
      am: "ህልምህ ቅርብ ነው — ካፒታል፣ ቤት፣ ትምህርት።",
      en: "Your dream is closer — capital, home, education.",
      icon: Sparkles,
    },
  ];

  return (
    <div>
      {/* HERO — centered with auto-rotating slideshow */}
      <section className="relative overflow-hidden ambient-spotlight">
        <div className="container mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24 flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            {t("የኢትዮጵያ የመጀመሪያ ዘመናዊ ዲጂታል እቁብ", "Ethiopia's first modern digital Ekub")}
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight max-w-4xl animate-fade-in">
            <span className="text-gradient-brand">
              {t("ባህልህን አክብር።", "Honor tradition.")}
            </span>
            <br />
            {t("ቁጠባህን ዘመናዊ አድርግ።", "Modernize your savings.")}
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl text-balance">
            {t(
              "ኢቁብኔት የኢትዮጵያን ባህላዊ ዕቁብ ስርዓት ግልጽ፣ ፈጣን እና ደህንነቱ የተጠበቀ ያደርገዋል። ቡድንህን ፍጠር፣ ተቀላቀል፣ ክፍያህን ተቀበል — ሁሉም በአንድ መድረክ።",
              "EkubNet brings Ethiopia's traditional savings circles into a transparent, fast and secure platform. Create, join, contribute, and receive — all in one place.",
            )}
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/dashboard">
                {t("ጀምር", "Get started")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/join">{t("የተከፈቱ እቁቦች ተመልከት", "Browse open Ekubs")}</Link>
            </Button>
          </div>

          {/* Auto-rotating bilingual motivational slideshow */}
          <div className="w-full pt-4">
            <HeroSlideshow />
          </div>

          <div className="grid grid-cols-3 gap-8 pt-4 max-w-2xl w-full">
            <Stat label={t("ንቁ እቁቦች", "Active Ekubs")} value={String(stats.ekubs)} />
            <Stat label={t("አባላት", "Members")} value={String(stats.members)} />
            <Stat label={t("የተከፈለ", "Paid out")} value={formatBirr(stats.paid)} small />
          </div>
        </div>
      </section>

      {/* MOTIVATION */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          {t("ለምን ኢቁብኔት?", "Why EkubNet?")}
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-10">
          {t(
            "የእቁብ ባህል ለዘመናት የቆየ ነው። እኛ የበለጠ አስተማማኝ፣ ግልጽና ለሁሉም ተደራሽ እናደርጋለን።",
            "The Ekub tradition is centuries old. We make it safer, more transparent and accessible to everyone.",
          )}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {motivations.map((m, i) => {
            const Icon = m.icon;
            return (
              <Card key={i} className="bg-panel-gradient border-border/60 hover:shadow-glow transition-shadow">
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm leading-relaxed">{t(m.am, m.en)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* IMAGE GALLERY — 10 hardcoded Ethiopian images */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">{t("ከኢትዮጵያ ጋር", "Made for Ethiopia")}</h2>
            <p className="text-muted-foreground">
              {t("እያንዳንዱ ምስል ከእቁብ ጋር የተያያዘ እውነተኛ ታሪክ ነው።", "Every image is a real Ekub story.")}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {ETH_IMAGES.map((img, i) => (
            <figure
              key={i}
              className="group relative overflow-hidden rounded-xl shadow-elegant aspect-[4/5]"
            >
              <img
                src={img.src}
                alt={img[lang]}
                width={1280}
                height={832}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-xs text-white">
                {img[lang]}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          {t("እንዴት ይሰራል?", "How it works")}
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              n: "1",
              am: "ግባ ወይም እቁብ ፍጠር",
              en: "Sign in or create an Ekub",
              d_am: "በሞክ መለያ በፍጥነት ግባ። የራስህን ቡድን ፍጠር ወይም ያለውን ተቀላቀል።",
              d_en: "Sign in with a mock account. Create your own circle or join an open one.",
            },
            {
              n: "2",
              am: "ወቅቱን አስከብረህ ክፈል",
              en: "Pay on schedule",
              d_am: "የክፍያ ጊዜህ ይታወሳል። ቅጣትና የእፎይታ ቀን በግልጽ ይታያል።",
              d_en: "Get reminded automatically. Penalties & grace days are transparent.",
            },
            {
              n: "3",
              am: "ክፍያህን በቅደም ተከተል ተቀበል",
              en: "Receive your payout in turn",
              d_am: "ቅደም ተከተል በፍትሃዊ ስልተ ቀመር ይወሰናል። ማእዶት ሙላት ሲያስፈልግ ይተገበራል።",
              d_en: "Order is decided fairly. Maedot fills empty seats automatically.",
            },
          ].map((s) => (
            <Card key={s.n} className="bg-panel-gradient border-border/60">
              <CardContent className="p-6">
                <div className="text-4xl font-black text-primary/30 mb-2">{s.n}</div>
                <div className="text-lg font-semibold mb-1">{t(s.am, s.en)}</div>
                <p className="text-sm text-muted-foreground">{t(s.d_am, s.d_en)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-primary/20 via-warning/10 to-secondary/20 border border-primary/20 p-8 md:p-12 text-center">
          <Coins className="h-10 w-10 mx-auto text-primary mb-4" />
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            {t("ዛሬ ቁጠባ ጀምር — ነገ ነፃነትህ ነው።", "Start saving today — tomorrow is your freedom.")}
          </h3>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            {t(
              "በመቶዎች የሚቆጠሩ ኢትዮጵያውያን ቀድመውህ ጀምረዋል። አንተ ቀጥል።",
              "Hundreds of Ethiopians have already started. Take your turn.",
            )}
          </p>
          <Button asChild size="lg">
            <Link to="/join">{t("እቁብ ይቀላቀሉ", "Join an Ekub")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <div className={`font-bold ${small ? "text-lg" : "text-2xl md:text-3xl"} text-primary`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
