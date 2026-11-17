import { spawn } from "node:child_process";

const url = "http://localhost:43123/";

const command =
  process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];

const child = spawn(command, args, { stdio: "ignore", detached: true });
child.on("error", () => {
  console.log(url);
});
child.unref();
