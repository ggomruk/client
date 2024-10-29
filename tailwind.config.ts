import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js"
  ],
  theme: {
    extend: {
      fontSize: {
        base: "16px",
        sm: "14px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "30px",
        "4xl": "36px",
        "5xl": "48px",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "primary-container": 'rgb(36,41,46)',
        "primary-container-dark": 'rgb(30,34,40)'
      },
    },
  },
  plugins: [],
};
export default config;
