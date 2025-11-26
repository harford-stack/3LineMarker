// backend/src/seeds/seedTestData.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('../config/database');
const { hashPassword } = require('../utils/passwordUtils');

// 테스트용 이미지 URL들 (placeholder)
const PROFILE_IMAGES = [
  null,
  '/uploads/profiles/avatar1.png',
  '/uploads/profiles/avatar2.png',
  null,
  '/uploads/profiles/avatar3.png',
];

// 카테고리별 무료 이미지 URL (Unsplash)
const MARKER_IMAGES_BY_CATEGORY = {
  RESTAURANT: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'https://images.unsplash.com/photo-1482049016gy-d10xswae253c?w=400',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
    null,
  ],
  CAFE: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
    'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=400',
    null,
  ],
  TRAVEL: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
    null,
  ],
  DAILY: [
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400',
    'https://images.unsplash.com/photo-1489367874814-f5d040621dd8?w=400',
    'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400',
    'https://images.unsplash.com/photo-1484627147104-f5197bcd6651?w=400',
    null,
  ],
  PHOTO: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
    'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?w=400',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400',
    null,
  ],
  GENERAL: [
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400',
    null,
  ],
};

// 부산 지역 좌표 범위
const BUSAN_LAT = { min: 35.05, max: 35.25 };
const BUSAN_LNG = { min: 128.90, max: 129.15 };

// 랜덤 좌표 생성
const randomLat = () => Math.random() * (BUSAN_LAT.max - BUSAN_LAT.min) + BUSAN_LAT.min;
const randomLng = () => Math.random() * (BUSAN_LNG.max - BUSAN_LNG.min) + BUSAN_LNG.min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 테스트 사용자 데이터
const testUsers = [
  { userId: 'gamer_pro', username: '게임왕', email: 'gamer@test.com', gender: 'M', bio: '게임하면서 맛집 탐방해요! 🎮🍜' },
  { userId: 'foodie_busan', username: '부산맛집헌터', email: 'foodie@test.com', gender: 'F', bio: '부산 맛집은 제가 다 알아요~ 🍲' },
  { userId: 'cafe_lover', username: '카페투어러', email: 'cafe@test.com', gender: 'F', bio: '커피 없이는 못 살아요 ☕' },
  { userId: 'travel_master', username: '여행의달인', email: 'travel@test.com', gender: 'M', bio: '세계여행이 꿈! ✈️' },
  { userId: 'photo_artist', username: '사진작가', email: 'photo@test.com', gender: 'O', bio: '순간을 담습니다 📸' },
  { userId: 'daily_life', username: '일상기록자', email: 'daily@test.com', gender: 'F', bio: '소소한 일상을 기록해요 📝' },
  { userId: 'night_owl', username: '야행성인간', email: 'night@test.com', gender: 'M', bio: '밤이 되면 활동 시작! 🦉' },
  { userId: 'morning_person', username: '아침형인간', email: 'morning@test.com', gender: 'F', bio: '아침 러닝 후 브런치 ☀️' },
  { userId: 'street_food', username: '길거리음식덕후', email: 'street@test.com', gender: 'M', bio: '포장마차 순례자 🍢' },
  { userId: 'dessert_queen', username: '디저트퀸', email: 'dessert@test.com', gender: 'F', bio: '달달한거 최고! 🍰' },
  { userId: 'ocean_lover', username: '바다사랑', email: 'ocean@test.com', gender: 'M', bio: '해운대가 우리집 앞마당 🌊' },
  { userId: 'mountain_hiker', username: '등산러버', email: 'mountain@test.com', gender: 'F', bio: '부산 산 정복중! ⛰️' },
  { userId: 'beer_master', username: '맥주달인', email: 'beer@test.com', gender: 'M', bio: '수제맥주 리뷰어 🍺' },
  { userId: 'ramen_addict', username: '라면중독자', email: 'ramen@test.com', gender: 'M', bio: '매운 라면 도전중 🍜' },
  { userId: 'bookworm', username: '책벌레', email: 'book@test.com', gender: 'F', bio: '북카페 탐방이 취미 📚' },
  { userId: 'music_fan', username: '음악덕후', email: 'music@test.com', gender: 'O', bio: '라이브 공연 마니아 🎵' },
  { userId: 'art_collector', username: '아트컬렉터', email: 'art@test.com', gender: 'F', bio: '갤러리 투어 좋아요 🎨' },
  { userId: 'fitness_guru', username: '헬스왕', email: 'fitness@test.com', gender: 'M', bio: '오운완! 💪' },
  { userId: 'pet_lover', username: '반려동물천국', email: 'pet@test.com', gender: 'F', bio: '강아지 산책 스팟 공유해요 🐕' },
  { userId: 'vintage_hunter', username: '빈티지헌터', email: 'vintage@test.com', gender: 'O', bio: '빈티지샵 탐방 전문가 🏺' },
];

// 마커 카테고리별 샘플 데이터 (line1, line2, line3 형식)
const markerTemplates = {
  RESTAURANT: [
    { line1: '돼지국밥 맛집 🍲', line2: '진짜 부산 로컬 맛집', line3: '국물이 진하고 고기도 푸짐해요!' },
    { line1: '회센터 추천 🐟', line2: '자갈치시장 근처', line3: '싱싱한 회 저렴하게!' },
    { line1: '밀면 원조집', line2: '여름엔 역시 밀면!', line3: '시원하고 쫄깃한 면발 일품' },
    { line1: '삼겹살 성지 🥩', line2: '두꺼운 삼겹살', line3: '쌈채소 무한리필 가성비 최고' },
    { line1: '해물찜 맛집', line2: '푸짐한 해물찜', line3: '볶음밥까지 4인 완벽' },
    { line1: '곱창 골목 최강', line2: '부산 곱창 골목', line3: '막창도 굿굿! 소주 필수' },
    { line1: '칼국수 전문점', line2: '직접 반죽한 면', line3: '바지락 육수가 시원해요' },
    { line1: '족발보쌈 맛집', line2: '콜라겐 충전 완료!', line3: '부드러운 족발 새우젓 조합' },
    { line1: '떡볶이 성지', line2: '매콤달콤 분식', line3: '튀김이랑 같이 먹으면 최고' },
    { line1: '치킨 맛집 🍗', line2: '바삭바삭 황금비율', line3: '맥주랑 찰떡궁합!' },
  ],
  CAFE: [
    { line1: '오션뷰 카페 🌅', line2: '바다가 한눈에', line3: '노을 질 때 방문 추천' },
    { line1: '베이커리 카페', line2: '직접 구운 빵', line3: '크로플+아메리카노 조합' },
    { line1: '감성 카페 발견 📸', line2: '인스타 감성 물씬', line3: '사진 찍기 좋은 인테리어' },
    { line1: '브런치 카페', line2: '에그베네딕트 맛집', line3: '주말 브런치로 딱!' },
    { line1: '작업하기 좋은 곳', line2: '콘센트 많음', line3: '와이파이 빵빵 작업 완벽' },
    { line1: '숨은 루프탑 카페', line2: '아는 사람만 아는 곳', line3: '야경이 진짜 예뻐요' },
    { line1: '수제 디저트 카페 🍰', line2: '마카롱 케이크 수제', line3: '딸기 케이크 강추!' },
    { line1: '독서하기 좋은 카페', line2: '조용한 분위기', line3: '책 읽으며 힐링' },
  ],
  TRAVEL: [
    { line1: '해운대 야경 스팟 ✨', line2: '밤에 오면 더 멋져', line3: '마린시티 불빛이 로맨틱' },
    { line1: '감천문화마을 📷', line2: '알록달록 마을 풍경', line3: '어린왕자 포토존 필수!' },
    { line1: '광안리 핫플', line2: '광안대교 야경', line3: '치맥하기 좋은 곳!' },
    { line1: '태종대 전망대', line2: '부산 바다 한눈에', line3: '다누비열차 추천' },
    { line1: '송도 케이블카 🚡', line2: '바다 위를 날아가는 기분', line3: '스카이워크 스릴있음' },
    { line1: '용두산공원', line2: '부산타워 야경 최고', line3: '해질녘 방문 추천' },
    { line1: '흰여울문화마을', line2: '영화 속 한 장면', line3: '바다 보이고 사진 예쁨' },
    { line1: '이기대 산책로', line2: '오륙도 해안절경', line3: '트레킹하기 좋아요' },
  ],
  DAILY: [
    { line1: '단골 세탁소 👔', line2: '양복 세탁 맡기기 좋음', line3: '사장님 친절!' },
    { line1: '동네 미용실', line2: '컷트 만원 실력 좋음', line3: '예약 필수!' },
    { line1: '헬스장 추천 💪', line2: '24시간 운영', line3: '기구 최신형이에요' },
    { line1: '문구점 발견', line2: '귀여운 문구류 많음', line3: '다꾸러 필수 방문' },
    { line1: '반려견 미용실 🐕', line2: '강아지 단골', line3: '미용사님 동물 사랑' },
    { line1: '네일샵 추천', line2: '젤네일 오래 감', line3: '디자인 예쁨 가격 착함' },
    { line1: '동네 마트 추천', line2: '저렴한 가격', line3: '신선한 채소!' },
  ],
  PHOTO: [
    { line1: '일출 포인트 🌅', line2: '해운대 일출', line3: '새벽 5시 기상 가치있음' },
    { line1: '벚꽃 명소 🌸', line2: '봄에 벚꽃 터널', line3: '인생샷 건졌습니다' },
    { line1: '야경 촬영 스팟', line2: '삼각대 설치 좋음', line3: '차량 진입 가능!' },
    { line1: '단풍 명소 🍂', line2: '가을 단풍 예쁨', line3: '11월 초 방문 추천' },
    { line1: '그래피티 벽화', line2: '스트릿 감성', line3: '힙한 배경 추천' },
    { line1: '노을 촬영지', line2: '하늘색 시시각각', line3: '타임랩스 촬영 성지' },
    { line1: '반영 사진 포인트', line2: '물에 비친 풍경', line3: '비온 뒤 최고' },
  ],
  GENERAL: [
    { line1: '무료 주차 가능', line2: '숨은 주차 장소', line3: '주변 맛집도 많아요' },
    { line1: '와이파이 빵빵 📶', line2: '공공 와이파이', line3: '급할 때 여기서 작업' },
    { line1: '픽업 포인트', line2: '배달 픽업 좋음', line3: '주차도 잠깐 가능!' },
    { line1: '대기 장소 추천', line2: '약속 기다리기 좋음', line3: '벤치 그늘 있음' },
    { line1: '버스킹 명소 🎵', line2: '주말 버스킹 공연', line3: '분위기 좋아요' },
    { line1: '포켓몬GO 스팟', line2: '포켓스탑 많음', line3: '레이드 하기 좋아요' },
  ],
};

// 댓글 샘플
const commentTemplates = [
  '좋은 정보 감사합니다! 👍',
  '오 여기 가봐야겠네요!',
  '저도 다녀왔는데 진짜 좋았어요!',
  '사진 너무 예뻐요 📸',
  '위치가 정확히 어디에요?',
  '주차는 편한가요?',
  '가격대가 어떻게 되나요?',
  '웨이팅 있나요?',
  '혼자 가도 괜찮을까요?',
  '데이트 코스로 좋을까요? 💕',
  '아이랑 가도 될까요?',
  '강아지 동반 가능한가요? 🐕',
  '영업시간이 어떻게 되나요?',
  '예약 필수인가요?',
  '메뉴 추천해주세요!',
  '분위기 어때요?',
  '저장해둘게요! 📌',
  '다음에 꼭 가볼게요!',
  '여기 단골이에요 ㅎㅎ',
  '숨은 명소네요!',
  '정보 공유 감사해요!',
  '사진 보니까 가고 싶어져요',
  '이런 곳이 있었네요!',
  '부산 여행 때 가봐야겠어요',
  '로컬 맛집이네요!',
];

async function seedTestData() {
  console.log('🎮 테스트 데이터 생성을 시작합니다...\n');

  try {
    // 1. 사용자 생성
    console.log('👤 사용자 생성 중...');
    const hashedPw = await hashPassword('test1234');
    const userIds = [];

    for (const user of testUsers) {
      try {
        // 이미 존재하는지 확인
        const [existing] = await db.query('SELECT USER_ID FROM LM_USERS WHERE USER_ID = ?', [user.userId]);
        if (existing.length > 0) {
          console.log(`  - ${user.userId} 이미 존재, 건너뜀`);
          userIds.push(user.userId);
          continue;
        }

        await db.query(
          `INSERT INTO LM_USERS (USER_ID, PASSWORD, USERNAME, EMAIL, GENDER, BIO, PROFILE_IMAGE_URL)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [user.userId, hashedPw, user.username, user.email, user.gender, user.bio, randomItem(PROFILE_IMAGES)]
        );
        userIds.push(user.userId);
        console.log(`  ✓ ${user.username} (${user.userId}) 생성됨`);
      } catch (err) {
        console.log(`  ✗ ${user.userId} 생성 실패: ${err.message}`);
      }
    }

    // 2. 마커 생성
    console.log('\n📍 마커 생성 중...');
    const markerIds = [];
    const categories = Object.keys(markerTemplates);

    for (let i = 0; i < 60; i++) {
      const category = randomItem(categories);
      const template = randomItem(markerTemplates[category]);
      const userId = randomItem(userIds);
      const lat = randomLat();
      const lng = randomLng();

      try {
        // 카테고리별 이미지 선택
        const categoryImages = MARKER_IMAGES_BY_CATEGORY[category] || MARKER_IMAGES_BY_CATEGORY.GENERAL;
        const imageUrl = randomItem(categoryImages);

        const [result] = await db.query(
          `INSERT INTO LM_MARKERS (USER_ID, LATITUDE, LONGITUDE, LINE1, LINE2, LINE3, IMAGE_URL, CATEGORY)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, lat, lng, template.line1, template.line2, template.line3, imageUrl, category]
        );
        markerIds.push(result.insertId);
        console.log(`  ✓ 마커 #${result.insertId}: ${template.line1}`);
      } catch (err) {
        console.log(`  ✗ 마커 생성 실패: ${err.message}`);
      }
    }

    // 3. 팔로우 관계 생성
    console.log('\n👥 팔로우 관계 생성 중...');
    let followCount = 0;

    for (const follower of userIds) {
      // 각 유저가 3~8명 랜덤 팔로우
      const followNum = randomInt(3, 8);
      const shuffled = userIds.filter(u => u !== follower).sort(() => 0.5 - Math.random());
      const toFollow = shuffled.slice(0, followNum);

      for (const following of toFollow) {
        try {
          await db.query(
            `INSERT IGNORE INTO LM_FOLLOWS (FOLLOWER_ID, FOLLOWING_ID) VALUES (?, ?)`,
            [follower, following]
          );
          followCount++;
        } catch (err) {}
      }
    }
    console.log(`  ✓ ${followCount}개의 팔로우 관계 생성됨`);

    // 4. 좋아요 생성
    console.log('\n❤️ 좋아요 생성 중...');
    let likeCount = 0;

    for (const markerId of markerIds) {
      // 각 마커에 0~10개의 좋아요
      const likeNum = randomInt(0, 10);
      const shuffled = userIds.sort(() => 0.5 - Math.random());
      const likers = shuffled.slice(0, likeNum);
      let markerLikeCount = 0;

      for (const userId of likers) {
        try {
          const [result] = await db.query(
            `INSERT IGNORE INTO LM_LIKES (USER_ID, MARKER_ID) VALUES (?, ?)`,
            [userId, markerId]
          );
          if (result.affectedRows > 0) {
            likeCount++;
            markerLikeCount++;
          }
        } catch (err) {}
      }

      // 마커의 LIKE_COUNT 업데이트
      if (markerLikeCount > 0) {
        await db.query(
          `UPDATE LM_MARKERS SET LIKE_COUNT = LIKE_COUNT + ? WHERE MARKER_ID = ?`,
          [markerLikeCount, markerId]
        );
      }
    }
    console.log(`  ✓ ${likeCount}개의 좋아요 생성됨`);

    // 5. 북마크 생성
    console.log('\n🔖 북마크 생성 중...');
    let bookmarkCount = 0;

    for (const userId of userIds) {
      // 각 유저가 2~8개의 마커 북마크
      const bookmarkNum = randomInt(2, 8);
      const shuffled = markerIds.sort(() => 0.5 - Math.random());
      const toBookmark = shuffled.slice(0, bookmarkNum);

      for (const markerId of toBookmark) {
        try {
          await db.query(
            `INSERT IGNORE INTO LM_BOOKMARKS (USER_ID, MARKER_ID) VALUES (?, ?)`,
            [userId, markerId]
          );
          bookmarkCount++;
        } catch (err) {}
      }
    }
    console.log(`  ✓ ${bookmarkCount}개의 북마크 생성됨`);

    // 6. 댓글 생성
    console.log('\n💬 댓글 생성 중...');
    let commentCount = 0;

    for (const markerId of markerIds) {
      // 각 마커에 0~8개의 댓글
      const commentNum = randomInt(0, 8);
      let markerCommentCount = 0;

      for (let i = 0; i < commentNum; i++) {
        const userId = randomItem(userIds);
        const content = randomItem(commentTemplates);

        try {
          const [result] = await db.query(
            `INSERT INTO LM_COMMENTS (MARKER_ID, USER_ID, CONTENT) VALUES (?, ?, ?)`,
            [markerId, userId, content]
          );
          if (result.affectedRows > 0) {
            commentCount++;
            markerCommentCount++;
          }
        } catch (err) {}
      }

      // 마커의 COMMENT_COUNT 업데이트
      if (markerCommentCount > 0) {
        await db.query(
          `UPDATE LM_MARKERS SET COMMENT_COUNT = COMMENT_COUNT + ? WHERE MARKER_ID = ?`,
          [markerCommentCount, markerId]
        );
      }
    }
    console.log(`  ✓ ${commentCount}개의 댓글 생성됨`);

    // 7. 알림 생성
    console.log('\n🔔 알림 생성 중...');
    let notificationCount = 0;

    // 좋아요 알림
    for (let i = 0; i < 30; i++) {
      const markerId = randomItem(markerIds);
      const fromUser = randomItem(userIds);
      
      // 마커 작성자 조회
      const [[marker]] = await db.query('SELECT USER_ID FROM LM_MARKERS WHERE MARKER_ID = ?', [markerId]);
      if (marker && marker.USER_ID !== fromUser) {
        try {
          await db.query(
            `INSERT INTO LM_NOTIFICATIONS (USER_ID, TYPE, FROM_USER_ID, MARKER_ID, MESSAGE)
             VALUES (?, 'LIKE', ?, ?, ?)`,
            [marker.USER_ID, fromUser, markerId, `회원님의 게시물을 좋아합니다.`]
          );
          notificationCount++;
        } catch (err) {}
      }
    }

    // 댓글 알림
    for (let i = 0; i < 30; i++) {
      const markerId = randomItem(markerIds);
      const fromUser = randomItem(userIds);
      
      const [[marker]] = await db.query('SELECT USER_ID FROM LM_MARKERS WHERE MARKER_ID = ?', [markerId]);
      if (marker && marker.USER_ID !== fromUser) {
        try {
          await db.query(
            `INSERT INTO LM_NOTIFICATIONS (USER_ID, TYPE, FROM_USER_ID, MARKER_ID, MESSAGE)
             VALUES (?, 'COMMENT', ?, ?, ?)`,
            [marker.USER_ID, fromUser, markerId, `회원님의 게시물에 댓글을 남겼습니다.`]
          );
          notificationCount++;
        } catch (err) {}
      }
    }

    // 팔로우 알림
    for (let i = 0; i < 20; i++) {
      const fromUser = randomItem(userIds);
      const toUser = randomItem(userIds.filter(u => u !== fromUser));
      
      try {
        await db.query(
          `INSERT INTO LM_NOTIFICATIONS (USER_ID, TYPE, FROM_USER_ID, MESSAGE)
           VALUES (?, 'FOLLOW', ?, ?)`,
          [toUser, fromUser, `회원님을 팔로우하기 시작했습니다.`]
        );
        notificationCount++;
      } catch (err) {}
    }
    console.log(`  ✓ ${notificationCount}개의 알림 생성됨`);

    console.log('\n═══════════════════════════════════════');
    console.log('🎉 테스트 데이터 생성 완료!');
    console.log('═══════════════════════════════════════');
    console.log(`👤 사용자: ${userIds.length}명`);
    console.log(`📍 마커: ${markerIds.length}개`);
    console.log(`👥 팔로우: ${followCount}개`);
    console.log(`❤️ 좋아요: ${likeCount}개`);
    console.log(`🔖 북마크: ${bookmarkCount}개`);
    console.log(`💬 댓글: ${commentCount}개`);
    console.log(`🔔 알림: ${notificationCount}개`);
    console.log('\n📌 테스트 계정 비밀번호: test1234');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ 데이터 생성 중 오류:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

// 실행
seedTestData();

