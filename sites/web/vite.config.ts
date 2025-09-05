import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import oxlintPlugin from "vite-plugin-oxlint";

// https://vite.dev/config/
export default defineConfig({
  plugins: [oxlintPlugin(), tailwindcss(), react()],
});
