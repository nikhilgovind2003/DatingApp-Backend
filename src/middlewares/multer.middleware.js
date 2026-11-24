import multer from "multer";
import os from "os";

const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, os.tmpdir()),
    filename: (_, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname.replace(/[^\w.\-]/g, "_"))
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_, file, cb) => {
        if (/^(image|video|audio)\//.test(file.mimetype) || file.mimetype === 'application/pdf') return cb(null, true);
        cb(new Error('Unsupported file type'));
    },
})

export default upload;
