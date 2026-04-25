import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ETH_IMAGES } from "@/lib/eth-images";
import { useApp } from "@/contexts/AppContext";

const MOTIVATIONS: { am: string; en: string }[] = [
  { am: "ብቻህን አታጠራቅም — ከማህበረሰብህ ጋር ቁጠብ።", en: "Don't save alone — save with your community." },
  { am: "እያንዳንዱ ብር ህልምን ይገነባል።", en: "Every birr builds a dream." },
  { am: "እምነት የእቁብ ዋናው ካፒታል ነው።", en: "Trust is the true capital of Ekub." },
  { am: "ዛሬ ቁጠባ — ነገ ነፃነት።", en: "Save today — be free tomorrow." },
  { am: "ትንሽ መዋጮ፣ ትልቅ ለውጥ።", en: "Small contributions, big change." },
  { am: "ከጎረቤትህ ጋር ተባበር፣ ኢኮኖሚህን አሳድግ።", en: "Unite with your neighbor, grow your economy." },
  { am: "ፍትሃዊ ቅደም ተከተል፣ ግልጽ ስርዓት።", en: "Fair order, transparent system." },
  { am: "ባህልህን አክብር፣ ቴክኖሎጂን ተጠቀም።", en: "Honor tradition, embrace technology." },
  { am: "ቤትህን፣ ሥራህን፣ ህልምህን ገንባ።", en: "Build your home, your business, your dream." },
  { am: "ኢትዮጵያ በቁጠባ ትበለጽጋለች።", en: "Ethiopia thrives through saving." },
];

const INTERVAL_MS = 5000; // 5 seconds per slide; 10 slides → 50s loop

export default function HeroSlideshow() {
  const { lang } = useApp();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((p) => (p + 1) % ETH_IMAGES.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused]);

  const next = () => setI((p) => (p + 1) % ETH_IMAGES.length);
  const prev = () => setI((p) => (p - 1 + ETH_IMAGES.length) % ETH_IMAGES.length);

  return (
    <div
      className="relative w-full max-w-5xl mx-auto aspect-[16/9] rounded-3xl overflow-hidden shadow-elegant border border-border/40 group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {ETH_IMAGES.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
            idx === i ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={idx !== i}
        >
          <img
            src={img.src}
            alt={img[lang]}
            width={1280}
            height={832}
            loading={idx === 0 ? "eager" : "lazy"}
            className="h-full w-full object-cover scale-105 animate-[heroZoom_6s_ease-out_forwards]"
            style={{ animationPlayState: idx === i ? "running" : "paused" }}
          />
          {/* Gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />

          {/* Centered motivational text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p
              key={`${idx}-${i}`}
              className="text-white text-2xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-3xl drop-shadow-2xl animate-fade-in"
            >
              {MOTIVATIONS[idx][lang]}
            </p>
            <p className="mt-4 text-white/80 text-sm md:text-base max-w-xl">
              {img[lang]}
            </p>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={prev}
        aria-label="previous"
        className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="next"
        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {ETH_IMAGES.map((_, idx) => (
          <button
            key={idx}
            aria-label={`slide ${idx + 1}`}
            onClick={() => setI(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === i ? "w-8 bg-primary" : "w-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          key={i + (paused ? "p" : "r")}
          className="h-full bg-primary"
          style={{
            animation: paused ? "none" : `heroProgress ${INTERVAL_MS}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}
