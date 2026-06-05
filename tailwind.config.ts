import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: "#121212",
        primaryText: "#f5f5f7",
        secondaryText: "#86868b",
        bbGreen: "#18c744",
        bbDarkGreen: "#0F5B30"
      },
    },
  },
  plugins: [],
};

export default config;
