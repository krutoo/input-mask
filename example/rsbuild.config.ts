import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  output: {
    polyfill: "off",
    assetPrefix: "/input-mask/",
  },
  html: {
    title: "Example of @krutoo/input-mask",
  },
  plugins: [pluginReact()],
});
