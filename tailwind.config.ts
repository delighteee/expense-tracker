import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F6E56",
        "primary-light": "#E1F5EE",
        "primary-dark": "#0a5240",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "sans-serif"],
      },
      maxWidth: {
        mobile: "480px",
      },
    },
  },
  plugins: [],
};
export default config;
