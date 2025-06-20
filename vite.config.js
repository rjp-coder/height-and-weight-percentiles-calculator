import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    include: ["**/*.test.(js)|(tsx)"],
    globals: true,
  },
  base: "/height-and-weight-percentiles-calculator/",
});
