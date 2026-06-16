/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#07070b",
          900: "#0b0b12",
          850: "#101019",
          800: "#15151f",
          700: "#1d1d2b",
          600: "#2a2a3d",
        },
        electric: "#3b82f6",
        plasma: "#8b5cf6",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139,92,246,0.18), 0 0 40px -8px rgba(139,92,246,0.35)",
        "glow-blue": "0 0 0 1px rgba(59,130,246,0.18), 0 0 40px -8px rgba(59,130,246,0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.85" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400%)" },
        },
        "border-flow": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "dot-bounce": {
          "0%, 80%, 100%": { transform: "scale(0.5)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        scan: "scan 2.2s linear infinite",
        "border-flow": "border-flow 4s ease infinite",
        "dot-bounce": "dot-bounce 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
