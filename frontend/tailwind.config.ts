import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // SikaChain Natural Palette
        forest: {
          400: "#4ade80", // Light green
          500: "#22c55e", // Primary green - growth & prosperity
          600: "#16a34a", // Darker green
          700: "#15803d", // Deep green
        },
        gold: {
          400: "#fbbf24", // Light gold
          500: "#f59e0b", // Primary gold - wealth & success
          600: "#d97706", // Darker gold
          700: "#b45309", // Deep gold
        },
        trust: {
          400: "#60a5fa", // Light blue
          500: "#3b82f6", // Primary blue - trust & stability
          600: "#2563eb", // Darker blue
          700: "#1d4ed8", // Deep blue
        },
        earth: {
          50: "#ffffff", // Pure white
          100: "#f9fafb", // Very light gray
          200: "#f3f4f6", // Light gray
          300: "#e5e7eb", // Medium light gray
          400: "#d1d5db", // Medium gray
          500: "#9ca3af", // Medium gray (keeping for contrast)
          600: "#6b7280", // Darker gray
          700: "#374151", // Dark gray
          800: "#1f2937", // Very dark gray
          900: "#111827", // Darkest background (keeping dark theme)
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
