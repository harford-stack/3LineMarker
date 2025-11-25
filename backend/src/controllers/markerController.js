// backend/src/controllers/markerController.js
const pool = require('../config/database');

// 새 마커 생성
exports.createMarker = async (req, res) => {
  // ✅ request body에서 LINE1, LINE2, LINE3, latitude, longitude, imageUrl을 받도록 변경
  const { line1, line2, line3, latitude, longitude, imageUrl, isPublic } = req.body;
  const userId = req.user.user_id; // 인증 미들웨어(protect)에서 설정된 사용자 ID

  if (!line1 || !latitude || !longitude) { // ✅ LINE1, latitude, longitude는 필수
    return res.status(400).json({ message: '첫째 줄 글, 위도, 경도는 필수 항목입니다.' });
  }
  
  // imageUrl은 선택 사항이므로 없을 경우 NULL
  const finalImageUrl = imageUrl || null;
  // isPublic 기본값은 true (BOOLEAN 필드는 MySQL에서 0 또는 1로 저장)
  const finalIsPublic = isPublic !== undefined ? isPublic : true;


  try {
    const [result] = await pool.query(
      `INSERT INTO LM_MARKERS (
        user_id, latitude, longitude, line1, line2, line3, image_url, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, latitude, longitude, line1, line2, line3, finalImageUrl, finalIsPublic]
    );

    // 새로 생성된 마커 ID로 마커 정보 다시 조회
    const [rows] = await pool.query('SELECT * FROM LM_MARKERS WHERE MARKER_ID = ?', [result.insertId]);

    // DB에서 조회된 필드명은 대문자/언더스코어로 올 수 있으므로 소문자/카멜케이스로 변환하여 프론트로 전달
    const savedMarker = {
      markerId: rows[0].MARKER_ID,
      userId: rows[0].USER_ID,
      latitude: rows[0].LATITUDE,
      longitude: rows[0].LONGITUDE,
      line1: rows[0].LINE1,
      line2: rows[0].LINE2,
      line3: rows[0].LINE3,
      imageUrl: rows[0].IMAGE_URL,
      createdAt: rows[0].CREATED_AT,
      updatedAt: rows[0].UPDATED_AT,
      likeCount: rows[0].LIKE_COUNT,
      commentCount: rows[0].COMMENT_COUNT,
      isPublic: rows[0].IS_PUBLIC === 1, // BOOLEAN 타입은 MySQL에서 1/0으로 저장되므로 변환
    };

    res.status(201).json({ message: '마커가 성공적으로 추가되었습니다.', marker: savedMarker });

  } catch (error) {
    console.error('마커 생성 중 오류 발생:', error);
    res.status(500).json({ message: '마커 생성에 실패했습니다.', error: error.message });
  }
};

// ✅ 모든 마커 조회
exports.getAllMarkers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM LM_MARKERS'); // ✅ 모든 LM_MARKERS 조회

    // DB에서 조회된 필드명은 대문자/언더스코어로 올 수 있으므로 소문자/카멜케이스로 변환하여 프론트로 전달
    const markers = rows.map(row => ({
      markerId: row.MARKER_ID,
      userId: row.USER_ID,
      latitude: row.LATITUDE,
      longitude: row.LONGITUDE,
      line1: row.LINE1,
      line2: row.LINE2,
      line3: row.LINE3,
      imageUrl: row.IMAGE_URL,
      createdAt: row.CREATED_AT,
      updatedAt: row.UPDATED_AT,
      likeCount: row.LIKE_COUNT,
      commentCount: row.COMMENT_COUNT,
      isPublic: row.IS_PUBLIC === 1, // BOOLEAN 타입은 MySQL에서 1/0으로 저장되므로 변환
    }));

    res.status(200).json({ markers });

  } catch (error) {
    console.error('마커 조회 중 오류 발생:', error);
    res.status(500).json({ message: '마커 조회에 실패했습니다.', error: error.message });
  }
};