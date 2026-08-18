import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/front-gym-pro/",
  plugins: [react()],
  build: {
    outDir: "github-pages-dist",
    emptyOutDir: true,
  },
});
