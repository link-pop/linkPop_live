const fs = require("fs");
const path = require("path");
const https = require("https");

const modelsDir = path.join(__dirname, "../public/models");
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const modelFiles = [
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model-shard1",
  "face_recognition_model-shard2",
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model-shard1",
  "ssd_mobilenetv1_model-weights_manifest.json",
  "ssd_mobilenetv1_model-shard1",
  "ssd_mobilenetv1_model-shard2",
];

const baseUrl =
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
          console.log(`Downloaded: ${dest}`);
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

async function downloadModels() {
  console.log("Starting to download face-api.js models...");
  for (const file of modelFiles) {
    const url = `${baseUrl}/${file}`;
    const dest = path.join(modelsDir, file);
    console.log(`Downloading ${url}...`);
    await downloadFile(url, dest);
  }
  console.log("All models downloaded successfully!");
}

downloadModels().catch(console.error);
