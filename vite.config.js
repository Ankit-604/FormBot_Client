import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT || 4173,
    host: true,
  },
  build: {
    outDir: "dist",
  },
  define: {
    "process.env": process.env, // Ensure all environment variables are available in your code
  },
});

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: process.env.PORT || 4173, // Bind to the Render-provided port, fallback to 4173
//     host: true, // Expose the app to external IPs
//   },
//   build: {
//     outDir: "dist", // Ensure that build output goes into the 'dist' folder
//   },
// });
