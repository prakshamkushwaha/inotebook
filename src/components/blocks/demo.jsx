import { CTASection } from "@/components/blocks/cta-with-rectangle";

export function CTADemo() {
  return (
    <CTASection
      badge={{ text: "Get started" }}
      title="Make space for your next good idea"
      description="Capture your thoughts, keep them organized, and find them whenever you need them."
      action={{ text: "Open your notebook", href: "#workspace", variant: "default" }}
    />
  );
}
