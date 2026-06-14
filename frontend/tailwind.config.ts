import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink:"#080B11", panel:"#0F1420", card:"#141926", line:"#1E2840",
        mist:"#6B7A99", signal:"#4AFFA4", accent:"#7B6FFF", warn:"#FF9F4A", danger:"#FF5A5A",
      },
      fontFamily: {
        mono:["var(--font-mono)","ui-monospace","monospace"],
        sans:["var(--font-sans)","ui-sans-serif","system-ui"],
      },
      animation: {
        "spin-slow": "spin 2s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
