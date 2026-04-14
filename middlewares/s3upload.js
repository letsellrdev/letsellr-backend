import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "dotenv";
config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const generateUploadURL = async (req, res) => {
  try {
    const { files } = req.body;

    console.log("Files received for upload url generation:", files);

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: "Files array is required" });
    }

    const urls = files.map(async (file) => {
      if (!file.name || !file.type) {
        throw new Error("Filename and contentType are required");
      }
      const key = `uploads/${Date.now()}-${file.name}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        ContentType: file.type,
      });

      console.log(`Generating signed URL for: ${file.name} (Type: ${file.type}, Bucket: ${process.env.AWS_S3_BUCKET})`);

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

      return {
        uploadUrl,
        key,
        fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      };
    });

    const results = await Promise.all(urls);
    console.log("Generated upload URLs successfully");
    res.json({ urls: results });
  } catch (err) {
    console.error("Error generating signed URL:", err);
    res.status(500).json({ message: "Failed to generate signed URL", error: err.message });
  }
};

export default generateUploadURL;
