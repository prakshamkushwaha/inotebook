export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        brand: "hsl(var(--brand))", "brand-foreground": "hsl(var(--brand-foreground))"
      },
      maxWidth: { container: "80rem" },
      boxShadow: {
        soft: "0 20px 70px -35px rgba(33, 43, 35, .28)",
        glow: "0 -16px 128px 0 hsla(var(--brand-foreground) / 0.3) inset, 0 -16px 32px 0 hsla(var(--brand) / 0.25) inset"
      },
      keyframes: {
        "fade-in-up": { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "scale-in": { "0%": { opacity: "0", transform: "scale(.97)" }, "100%": { opacity: "1", transform: "scale(1)" } }
      },
      animation: {
        "fade-in-up": "fade-in-up .5s ease-out forwards",
        "scale-in": "scale-in .5s ease-out forwards"
      }
    }
  },
  plugins: []
};
