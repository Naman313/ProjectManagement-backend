const { Storage } = require("@google-cloud/storage");
const path = require("path");

require("dotenv").config();

// Path to your service account key file
const serviceKey = path.join(__dirname, process.env.GOOGLE_CLOUD_SERVICE_KEY);

const storage = new Storage({
  keyFilename: serviceKey,
  projectId: process.env.GCLOUD_PROJECT_ID,
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

module.exports = bucket;
