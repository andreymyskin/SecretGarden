/**
 * Entry point for hosts that start Node apps through Phusion Passenger
 * (Beget shared hosting: `PassengerStartupFile server.js`).
 *
 * Passenger provides the port via PORT and runs the file from the project root,
 * so `data/` and `public/uploads/` resolve exactly as with `next start`.
 * Locally keep using `npm run dev` / `npm run start`.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- plain CommonJS: Passenger runs this file without bundling */
process.env.NODE_ENV = "production";

const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "127.0.0.1";

const app = next({ dev: false, dir: __dirname, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`> Secret Garden is ready on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start Next.js server", error);
    process.exit(1);
  });
