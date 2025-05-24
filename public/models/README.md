# face-api.js Models

This directory should contain the face-api.js models required for face detection, recognition, and matching.

## Required Models

Place the following model files in this directory:

- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`
- `face_recognition_model-shard2`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `ssd_mobilenetv1_model-weights_manifest.json`
- `ssd_mobilenetv1_model-shard1`
- `ssd_mobilenetv1_model-shard2`

## How to Download Models

You can download the models from the official face-api.js repository:

1. Visit [https://github.com/justadudewhohacks/face-api.js/tree/master/weights](https://github.com/justadudewhohacks/face-api.js/tree/master/weights)
2. Download each of the required model files listed above
3. Place the downloaded files in this directory

Alternatively, you can run the following script to download all the models at once:

```javascript
const fs = require("fs");
const path = require("path");
const https = require("https");

const modelsDir = path.join(__dirname, "models");
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir);
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
  for (const file of modelFiles) {
    const url = `${baseUrl}/${file}`;
    const dest = path.join(modelsDir, file);
    await downloadFile(url, dest);
  }
  console.log("All models downloaded successfully!");
}

downloadModels().catch(console.error);
```

Save this script as `download-models.js` and run it with Node.js to download all the required models.

## Testing

Make sure the models are correctly loaded in your application before attempting face detection or recognition operations. If you encounter issues with model loading, check the browser console for error messages.
