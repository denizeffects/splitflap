import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  external: ["react", "react-dom"],
  // the whole library is client-side; lets next.js app router consumers
  // import it straight into server components
  banner: { js: '"use client";' },
});
