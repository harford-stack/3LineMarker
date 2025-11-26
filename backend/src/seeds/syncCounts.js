// backend/src/seeds/syncCounts.js
// 좋아요/댓글 수 동기화 스크립트
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('../config/database');

async function syncCounts() {
  console.log('🔄 좋아요/댓글 수 동기화 시작...\n');

  try {
    // 1. LIKE_COUNT 동기화
    console.log('❤️ LIKE_COUNT 동기화 중...');
    const [likeResult] = await db.query(`
      UPDATE LM_MARKERS m
      SET LIKE_COUNT = (
        SELECT COUNT(*) FROM LM_LIKES l WHERE l.MARKER_ID = m.MARKER_ID
      )
    `);
    console.log(`  ✓ ${likeResult.affectedRows}개 마커의 LIKE_COUNT 업데이트됨`);

    // 2. COMMENT_COUNT 동기화
    console.log('\n💬 COMMENT_COUNT 동기화 중...');
    const [commentResult] = await db.query(`
      UPDATE LM_MARKERS m
      SET COMMENT_COUNT = (
        SELECT COUNT(*) FROM LM_COMMENTS c WHERE c.MARKER_ID = m.MARKER_ID
      )
    `);
    console.log(`  ✓ ${commentResult.affectedRows}개 마커의 COMMENT_COUNT 업데이트됨`);

    // 3. 결과 확인
    console.log('\n📊 동기화 결과 확인...');
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_markers,
        SUM(LIKE_COUNT) as total_likes,
        SUM(COMMENT_COUNT) as total_comments
      FROM LM_MARKERS
    `);
    
    const [actualLikes] = await db.query('SELECT COUNT(*) as count FROM LM_LIKES');
    const [actualComments] = await db.query('SELECT COUNT(*) as count FROM LM_COMMENTS');

    console.log(`\n═══════════════════════════════════════`);
    console.log(`🎉 동기화 완료!`);
    console.log(`═══════════════════════════════════════`);
    console.log(`📍 총 마커 수: ${stats[0].total_markers}`);
    console.log(`❤️ 좋아요 (마커 합계): ${stats[0].total_likes} / 실제: ${actualLikes[0].count}`);
    console.log(`💬 댓글 (마커 합계): ${stats[0].total_comments} / 실제: ${actualComments[0].count}`);
    console.log(`═══════════════════════════════════════\n`);

  } catch (error) {
    console.error('❌ 동기화 중 오류:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

syncCounts();

