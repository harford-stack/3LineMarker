// backend/src/controllers/markerController.js
const pool = require('../config/database');
const {
  convertMarkerToCamelCase,
  validateMarkerInput,
  isMarkerOwner,
} = require('../utils/markerUtils');
const { getImageUrl, deleteImage } = require('../utils/uploadUtils');

// 공통 에러 응답 함수
const sendError = (res, statusCode, message, error = null) => {
  console.error(message, error?.message || '');
  res.status(statusCode).json({ message, error: error?.message });
};

// 마커 ID로 조회 후 변환된 객체 반환
const getMarkerById = async (markerId) => {
  const [rows] = await pool.query(
    `SELECT m.*, u.USERNAME, u.PROFILE_IMAGE_URL
     FROM LM_MARKERS m
     JOIN LM_USERS u ON m.USER_ID = u.USER_ID
     WHERE m.MARKER_ID = ?`,
    [markerId]
  );
  return rows.length > 0 ? convertMarkerToCamelCase(rows[0]) : null;
};

// 마커 소유권 검증 (존재 여부 + 권한 확인)
const verifyMarkerOwnership = async (markerId, userId) => {
  const [rows] = await pool.query('SELECT USER_ID FROM LM_MARKERS WHERE MARKER_ID = ?', [markerId]);
  
  if (rows.length === 0) {
    return { error: { status: 404, message: '해당 마커를 찾을 수 없습니다.' } };
  }
  if (!isMarkerOwner(rows[0].USER_ID, userId)) {
    return { error: { status: 403, message: '해당 마커에 대한 권한이 없습니다.' } };
  }
  return { success: true };
};

/**
 * 새 마커 생성
 * POST /api/markers
 */
exports.createMarker = async (req, res) => {
  const { line1, line2, line3, latitude, longitude, imageUrl, isPublic, category } = req.body;
  const userId = req.user.user_id;

  const validationError = validateMarkerInput({ line1, latitude, longitude, category });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO LM_MARKERS (user_id, latitude, longitude, line1, line2, line3, image_url, is_public, category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, latitude, longitude, line1, line2 || null, line3 || null, imageUrl || null, isPublic ?? true, category || 'GENERAL']
    );

    const savedMarker = await getMarkerById(result.insertId);
    res.status(201).json({ message: '마커가 성공적으로 추가되었습니다.', marker: savedMarker });
  } catch (error) {
    sendError(res, 500, '마커 생성에 실패했습니다.', error);
  }
};

/**
 * 모든 마커 조회 (다양한 필터링 지원)
 * GET /api/markers?category=RESTAURANT&filter=all|mine|following|bookmarked|popular&lat=35.123&lng=129.123&radius=5
 */
exports.getAllMarkers = async (req, res) => {
  const { category, filter, lat, lng, radius } = req.query;
  const userId = req.user?.user_id;

  try {
    let query = '';
    const params = [];

    // 필터 타입에 따른 기본 쿼리 설정
    switch (filter) {
      case 'mine':
        // 내 마커만
        query = `
          SELECT m.*, u.USERNAME, u.PROFILE_IMAGE_URL
          FROM LM_MARKERS m
          JOIN LM_USERS u ON m.USER_ID = u.USER_ID
          WHERE m.USER_ID = ?
        `;
        params.push(userId);
        break;

      case 'following':
        // 팔로우한 사용자의 마커만
        query = `
          SELECT m.*, u.USERNAME, u.PROFILE_IMAGE_URL
          FROM LM_MARKERS m
          JOIN LM_USERS u ON m.USER_ID = u.USER_ID
          INNER JOIN LM_FOLLOWS f ON m.USER_ID = f.FOLLOWING_ID
          WHERE f.FOLLOWER_ID = ? AND m.IS_PUBLIC = TRUE
        `;
        params.push(userId);
        break;

      case 'bookmarked':
        // 북마크한 마커만
        query = `
          SELECT m.*, u.USERNAME, u.PROFILE_IMAGE_URL
          FROM LM_MARKERS m
          JOIN LM_USERS u ON m.USER_ID = u.USER_ID
          INNER JOIN LM_BOOKMARKS b ON m.MARKER_ID = b.MARKER_ID
          WHERE b.USER_ID = ?
        `;
        params.push(userId);
        break;

      case 'popular':
        // 인기 마커 (좋아요 5개 이상)
        query = `
          SELECT m.*, u.USERNAME, u.PROFILE_IMAGE_URL
          FROM LM_MARKERS m
          JOIN LM_USERS u ON m.USER_ID = u.USER_ID
          WHERE m.LIKE_COUNT >= 5
        `;
        break;

      default:
        // 전체 마커 (공개 + 내 비공개)
        query = `
          SELECT m.*, u.USERNAME, u.PROFILE_IMAGE_URL
          FROM LM_MARKERS m
          JOIN LM_USERS u ON m.USER_ID = u.USER_ID
          WHERE (m.IS_PUBLIC = TRUE OR m.USER_ID = ?)
        `;
        params.push(userId);
        break;
    }

    // 카테고리 필터 추가
    if (category && category !== 'ALL') {
      query += ' AND CATEGORY = ?';
      params.push(category);
    }

    // 위치 기반 필터 (반경 내 마커)
    if (lat && lng && radius) {
      query += ` AND (6371 * acos(cos(radians(?)) * cos(radians(LATITUDE)) * cos(radians(LONGITUDE) - radians(?)) + sin(radians(?)) * sin(radians(LATITUDE)))) < ?`;
      params.push(parseFloat(lat), parseFloat(lng), parseFloat(lat), parseFloat(radius));
    }

    query += ' ORDER BY CREATED_AT DESC';

    const [rows] = await pool.query(query, params);
    const markers = rows.map(convertMarkerToCamelCase);
    res.status(200).json({ markers });
  } catch (error) {
    sendError(res, 500, '마커 조회에 실패했습니다.', error);
  }
};

/**
 * 마커 수정
 * PUT /api/markers/:markerId
 */
exports.updateMarker = async (req, res) => {
  const { markerId } = req.params;
  const { line1, line2, line3, isPublic, imageUrl, category } = req.body;
  const userId = req.user.user_id;

  const validationError = validateMarkerInput({ line1, category, requireCoords: false });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const ownership = await verifyMarkerOwnership(markerId, userId);
    if (ownership.error) {
      return res.status(ownership.error.status).json({ message: ownership.error.message });
    }

    await pool.query(
      `UPDATE LM_MARKERS SET
        LINE1 = ?, LINE2 = ?, LINE3 = ?, IS_PUBLIC = ?, IMAGE_URL = ?, CATEGORY = ?, UPDATED_AT = CURRENT_TIMESTAMP
       WHERE MARKER_ID = ?`,
      [line1, line2 || null, line3 || null, isPublic, imageUrl || null, category || 'GENERAL', markerId]
    );

    const updatedMarker = await getMarkerById(markerId);
    res.status(200).json({ message: '마커가 성공적으로 수정되었습니다.', marker: updatedMarker });
  } catch (error) {
    sendError(res, 500, '마커 수정에 실패했습니다.', error);
  }
};

/**
 * 마커 삭제
 * DELETE /api/markers/:markerId
 */
exports.deleteMarker = async (req, res) => {
  const { markerId } = req.params;
  const userId = req.user.user_id;

  try {
    // 마커 조회 (이미지 삭제를 위해)
    const marker = await getMarkerById(markerId);
    
    const ownership = await verifyMarkerOwnership(markerId, userId);
    if (ownership.error) {
      return res.status(ownership.error.status).json({ message: ownership.error.message });
    }

    // 마커에 연결된 이미지 파일 삭제
    if (marker?.imageUrl) {
      deleteImage(marker.imageUrl);
    }

    await pool.query('DELETE FROM LM_MARKERS WHERE MARKER_ID = ?', [markerId]);
    res.status(200).json({ message: '마커가 성공적으로 삭제되었습니다.', markerId });
  } catch (error) {
    sendError(res, 500, '마커 삭제에 실패했습니다.', error);
  }
};

/**
 * 마커 이미지 업로드
 * POST /api/markers/upload-image
 */
exports.uploadMarkerImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    }

    const imageUrl = getImageUrl(req.file.filename);
    res.status(200).json({ 
      message: '이미지가 성공적으로 업로드되었습니다.',
      imageUrl,
    });
  } catch (error) {
    sendError(res, 500, '이미지 업로드에 실패했습니다.', error);
  }
};
