import { findproperty, addproperty, updateproperty, deleteproperty, getPropertyCountsByType } from '../controller/propertycontroller.js';
import { propertylist } from '../controller/listingcontroller.js';
import { adminmiddle } from '../middleware/adminmiddleware.js';
import generateUploadURL from '../middlewares/s3upload.js';

const propertyrouter = express.Router();

// Public routes
propertyrouter.get("/", propertylist);
propertyrouter.get("/counts-by-type", getPropertyCountsByType);
propertyrouter.get("/:id", findproperty);

// Upload routes (public - no auth needed for file upload)
propertyrouter.post("/upload-url", generateUploadURL);

// Protected routes (require admin auth)
propertyrouter.use("/", adminmiddle);

propertyrouter.post("/", addproperty);
propertyrouter.put("/:id", updateproperty);
propertyrouter.delete("/:id", deleteproperty);

export default propertyrouter;