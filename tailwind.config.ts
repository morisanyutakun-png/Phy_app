import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1020",
          soft: "#1C2340",
          muted: "#4B5575",
        },
        brand: {
          DEFAULT: "#3B5BFF",
          dark: "#1E3ADB",
          light: "#E6ECFF",
        },
        arrow: {
          force: "#E0375C",
          velocity: "#22B07D",
          accel: "#F4A72B",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Hiragino Kaku Gothic ProN",
          "Noto Sans JP",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,16,32,0.04), 0 8px 24px rgba(11,16,32,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
