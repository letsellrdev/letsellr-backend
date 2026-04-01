import path from "path";
import fs from "fs";

const uploadDir = "uploads";

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Step 1: Generate a local "uploadUrl"
export const generateLocalUploadURL = async (req, res) => {
    try {
        const { files } = req.body;

        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ message: "Files array is required" });
        }

        const urls = files.map((file) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const filename = uniqueSuffix + path.extname(file.name);
            const protocol = req.protocol;
            const host = req.get("host");

            // The frontend will PUT to this URL
            const uploadUrl = `${protocol}://${host}/letseller/property/upload-local/${filename}`;
            // The final URL where the file is served statically
            const fileUrl = `${protocol}://${host}/uploads/${filename}`;
            console.log(fileUrl, "fileUrl");

            return {
                uploadUrl,
                key: filename,
                fileUrl: fileUrl,
            };
        });

        res.json({ urls });
    } catch (err) {
        console.error("Error generating local upload URL:", err);
        res.status(500).json({ message: "Failed to generate local upload URL", error: err.message });
    }
};

// Step 2: Handle the PUT request from the frontend
export const handleLocalUpload = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    const writeStream = fs.createWriteStream(filePath);

    req.pipe(writeStream);

    writeStream.on('finish', () => {
        console.log(`File saved locally: ${filename}`);
        res.status(200).send('OK');
    });

    writeStream.on('error', (err) => {
        console.error('Error saving file:', err);
        res.status(500).send('Error saving file');
    });

    req.on('error', (err) => {
        console.error('Request error during upload:', err);
        writeStream.destroy();
        res.status(500).send('Error receiving file');
    });
};
