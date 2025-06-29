const { spawn } = require("child_process");

const isWindows = process.platform === "win32";
const command = isWindows ? "cmd" : "npm";
const args = isWindows ? ["/c", "npm", "run", "dev"] : ["run", "dev"];

// 🔻 Keywords or phrases to hide from terminal output
const IGNORE_PATTERNS = [
  "webpack-internal://",
  "node_modules",
  "React does not recognize",
  "Warning: NaN is an invalid value",
  "C:\\REACT\\linkPopLive\\node_modules\\next\\dist\\compiled\\next-server",
  "Import trace for requested module",
  "at Lazy",
  "at Suspense",
  "ServerInsertedHTMLProvider",
  "`NaN` is an invalid value",
  "is not exported from",
  "does not contain a default export",
  "./lib/",
  "./app/",
  "at button",
  "at div",
  "at main",
  "at body",
  "at html",
  "./chatServer/models/",
];

// 🔎 Check if a line should be hidden
const shouldSkipLine = (line) => {
  return IGNORE_PATTERNS.some((pattern) => line.includes(pattern));
};

// 🧹 Filter unwanted lines
const filterOutput = (data) => {
  const lines = data.toString().split("\n");
  const filtered = lines.filter((line) => !shouldSkipLine(line));
  return filtered.join("\n");
};

// 🛠️ Spawn the dev process
const proc = spawn(command, args, {
  shell: false,
  stdio: "pipe",
});

// 📤 Output filtered stdout
proc.stdout.on("data", (data) => {
  process.stdout.write(filterOutput(data) + "\n");
});

// 📤 Output filtered stderr
proc.stderr.on("data", (data) => {
  process.stderr.write(filterOutput(data) + "\n");
});

// 🧼 Exit message
proc.on("close", (code) => {
  console.log(`✅ Dev server exited with code ${code}`);
});
