'use strict';

/**
 * upload.js — Multer middleware using Cloudinary for persistent image storage.
 *
 * Replaces the previous disk-storage strategy which was incompatible with
 * Render's ephemeral filesystem (files lost on every redeploy).
 *
 * Required environment variables:
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *
 * After upload, req.files[n] exposes:
 *   file.path     → full Cloudinary URL  (store as image.url)
 *   file.filename → Cloudinary public_id (store as image.publicId for deletion)
 */

const multer               = require('multer');
const cloudinary           = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'cheikh-distribution/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'), false);
  }
};

const upload = multer({
  storage,
  limits:     { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  fileFilter,
});

const handleUploadError = (error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Le fichier est trop volumineux. Taille maximale : 5 Mo',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Trop de fichiers. Maximum 5 images par produit',
      });
    }
  }
  if (error.message === 'Seules les images sont autorisées') {
    return res.status(400).json({ success: false, message: error.message });
  }
  next(error);
};

module.exports = {
  uploadProductImages: upload.array('images', 5),
  uploadSingle:        upload.single('image'),
  handleUploadError,
  cloudinary, // exported so controllers can delete images by public_id
};
