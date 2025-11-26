// backend/src/controllers/commentController.js
const pool = require('../config/database');
const { createNotification } = require('./notificationController');

// 공통 에러 응답 함수
const sendError = (res, statusCode, message, error = null) => {
  console.error(message, error?.message || '');
  res.status(statusCode).json({ message, error: error?.message });
};

// 댓글 객체 camelCase 변환
const convertCommentToCamelCase = (comment) => ({
  commentId: comment.COMMENT_ID,
  markerId: comment.MARKER_ID,
  userId: comment.USER_ID,
  username: comment.USERNAME,
  profileImageUrl: comment.PROFILE_IMAGE_URL,
  content: comment.CONTENT,
  createdAt: comment.CREATED_AT,
});

/**
 * 댓글 작성
 * POST /api/comments/:markerId
 */
exports.createComment = async (req, res) => {
  const { markerId } = req.params;
  const { content } = req.body;
  const userId = req.user.user_id;

  if (!content || content.trim() === '') {
    return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
  }

  try {
    // 마커 존재 여부 및 작성자 확인
    const [markers] = await pool.query(
      'SELECT MARKER_ID, USER_ID FROM LM_MARKERS WHERE MARKER_ID = ?',
      [markerId]
    );
    if (markers.length === 0) {
      return res.status(404).json({ message: '해당 마커를 찾을 수 없습니다.' });
    }
    const markerOwnerId = markers[0].USER_ID;

    // 댓글 추가
    const [result] = await pool.query(
      'INSERT INTO LM_COMMENTS (MARKER_ID, USER_ID, CONTENT) VALUES (?, ?, ?)',
      [markerId, userId, content.trim()]
    );

    // 마커의 댓글 수 증가
    await pool.query(
      'UPDATE LM_MARKERS SET COMMENT_COUNT = COMMENT_COUNT + 1 WHERE MARKER_ID = ?',
      [markerId]
    );

    // 생성된 댓글 조회 (사용자 정보 포함)
    const [comments] = await pool.query(
      `SELECT c.*, u.USERNAME, u.PROFILE_IMAGE_URL 
       FROM LM_COMMENTS c 
       JOIN LM_USERS u ON c.USER_ID = u.USER_ID 
       WHERE c.COMMENT_ID = ?`,
      [result.insertId]
    );

    const comment = convertCommentToCamelCase(comments[0]);

    // 알림 생성 (마커 작성자에게)
    await createNotification(markerOwnerId, 'COMMENT', userId, parseInt(markerId));

    res.status(201).json({
      message: '댓글이 작성되었습니다.',
      comment,
    });
  } catch (error) {
    sendError(res, 500, '댓글 작성에 실패했습니다.', error);
  }
};

/**
 * 마커의 댓글 목록 조회
 * GET /api/comments/:markerId
 */
exports.getComments = async (req, res) => {
  const { markerId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // 마커 존재 여부 확인
    const [markers] = await pool.query(
      'SELECT MARKER_ID, COMMENT_COUNT FROM LM_MARKERS WHERE MARKER_ID = ?',
      [markerId]
    );
    if (markers.length === 0) {
      return res.status(404).json({ message: '해당 마커를 찾을 수 없습니다.' });
    }

    // 댓글 목록 조회 (최신순)
    const [comments] = await pool.query(
      `SELECT c.*, u.USERNAME, u.PROFILE_IMAGE_URL 
       FROM LM_COMMENTS c 
       JOIN LM_USERS u ON c.USER_ID = u.USER_ID 
       WHERE c.MARKER_ID = ?
       ORDER BY c.CREATED_AT DESC
       LIMIT ? OFFSET ?`,
      [markerId, parseInt(limit), parseInt(offset)]
    );

    res.status(200).json({
      comments: comments.map(convertCommentToCamelCase),
      totalCount: markers[0].COMMENT_COUNT,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    sendError(res, 500, '댓글 조회에 실패했습니다.', error);
  }
};

/**
 * 댓글 삭제
 * DELETE /api/comments/:commentId
 */
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.user_id;

  try {
    // 댓글 조회 및 권한 확인
    const [comments] = await pool.query(
      'SELECT COMMENT_ID, MARKER_ID, USER_ID FROM LM_COMMENTS WHERE COMMENT_ID = ?',
      [commentId]
    );

    if (comments.length === 0) {
      return res.status(404).json({ message: '해당 댓글을 찾을 수 없습니다.' });
    }

    const comment = comments[0];

    if (comment.USER_ID !== userId) {
      return res.status(403).json({ message: '댓글 삭제 권한이 없습니다.' });
    }

    // 댓글 삭제
    await pool.query('DELETE FROM LM_COMMENTS WHERE COMMENT_ID = ?', [commentId]);

    // 마커의 댓글 수 감소
    await pool.query(
      'UPDATE LM_MARKERS SET COMMENT_COUNT = GREATEST(COMMENT_COUNT - 1, 0) WHERE MARKER_ID = ?',
      [comment.MARKER_ID]
    );

    res.status(200).json({
      message: '댓글이 삭제되었습니다.',
      commentId: parseInt(commentId),
    });
  } catch (error) {
    sendError(res, 500, '댓글 삭제에 실패했습니다.', error);
  }
};

