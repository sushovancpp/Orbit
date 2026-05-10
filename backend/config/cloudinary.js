const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createStorage = (folder, resourceType = 'auto') =>
  new CloudinaryStorage({
    cloudinary,
    params: { folder: `orbit/${folder}`, resource_type: resourceType, quality: 'auto', fetch_format: 'auto' },
  });

const uploadPostMedia = multer({ storage: createStorage('posts') });
const uploadAvatar = multer({ storage: createStorage('avatars'), limits: { fileSize: 5 * 1024 * 1024 } });
const uploadStory = multer({ storage: createStorage('stories') });
const uploadReel = multer({ storage: createStorage('reels', 'video') });

module.exports = { cloudinary, uploadPostMedia, uploadAvatar, uploadStory, uploadReel };
