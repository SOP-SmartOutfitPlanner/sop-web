import { createServer } from "https";
import { parse } from "url";
import next from "next";
import { readFileSync } from "fs";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: readFileSync("./cert/key.pem"),
  cert: readFileSync("./cert/cert.pem"),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  }).listen(3000, () => {
    console.log("🚀 HTTPS: https://localhost:3000");
  });
});
