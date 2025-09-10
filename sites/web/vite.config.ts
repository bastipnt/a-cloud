import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// import oxlintPlugin from "vite-plugin-oxlint";
import path from "node:path";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // oxlintPlugin(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, "../../node_modules/material-icon-theme/icons/*.svg"),
          dest: "material-icons",
        },
      ],
    }),
    react(),
  ],
});
