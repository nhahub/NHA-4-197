import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F2F4EC",
        canopy: "#152018",
        ink: "#1B2A1E",
        moss: "#3E5C3A",
        fern: "#5C7A52",
        amber: "#C97A2B",
        clay: "#B14A34",
        line: "#D8D3C4",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
