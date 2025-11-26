// backend/src/utils/uploadUtils.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 업로드 디렉토리 설정
const UPLOAD_DIR = path.join(__dirname, '../../uploads/markers');

// 업로드 디렉토리가 없으면 생성
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // 고유 파일명 생성: userId_timestamp_originalname
    const userId = req.user?.user_id || 'unknown';
    const uniqueSuffix = `${userId}_${Date.now()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// 파일 필터 (이미지만 허용)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('지원하지 않는 이미지 형식입니다. (jpg, png, gif, webp만 가능)'), false);
  }
};

// Multer 인스턴스 생성
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
});

// 이미지 URL 생성 헬퍼
const getImageUrl = (filename) => {
  return `/uploads/markers/${filename}`;
};

// 이미지 파일 삭제 헬퍼
const deleteImage = (imageUrl) => {
  if (!imageUrl) return;
  
  const filename = path.basename(imageUrl);
  const filepath = path.join(UPLOAD_DIR, filename);
  
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};

module.exports = {
  upload,
  getImageUrl,
  deleteImage,
  UPLOAD_DIR,
};

