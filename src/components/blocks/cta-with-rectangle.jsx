import { ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CTASection({ badge, title, description, action, withGlow = true, className, onAction }) {
  return (
    <section className={cn("overflow-hidden rounded-[2rem] bg-emerald-950 text-white", className)}>
      <div className="relative mx-auto flex max-w-container flex-col items-center gap-5 px-6 py-10 text-center sm:gap-6 sm:px-10 md:py-14">
        {badge && <Badge variant="outline" className="animate-fade-in-up border-white/20 bg-white/10 text-white opacity-0 delay-100"><Sparkles size={13} />{badge.text}</Badge>}
        <h2 className="animate-fade-in-up max-w-2xl text-3xl font-semibold leading-tight tracking-tight opacity-0 delay-200 sm:text-4xl">{title}</h2>
        {description && <p className="animate-fade-in-up max-w-xl text-sm leading-7 text-emerald-50/75 opacity-0 delay-300 sm:text-base">{description}</p>}
        <Button asChild variant={action.variant === "glow" ? "glow" : "default"} size="lg" className="animate-fade-in-up bg-white text-emerald-950 opacity-0 delay-500 hover:bg-emerald-50">
          <a href={action.href} onClick={onAction}>{action.text}<ArrowUpRight size={17} /></a>
        </Button>
        {withGlow && <div aria-hidden="true" className="fade-top-lg pointer-events-none absolute inset-0 rounded-[2rem] shadow-glow opacity-0 animate-scale-in delay-700" />}
      </div>
    </section>
  );
}
