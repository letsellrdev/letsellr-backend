import ImageKit from "@imagekit/nodejs";
import { config } from "dotenv";
config();

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

/**
 * generateUploadURL — ImageKit edition
 *
 * Returns ImageKit authentication parameters so the frontend can upload
 * files directly to ImageKit without exposing the private key.
 *
 * Each entry in the response `urls` array contains:
 *   - token      : unique upload token
 *   - expire     : UNIX timestamp after which the token expires
 *   - signature  : HMAC-SHA1 signature
 *   - publicKey  : ImageKit public key (needed by the frontend SDK)
 *   - urlEndpoint: Base URL for accessing uploaded files
 *   - fileName   : suggested filename to use when uploading
 *   - folder     : target folder inside the ImageKit Media Library
 *   - fileUrl    : the public URL the image will be reachable at after upload
 */
const generateUploadURL = async (req, res) => {
  try {
    const { files } = req.body;

    console.log("Files received for upload url generation:", files);

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: "Files array is required" });
    }

    const folder = "uploads";

    const urls = files.map((file) => {
      if (!file.name) {
        throw new Error("Filename is required");
      }

      // Generate fresh auth params per file (each gets a unique token)
      const authParams = imagekit.helper.getAuthenticationParameters();

      const sanitizedName = `${Date.now()}-${file.name}`;
      const fileUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/${folder}/${sanitizedName}`;

      console.log(`Prepared ImageKit upload params for: ${file.name}`);

      return {
        ...authParams,            // token, expire, signature
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        fileName: sanitizedName,
        folder: `/${folder}`,
        fileUrl,                  // pre-computed final URL for the DB
      };
    });

    console.log("Generated ImageKit upload params successfully");
    res.json({ urls });
  } catch (err) {
    console.error("Error generating ImageKit upload params:", err);
    res
      .status(500)
      .json({ message: "Failed to generate upload parameters", error: err.message });
  }
};

export default generateUploadURL;
