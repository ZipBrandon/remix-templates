import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { flatRoutes } from "./remix-flat-routes/esm/index.js";

export default defineConfig({
  plugins: [remix({
        routes: async (defineRoutes) => {
      return flatRoutes(`routes`, defineRoutes, {
        nestedFolderChar: `-`,
      })
    }



  }), tsconfigPaths()],
});
