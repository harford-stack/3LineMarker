// backend/src/seeds/updateImages.js
// 기존 마커들에 이미지 URL 추가
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// 카테고리별 무료 이미지 URL (Unsplash)
const MARKER_IMAGES_BY_CATEGORY = {
  RESTAURANT: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
  ],
  CAFE: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
    'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=400',
  ],
  TRAVEL: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
  ],
  DAILY: [
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400',
    'https://images.unsplash.com/photo-1489367874814-f5d040621dd8?w=400',
    'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400',
    'https://images.unsplash.com/photo-1484627147104-f5197bcd6651?w=400',
  ],
  PHOTO: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
    'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?w=400',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400',
  ],
  GENERAL: [
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400',
  ],
};

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 실제 파일이 존재하는지 확인하는 함수
function checkFileExists(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith('/uploads/markers/')) {
    return false;
  }
  
  const filename = path.basename(imageUrl);
  const filepath = path.join(__dirname, '../../uploads/markers', filename);
  return fs.existsSync(filepath);
}

async function updateImages() {
  console.log('🖼️ 마커 이미지 업데이트 시작...\n');

  try {
    // 모든 마커 조회
    const [allMarkers] = await db.query(`
      SELECT MARKER_ID, CATEGORY, IMAGE_URL
      FROM LM_MARKERS
    `);

    console.log(`📍 전체 마커: ${allMarkers.length}개\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const marker of allMarkers) {
      // 이미지가 없거나 빈 문자열인 경우
      if (!marker.IMAGE_URL || marker.IMAGE_URL === '') {
        const category = marker.CATEGORY || 'GENERAL';
        const images = MARKER_IMAGES_BY_CATEGORY[category] || MARKER_IMAGES_BY_CATEGORY.GENERAL;
        const imageUrl = randomItem(images);

        await db.query(
          'UPDATE LM_MARKERS SET IMAGE_URL = ? WHERE MARKER_ID = ?',
          [imageUrl, marker.MARKER_ID]
        );
        updatedCount++;
        continue;
      }

      // 로컬 경로인 경우 실제 파일 존재 여부 확인
      if (marker.IMAGE_URL.startsWith('/uploads/markers/')) {
        if (checkFileExists(marker.IMAGE_URL)) {
          // 파일이 존재하면 유지
          skippedCount++;
          continue;
        } else {
          // 파일이 없으면 Unsplash URL로 교체
          const category = marker.CATEGORY || 'GENERAL';
          const images = MARKER_IMAGES_BY_CATEGORY[category] || MARKER_IMAGES_BY_CATEGORY.GENERAL;
          const imageUrl = randomItem(images);

          await db.query(
            'UPDATE LM_MARKERS SET IMAGE_URL = ? WHERE MARKER_ID = ?',
            [imageUrl, marker.MARKER_ID]
          );
          updatedCount++;
        }
      }
      // 이미 외부 URL(Unsplash 등)인 경우는 그대로 유지
    }

    console.log(`═══════════════════════════════════════`);
    console.log(`🎉 이미지 업데이트 완료!`);
    console.log(`═══════════════════════════════════════`);
    console.log(`✓ ${updatedCount}개의 마커 이미지 업데이트됨`);
    console.log(`✓ ${skippedCount}개의 로컬 이미지 유지됨`);
    console.log(`═══════════════════════════════════════\n`);

  } catch (error) {
    console.error('❌ 업데이트 중 오류:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

updateImages();

