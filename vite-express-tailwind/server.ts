import { unstable_createViteServer, unstable_loadViteServerBuild } from "@remix-run/dev";
import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import { commitHash } from "commitHash.ts";
import compression from "compression";
import cors from "cors";
import express from "express";
import morgan from "morgan";

// patch in Remix runtime globals
installGlobals();

// sourceMapSupport.install();

/**
 * @typedef {import('@remix-run/node').ServerBuild} ServerBuild
 */

function getBuildVersion() {
  return commitHash || "2023";
}

const build = {
  assets: {
    version: getBuildVersion(),
  },
};

let vite = process.env.NODE_ENV === `production` ? undefined : await unstable_createViteServer();

const app = express();
app.use(compression());

// this is for DEBUGGING the 502s that happen at startup sometimes. I believe it is due to vite optmizing deps and interruppts the requests.

// app.use(`/app/zipdeal-ui/src`, (req, res, next) => {
//   console.log(
//     `/app/zipdeal-ui/src accessed: ${req.method} ${req.path} at ${new Date().toISOString()}`,
//   );
//   next(); // Continue to the next middleware
// });
// handle asset requests
if (vite) {
  app.use(vite.middlewares);
} else {
  app.use(`/build`, express.static(`public/build`, { immutable: true, maxAge: `1y` }));
}

app.use(`/robots.txt`, express.static(`public/robots.txt`, { maxAge: `1h` }));


app.use(`/fonts`, express.static(`public/fonts`, { maxAge: `1h` }));

app.use(express.static(`public`, { maxAge: `1h` }));

app.use(morgan(`tiny`, { skip: shouldLog }));

app.all(`/healthz`, (req, res, next) => {
  let assetVersion = ``;

  if (build && build.assets && build.assets.version) {
    assetVersion = build.assets.version;
  }

  res.status(200).send({ message: `ok`, version: assetVersion });
});

// handle SSR requests
app.all(
  `*`,
  createRequestHandler({
    build: vite ? () => unstable_loadViteServerBuild(vite!) : await import(`./build/index.js`),
    mode: process.env.NODE_ENV,
    getLoadContext(req, res) {
      let assetVersion = ``;

      if (build && build.assets && build.assets.version) {
        assetVersion = build.assets.version;
      }
      return {
        assetVersion,
      };
    },
  }),
);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => console.log(`http://localhost:` + port));

/**
 * Initial build
 * @type {ServerBuild}
 */
// let build = await import(BUILD_PATH);

server.keepAliveTimeout = 10000;
console.log(`Keep-Alive Timeout: ${server.keepAliveTimeout}`);

// Create a request handler that watches for changes to the server build during development.

function shouldLog(req, res) {
  const skipBuild = req.originalUrl.startsWith(`/build`);

  const skipHealth = req.method === `GET` && req.path === `/healthz/`;

  return skipBuild || skipHealth;
}

