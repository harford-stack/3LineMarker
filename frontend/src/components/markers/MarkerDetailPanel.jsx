// frontend/src/components/markers/MarkerDetailPanel.jsx
/**
 * ============================================
 * 📝 MarkerDetailPanel.jsx - 마커 상세 정보 패널 컴포넌트
 * ============================================
 * 
 * 이 파일은 마커의 상세 정보를 표시하고 수정할 수 있는 컴포넌트입니다.
 * 
 * 주요 기능:
 * 1. 마커의 3줄 글 표시/수정
 * 2. 이미지 표시/업로드/삭제
 * 3. 카테고리 선택
 * 4. 공개/비공개 설정
 * 5. 좋아요, 북마크, 댓글 기능
 * 6. 마커 저장/삭제
 * 
 * 작동 원리:
 * - 소유자(isOwner): 수정 가능한 입력창 표시
 * - 비소유자: 읽기 전용으로 표시
 * - 새 마커(isNewMarker): 저장 버튼 표시
 * - 기존 마커: 수정/삭제 버튼 표시
 */

// ===== 1단계: 필요한 도구들 가져오기 =====
// React의 기본 기능들
import React, { useRef, useState, useEffect } from 'react';

// React Router: 페이지 이동
import { useNavigate } from 'react-router-dom';

// Material-UI 컴포넌트들
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel'; // 체크박스와 라벨을 함께 사용
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';                      // 요소들을 나란히 배치
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';                  // 구분선
import Collapse from '@mui/material/Collapse';               // 접기/펼치기 애니메이션
import ToggleButton from '@mui/material/ToggleButton';       // 토글 버튼
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'; // 토글 버튼 그룹
import Tooltip from '@mui/material/Tooltip';                 // 툴팁 (마우스 올리면 설명 표시)
import Chip from '@mui/material/Chip';                       // 작은 라벨

// 아이콘들
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'; // 이미지 추가 아이콘
import DeleteIcon from '@mui/icons-material/Delete';                        // 삭제 아이콘
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';  // 댓글 아이콘
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';                 // 펼치기 아이콘
import ExpandLessIcon from '@mui/icons-material/ExpandLess';                 // 접기 아이콘
import SaveIcon from '@mui/icons-material/Save';                             // 저장 아이콘
import PersonIcon from '@mui/icons-material/Person';                        // 사용자 아이콘

// 좋아요, 댓글, 북마크 컴포넌트
import LikeButton from '../LikeButton';                       // 좋아요 버튼
import BookmarkButton from '../BookmarkButton';              // 북마크 버튼
import CommentList from '../comments/CommentList';           // 댓글 목록

// 카테고리 설정
import { MARKER_CATEGORIES, getCategoryInfo } from '../../utils/categories';

// ===== 2단계: 상수 정의 =====
/**
 * API_BASE_URL: API 서버 주소
 * 
 * 환경 변수에서 가져옵니다.
 * 예: 'http://localhost:3010'
 */
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * textFieldStyle: 공통 TextField 스타일
 * 
 * 모든 입력창에 공통으로 적용할 스타일입니다.
 * 레트로 게임 느낌의 디자인입니다.
 */
const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,                      // 둥근 모서리 없음 (각진 느낌)
    bgcolor: 'rgba(0, 0, 0, 0.3)',       // 반투명 검은 배경
    '& fieldset': { borderColor: '#00ff00' }, // 기본 테두리 색상 (녹색)
    '&:hover fieldset': { borderColor: '#00ffff' }, // 마우스 올렸을 때 (청록색)
    '&.Mui-focused fieldset': {          // 포커스(클릭)했을 때
      borderColor: '#ff00ff',            // 마젠타 테두리
      boxShadow: '0 0 10px #ff00ff',     // 마젠타 그림자
    },
    '& input, & textarea': {             // input과 textarea 요소
      color: '#e0e0e0',                  // 밝은 회색 글자
      fontFamily: '"VT323", "DungGeunMo", monospace', // 레트로 폰트
      fontSize: '1.1rem',
    },
  },
  '& .MuiInputLabel-root': {             // 라벨 스타일
    color: '#888',
    fontFamily: '"VT323", "DungGeunMo", monospace',
    '&.Mui-focused': { color: '#ff00ff' }, // 포커스된 라벨
  },
};

/**
 * LINE_FIELDS: 3줄 글 입력 필드 설정
 * 
 * 각 줄의 이름, 라벨, 필수 여부를 정의합니다.
 */
const LINE_FIELDS = [
  { name: 'line1', label: 'LINE 1 (필수)', required: true },  // 첫 번째 줄 (필수)
  { name: 'line2', label: 'LINE 2' },                          // 두 번째 줄 (선택)
  { name: 'line3', label: 'LINE 3' },                          // 세 번째 줄 (선택)
];

// ===== 3단계: MarkerDetailPanel 컴포넌트 정의 =====
/**
 * MarkerDetailPanel 함수 컴포넌트
 * 
 * 마커의 상세 정보를 표시하고 수정할 수 있는 패널입니다.
 * 
 * props (부모로부터 받는 데이터):
 * - marker: 마커 데이터 (위치, 내용, 이미지 등)
 * - isOwner: 내가 이 마커의 소유자인지 여부
 * - onSave: 저장 버튼을 클릭했을 때 실행되는 함수
 * - onDelete: 삭제 버튼을 클릭했을 때 실행되는 함수
 * - onImageUpload: 이미지를 업로드할 때 실행되는 함수
 */
function MarkerDetailPanel({ marker, isOwner, onSave, onDelete, onImageUpload }) {
  // ===== React Router 훅 =====
  // navigate: 페이지 이동 함수
  const navigate = useNavigate();

  // ===== useRef: DOM 요소나 값을 참조 =====
  /**
   * useRef란?
   * - DOM 요소에 직접 접근하거나 값을 저장할 때 사용합니다
   * - useState와 달리 값이 변경되어도 컴포넌트가 다시 렌더링되지 않습니다
   */
  
  // refs: 각 입력창의 참조
  // inputRef를 사용해서 입력창의 값을 직접 가져올 수 있습니다
  const refs = {
    line1: useRef(null),  // 첫 번째 줄 입력창
    line2: useRef(null),  // 두 번째 줄 입력창
    line3: useRef(null),  // 세 번째 줄 입력창
  };
  
  // isPublicRef: 공개 여부를 저장하는 ref
  // Checkbox의 onChange에서 직접 업데이트합니다
  const isPublicRef = useRef(marker.isPublic);
  
  // fileInputRef: 파일 입력창의 참조
  // 숨겨진 파일 입력창을 클릭하기 위해 사용합니다
  const fileInputRef = useRef(null);

  // ===== 상태 관리 (useState) =====
  
  // imageUrl: 마커의 이미지 URL
  // marker.imageUrl로 초기화
  const [imageUrl, setImageUrl] = useState(marker.imageUrl);
  
  // previewUrl: 업로드 전 미리보기 이미지 URL
  // null = 미리보기 없음
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // uploading: 이미지 업로드 중인지 여부
  // false = 업로드 중이 아님
  const [uploading, setUploading] = useState(false);
  
  // showComments: 댓글 목록을 표시하는지 여부
  // false = 댓글 목록 숨김
  const [showComments, setShowComments] = useState(false);
  
  // category: 선택된 카테고리
  // marker.category로 초기화 (없으면 'GENERAL')
  const [category, setCategory] = useState(marker.category || 'GENERAL');

  // ===== 계산된 값 =====
  
  /**
   * isNewMarker: 새 마커인지 여부
   * 
   * 임시 마커는 'temp-타임스탬프' 형식이므로
   * 'temp-'로 시작하면 새 마커입니다.
   */
  const isNewMarker = String(marker.markerId).startsWith('temp-');
  
  /**
   * categoryInfo: 현재 카테고리 정보
   * 
   * 카테고리의 아이콘, 색상, 라벨 등을 가져옵니다.
   */
  const categoryInfo = getCategoryInfo(marker.category);

  // ===== useEffect: marker prop이 변경될 때 실행 =====
  /**
   * marker prop이 변경될 때 상태를 업데이트합니다.
   * 
   * 예: 다른 마커를 클릭했을 때
   * 
   * 작동:
   * 1. imageUrl 업데이트
   * 2. category 업데이트
   * 3. previewUrl 초기화 (다른 마커의 미리보기 제거)
   * 4. isPublicRef 업데이트
   */
  useEffect(() => {
    setImageUrl(marker.imageUrl);                    // 이미지 URL 업데이트
    setCategory(marker.category || 'GENERAL');      // 카테고리 업데이트
    setPreviewUrl(null);                             // 미리보기 초기화
    isPublicRef.current = marker.isPublic;           // 공개 여부 업데이트
  }, [marker.markerId, marker.imageUrl, marker.category, marker.isPublic]);
  // 의존성: marker.markerId, marker.imageUrl, marker.category, marker.isPublic
  // 이 중 하나라도 변경되면 다시 실행

  // ===== 함수 정의 =====
  
  /**
   * getFullImageUrl 함수
   * 
   * 이미지 URL을 전체 URL로 변환합니다.
   * 
   * 매개변수:
   * - url: 이미지 URL (상대 경로 또는 전체 URL)
   * 
   * 반환값:
   * - 전체 URL 또는 null
   * 
   * 작동:
   * 1. url이 없으면 null 반환
   * 2. 'http'로 시작하면 전체 URL이므로 그대로 반환
   * 3. 아니면 상대 경로이므로 API_BASE_URL을 앞에 붙임
   */
  const getFullImageUrl = (url) => {
    if (!url) return null;                           // URL이 없으면 null
    if (url.startsWith('http')) return url;          // 전체 URL이면 그대로 반환
    return `${API_BASE_URL}${url}`;                  // 상대 경로면 API 주소 붙이기
  };

  /**
   * handleFileSelect 함수
   * 
   * 파일을 선택했을 때 실행되는 함수입니다.
   * 
   * 매개변수:
   * - e: 이벤트 객체 (선택한 파일 정보 포함)
   * 
   * 작동 순서:
   * 1. 선택한 파일 가져오기
   * 2. FileReader로 미리보기 생성
   * 3. 서버에 이미지 업로드
   * 4. 업로드된 이미지 URL 저장
   */
  const handleFileSelect = async (e) => {
    // e.target.files: 선택한 파일 목록
    // ?.[0]: 첫 번째 파일 (옵셔널 체이닝)
    const file = e.target.files?.[0];
    if (!file) return; // 파일이 없으면 종료

    /**
     * FileReader: 파일을 읽는 객체
     * 
     * 이미지를 미리보기하기 위해 사용합니다.
     */
    const reader = new FileReader();
    
    // reader.onload: 파일 읽기가 완료되면 실행
    reader.onload = (event) => {
      // event.target.result: 읽은 파일의 데이터 URL (base64 형식)
      setPreviewUrl(event.target.result);
    };
    
    // readAsDataURL: 파일을 데이터 URL로 읽기
    reader.readAsDataURL(file);

    // 업로드 시작
    setUploading(true);
    
    try {
      // onImageUpload: 부모 컴포넌트에서 전달받은 이미지 업로드 함수
      // 반환값: 업로드된 이미지의 URL
      const uploadedUrl = await onImageUpload(file);
      
      // 업로드된 이미지 URL 저장
      setImageUrl(uploadedUrl);
      setPreviewUrl(null); // 미리보기 제거 (업로드 완료)
    } catch (err) {
      // 에러 발생 시 미리보기 제거
      setPreviewUrl(null);
    } finally {
      // 성공/실패 관계없이 항상 실행
      setUploading(false); // 업로드 종료
    }
  };

  /**
   * handleRemoveImage 함수
   * 
   * 이미지를 삭제하는 함수입니다.
   * 
   * 작동:
   * 1. imageUrl을 null로 설정
   * 2. previewUrl을 null로 설정
   * 3. 파일 입력창 초기화
   */
  const handleRemoveImage = () => {
    setImageUrl(null);                    // 이미지 URL 제거
    setPreviewUrl(null);                  // 미리보기 제거
    if (fileInputRef.current) {
      fileInputRef.current.value = '';    // 파일 입력창 초기화
    }
  };

  /**
   * handleSave 함수
   * 
   * 저장 버튼을 클릭했을 때 실행되는 함수입니다.
   * 
   * 작동:
   * 1. 각 입력창의 값을 refs를 통해 가져오기
   * 2. 모든 데이터를 모아서 onSave 함수 호출
   */
  const handleSave = () => {
    // onSave: 부모 컴포넌트에서 전달받은 저장 함수
    onSave({
      // refs[name].current?.value: 입력창의 값 가져오기
      // ?. = 옵셔널 체이닝 (없으면 undefined)
      // || '' = 값이 없으면 빈 문자열
      line1: refs.line1.current?.value || '',
      line2: refs.line2.current?.value || '',
      line3: refs.line3.current?.value || '',
      isPublic: isPublicRef.current,      // 공개 여부
      imageUrl,                           // 이미지 URL
      category,                           // 카테고리
    });
  };

  /**
   * handleCategoryChange 함수
   * 
   * 카테고리를 변경했을 때 실행되는 함수입니다.
   * 
   * 매개변수:
   * - event: 이벤트 객체 (사용 안 함)
   * - newCategory: 새로 선택된 카테고리
   * 
   * 작동:
   * newCategory가 null이 아니면 (선택이 해제되지 않았으면)
   * category 상태를 업데이트합니다.
   */
  const handleCategoryChange = (event, newCategory) => {
    if (newCategory !== null) {
      setCategory(newCategory);
    }
  };

  // ===== 계산된 값 =====
  /**
   * displayImageUrl: 화면에 표시할 이미지 URL
   * 
   * previewUrl이 있으면 미리보기 이미지 사용
   * 없으면 업로드된 이미지 URL 사용
   */
  const displayImageUrl = previewUrl || getFullImageUrl(imageUrl);

  // ===== 화면에 그리기 (JSX 반환) =====
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* ===== 작성자 정보 ===== */}
      {/* 새 마커가 아니고 사용자 이름이 있을 때만 표시 */}
      {!isNewMarker && marker.username && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          pb: 2,
          borderBottom: '1px dashed #333',  // 점선 구분선
        }}>
          <PersonIcon sx={{ color: '#00ffff', fontSize: 18 }} />
          {/* 소유자가 아니면 클릭 가능 (프로필 페이지로 이동) */}
          {!isOwner ? (
            <Typography 
              variant="body2" 
              onClick={() => navigate(`/users/${marker.userId}`)}  // 프로필 페이지로 이동
              sx={{ 
                color: '#00ffff',
                fontFamily: '"VT323", "DungGeunMo", monospace',
                cursor: 'pointer',           // 마우스 포인터
                '&:hover': {
                  color: '#00ccff',
                  textDecoration: 'underline', // 밑줄 표시
                },
              }}
            >
              @{marker.username}  {/* 사용자 이름 표시 */}
            </Typography>
          ) : (
            // 소유자면 클릭 불가
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#00ffff',
                fontFamily: '"VT323", "DungGeunMo", monospace',
              }}
            >
              @{marker.username}
            </Typography>
          )}
          {/* 소유자면 "YOU" 라벨 표시 */}
          {isOwner && (
            <Chip 
              label="YOU" 
              size="small" 
              sx={{ 
                ml: 'auto',                  // 왼쪽 여백 자동 (오른쪽 정렬)
                bgcolor: '#00ff00',
                color: '#000',
                fontFamily: '"Press Start 2P", "Galmuri11", cursive',
                fontSize: '0.4rem',
                height: 20,
              }} 
            />
          )}
        </Box>
      )}

      {/* ===== 이미지 영역 ===== */}
      <Box>
        {/* 이미지가 있으면 표시 */}
        {displayImageUrl ? (
          <Box sx={{ position: 'relative' }}>
            {/* 이미지 */}
            <Box
              component="img"
              key={`${marker.markerId}-${imageUrl}`}  // key를 변경해서 강제로 다시 렌더링
              src={displayImageUrl}
              alt="마커 이미지"
              sx={{
                width: '100%',
                height: 200,
                objectFit: 'cover',         // 이미지가 영역을 가득 채우도록
                border: '3px solid #00ff00',
                boxShadow: '4px 4px 0 #000',
              }}
            />
            {/* 스캔라인 효과 (CRT 모니터 느낌) */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              // repeating-linear-gradient: 반복되는 선형 그라데이션
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
              pointerEvents: 'none',       // 마우스 클릭 통과
            }} />
            {/* 소유자면 이미지 삭제 버튼 표시 */}
            {isOwner && (
              <IconButton
                size="small"
                onClick={handleRemoveImage}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(255, 0, 64, 0.9)',
                  color: 'white',
                  border: '2px solid #fff',
                  '&:hover': { bgcolor: '#ff0040' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
            {/* 업로드 중이면 로딩 스피너 표시 */}
            {uploading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.7)',
                }}
              >
                <CircularProgress sx={{ color: '#00ff00' }} />
              </Box>
            )}
          </Box>
        ) : isOwner ? (
          // 이미지가 없고 소유자면 이미지 추가 버튼 표시
          <Button
            variant="outlined"
            fullWidth
            startIcon={uploading ? <CircularProgress size={18} sx={{ color: '#00ff00' }} /> : <AddPhotoAlternateIcon />}
            onClick={() => fileInputRef.current?.click()}  // 숨겨진 파일 입력창 클릭
            disabled={uploading}
            sx={{
              height: 100,
              borderStyle: 'dashed',       // 점선 테두리
              borderColor: '#00ff00',
              color: '#00ff00',
              fontFamily: '"VT323", "DungGeunMo", monospace',
              fontSize: '1.1rem',
              '&:hover': {
                borderColor: '#00ff00',
                bgcolor: 'rgba(0, 255, 0, 0.1)',
              },
            }}
          >
            {uploading ? 'UPLOADING...' : '+ ADD IMAGE'}
          </Button>
        ) : null}  {/* 비소유자면 아무것도 표시 안 함 */}
        
        {/* 숨겨진 파일 입력창 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"              // 이미지 파일만 선택 가능
          onChange={handleFileSelect}
          style={{ display: 'none' }}   // 숨김
        />
      </Box>

      {/* ===== 텍스트 입력 필드 (소유자) / 텍스트 표시 (비소유자) ===== */}
      {isOwner ? (
        // 소유자: 수정 가능한 TextField
        LINE_FIELDS.map(({ name, label }) => (
          <TextField
            key={`${name}-${marker.markerId}`}  // React가 각 입력창을 구분할 수 있도록
            multiline                            // 여러 줄 입력 가능
            rows={1}                             // 기본 1줄
            fullWidth                            // 전체 너비
            variant="outlined"
            label={label}
            inputRef={refs[name]}                // ref 연결
            defaultValue={marker[name] || ''}    // 기본값 (마커의 기존 값)
            sx={textFieldStyle}
          />
        ))
      ) : (
        // 비소유자: 읽기 전용 텍스트 표시
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {LINE_FIELDS.map(({ name }, index) => (
            // 값이 있을 때만 표시
            marker[name] && (
              <Typography
                key={`${name}-${marker.markerId}`}
                sx={{
                  // 첫 번째 줄은 더 크고 밝게
                  color: index === 0 ? '#fff' : '#ccc',
                  fontFamily: '"VT323", "DungGeunMo", monospace',
                  fontSize: index === 0 ? '1.4rem' : '1.2rem',
                  fontWeight: index === 0 ? 'bold' : 'normal',
                  lineHeight: 1.4,
                  whiteSpace: 'pre-wrap',       // 줄바꿈 유지
                  wordBreak: 'break-word',        // 긴 단어 줄바꿈
                }}
              >
                {marker[name]}
              </Typography>
            )
          ))}
        </Box>
      )}

      {/* ===== 카테고리 선택 ===== */}
      <Box>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#888',
            display: 'block',
            mb: 1,
            fontFamily: '"VT323", "DungGeunMo", monospace',
          }}
        >
          CATEGORY
        </Typography>
        {isOwner ? (
          // 소유자: 카테고리 선택 가능
          <ToggleButtonGroup
            value={category}
            exclusive                                // 하나만 선택 가능
            onChange={handleCategoryChange}
            size="small"
            sx={{ flexWrap: 'nowrap', gap: 0.5, display: 'flex' }}
          >
            {MARKER_CATEGORIES.map((cat) => (
              <Tooltip key={cat.value} title={cat.label}>
                <ToggleButton
                  value={cat.value}
                  sx={{
                    px: 1.4,
                    py: 0.5,
                    fontSize: '1.2rem',
                    minWidth: 'auto',
                    border: '2px solid #333 !important',
                    '&.Mui-selected': {             // 선택된 버튼
                      bgcolor: cat.color,
                      color: 'white',
                      borderColor: `${cat.color} !important`,
                      '&:hover': { bgcolor: cat.color },
                    },
                  }}
                >
                  {cat.icon}  {/* 카테고리 아이콘 */}
                </ToggleButton>
              </Tooltip>
            ))}
          </ToggleButtonGroup>
        ) : (
          // 비소유자: 카테고리 정보만 표시
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '1.5rem' }}>{categoryInfo.icon}</Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: categoryInfo.color, 
                fontFamily: '"VT323", "DungGeunMo", monospace',
              }}
            >
              {categoryInfo.label}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ===== 공개 설정 (소유자만) ===== */}
      {isOwner && (
        <FormControlLabel
          control={
            <Checkbox
              defaultChecked={marker.isPublic}  // 기본값 (마커의 공개 여부)
              onChange={(e) => { 
                // 체크박스 변경 시 isPublicRef 업데이트
                isPublicRef.current = e.target.checked;
              }}
              sx={{ 
                color: '#00ff00',
                '&.Mui-checked': { color: '#00ff00' },
              }}
            />
          }
          label={
            <Typography sx={{ color: '#888', fontFamily: '"VT323", "DungGeunMo", monospace' }}>
              PUBLIC (다른 사용자에게 공개)
            </Typography>
          }
        />
      )}

      {/* ===== 저장/삭제 버튼 (소유자만) ===== */}
      {isOwner && (
        <Stack direction="row" spacing={1}>
          {/* 저장/수정 버튼 */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={uploading}
            sx={{
              bgcolor: '#00ff00',
              color: '#000',
              fontFamily: '"Press Start 2P", "Galmuri11", cursive',
              fontSize: '0.6rem',
              py: 1.5,
              boxShadow: '4px 4px 0 #000',
              '&:hover': {
                bgcolor: '#00cc00',
                boxShadow: '4px 4px 0 #000',
              },
            }}
          >
            {isNewMarker ? 'SAVE' : 'UPDATE'}  {/* 새 마커면 'SAVE', 기존 마커면 'UPDATE' */}
          </Button>
          {/* 삭제 버튼 */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<DeleteIcon />}
            onClick={onDelete}              // 부모 컴포넌트의 삭제 함수 호출
            disabled={uploading}
            sx={{
              bgcolor: '#ff0040',
              color: '#fff',
              fontFamily: '"Press Start 2P", "Galmuri11", cursive',
              fontSize: '0.6rem',
              py: 1.5,
              boxShadow: '4px 4px 0 #000',
              '&:hover': {
                bgcolor: '#cc0033',
                boxShadow: '4px 4px 0 #000',
              },
            }}
          >
            DELETE
          </Button>
        </Stack>
      )}

      {/* ===== 좋아요 & 댓글 섹션 (저장된 마커만 표시) ===== */}
      {/* 새 마커가 아니면 좋아요, 북마크, 댓글 기능 표시 */}
      {!isNewMarker && (
        <>
          <Divider sx={{ borderColor: '#333', my: 1 }} />
          
          {/* 좋아요 & 북마크 & 댓글 버튼 영역 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* 좋아요 버튼 */}
              <LikeButton
                markerId={marker.markerId}
                initialLikeCount={marker.likeCount || 0}
                size="medium"
              />
              {/* 북마크 버튼 */}
              <BookmarkButton
                markerId={marker.markerId}
                size="medium"
              />
            </Box>
            
            {/* 댓글 버튼 */}
            <Button
              size="small"
              startIcon={<ChatBubbleOutlineIcon />}
              endIcon={showComments ? <ExpandLessIcon /> : <ExpandMoreIcon />}  // 접기/펼치기 아이콘
              onClick={() => setShowComments(!showComments)}  // 댓글 목록 토글
              sx={{ 
                color: '#00ffff',
                fontFamily: '"VT323", "DungGeunMo", monospace',
                fontSize: '1rem',
              }}
            >
              COMMENTS {marker.commentCount || 0}  {/* 댓글 개수 표시 */}
            </Button>
          </Box>

          {/* 댓글 목록 (토글) */}
          {/* Collapse: 접기/펼치기 애니메이션 */}
          <Collapse in={showComments}>
            <Box sx={{ 
              maxHeight: 250,              // 최대 높이
              overflow: 'auto',            // 넘치면 스크롤
              mt: 1,
              p: 1,
              border: '2px solid #333',
              bgcolor: 'rgba(0, 0, 0, 0.2)',
            }}>
              <CommentList
                markerId={marker.markerId}
                initialCommentCount={marker.commentCount || 0}
              />
            </Box>
          </Collapse>
        </>
      )}
    </Box>
  );
}

// 이 컴포넌트를 다른 파일에서 사용할 수 있도록 내보내기
export default MarkerDetailPanel;
