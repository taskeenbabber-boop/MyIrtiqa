import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  variant?: "orbit" | "sweep" | "off";
  minDuration?: number;
  maxDuration?: number;
}

export function Loader({ 
  variant = "orbit", 
  minDuration = 700, 
  maxDuration = 1400 
}: LoaderProps) {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = prefersReducedMotion ? minDuration : maxDuration;

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setShow(false), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [minDuration, maxDuration]);

  if (!show || variant === "off") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-300",
        fadeOut && "opacity-0"
      )}
    >
      {variant === "orbit" && <DotOrbit />}
      {variant === "sweep" && <ProgressSweep />}
    </div>
  );
}

function DotOrbit() {
  return (
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 animate-spin">
        <div className="h-3 w-3 bg-primary rounded-full absolute top-0 left-1/2 -translate-x-1/2" />
      </div>
      <div className="absolute inset-0 animate-spin [animation-delay:150ms] [animation-duration:1s]">
        <div className="h-3 w-3 bg-primary-light rounded-full absolute top-0 left-1/2 -translate-x-1/2" />
      </div>
      <div className="absolute inset-0 animate-spin [animation-delay:300ms] [animation-duration:1s]">
        <div className="h-3 w-3 bg-primary/60 rounded-full absolute top-0 left-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
}

function ProgressSweep() {
  return (
    <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-primary-light via-primary to-primary-dark rounded-full animate-[sweep_1.4s_ease-in-out_infinite]"
        style={{
          animation: "sweep 1.4s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes sweep {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}