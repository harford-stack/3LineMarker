// frontend/src/components/markers/MarkerDetailPanel.jsx
import React, { useRef, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';

// 아이콘
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';

// 좋아요, 댓글, 북마크 컴포넌트
import LikeButton from '../LikeButton';
import BookmarkButton from '../BookmarkButton';
import CommentList from '../comments/CommentList';

// 카테고리 설정
import { MARKER_CATEGORIES, getCategoryInfo } from '../../utils/categories';

// API 베이스 URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 공통 TextField 스타일 (레트로)
const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    bgcolor: 'rgba(0, 0, 0, 0.3)',
    '& fieldset': { borderColor: '#00ff00' },
    '&:hover fieldset': { borderColor: '#00ffff' },
    '&.Mui-focused fieldset': { borderColor: '#ff00ff', boxShadow: '0 0 10px #ff00ff' },
    '& input, & textarea': {
      color: '#e0e0e0',
      fontFamily: '"VT323", "DungGeunMo", monospace',
      fontSize: '1.1rem',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#888',
    fontFamily: '"VT323", "DungGeunMo", monospace',
    '&.Mui-focused': { color: '#ff00ff' },
  },
};

// 텍스트필드 설정
const LINE_FIELDS = [
  { name: 'line1', label: 'LINE 1 (필수)', required: true },
  { name: 'line2', label: 'LINE 2' },
  { name: 'line3', label: 'LINE 3' },
];

function MarkerDetailPanel({ marker, isOwner, onSave, onDelete, onImageUpload }) {
  const refs = {
    line1: useRef(null),
    line2: useRef(null),
    line3: useRef(null),
  };
  const isPublicRef = useRef(marker.isPublic);
  const fileInputRef = useRef(null);
  
  const [imageUrl, setImageUrl] = useState(marker.imageUrl);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [category, setCategory] = useState(marker.category || 'GENERAL');

  const isNewMarker = String(marker.markerId).startsWith('temp-');
  const categoryInfo = getCategoryInfo(marker.category);

  // marker prop이 변경될 때 상태 업데이트
  useEffect(() => {
    setImageUrl(marker.imageUrl);
    setCategory(marker.category || 'GENERAL');
    setPreviewUrl(null); // 다른 마커로 변경 시 preview 초기화
    isPublicRef.current = marker.isPublic;
  }, [marker.markerId, marker.imageUrl, marker.category, marker.isPublic]);

  // 이미지 전체 URL 생성
  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  // 파일 선택 핸들러
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const uploadedUrl = await onImageUpload(file);
      setImageUrl(uploadedUrl);
      setPreviewUrl(null);
    } catch (err) {
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  // 이미지 삭제 핸들러
  const handleRemoveImage = () => {
    setImageUrl(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    onSave({
      line1: refs.line1.current?.value || '',
      line2: refs.line2.current?.value || '',
      line3: refs.line3.current?.value || '',
      isPublic: isPublicRef.current,
      imageUrl,
      category,
    });
  };

  const handleCategoryChange = (event, newCategory) => {
    if (newCategory !== null) {
      setCategory(newCategory);
    }
  };

  const displayImageUrl = previewUrl || getFullImageUrl(imageUrl);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 작성자 정보 */}
      {!isNewMarker && marker.username && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          pb: 2,
          borderBottom: '1px dashed #333',
        }}>
          <PersonIcon sx={{ color: '#00ffff', fontSize: 18 }} />
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#00ffff',
              fontFamily: '"VT323", "DungGeunMo", monospace',
            }}
          >
            @{marker.username}
          </Typography>
          {isOwner && (
            <Chip 
              label="YOU" 
              size="small" 
              sx={{ 
                ml: 'auto',
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

      {/* 이미지 영역 */}
      <Box>
        {displayImageUrl ? (
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              key={`${marker.markerId}-${imageUrl}`}
              src={displayImageUrl}
              alt="마커 이미지"
              sx={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
                border: '3px solid #00ff00',
                boxShadow: '4px 4px 0 #000',
              }}
            />
            {/* 스캔라인 효과 */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
              pointerEvents: 'none',
            }} />
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
          <Button
            variant="outlined"
            fullWidth
            startIcon={uploading ? <CircularProgress size={18} sx={{ color: '#00ff00' }} /> : <AddPhotoAlternateIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            sx={{
              height: 100,
              borderStyle: 'dashed',
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
        ) : null}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </Box>

      {/* 텍스트 입력 필드 (소유자) / 텍스트 표시 (비소유자) */}
      {isOwner ? (
        // 소유자: 수정 가능한 TextField
        LINE_FIELDS.map(({ name, label }) => (
          <TextField
            key={`${name}-${marker.markerId}`}
            multiline
            rows={1}
            fullWidth
            variant="outlined"
            label={label}
            inputRef={refs[name]}
            defaultValue={marker[name] || ''}
            sx={textFieldStyle}
          />
        ))
      ) : (
        // 비소유자: 테두리 없는 텍스트 표시
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {LINE_FIELDS.map(({ name }, index) => (
            marker[name] && (
              <Typography
                key={`${name}-${marker.markerId}`}
                sx={{
                  color: index === 0 ? '#fff' : '#ccc',
                  fontFamily: '"VT323", "DungGeunMo", monospace',
                  fontSize: index === 0 ? '1.4rem' : '1.2rem',
                  fontWeight: index === 0 ? 'bold' : 'normal',
                  lineHeight: 1.4,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {marker[name]}
              </Typography>
            )
          ))}
        </Box>
      )}

      {/* 카테고리 선택 */}
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
          <ToggleButtonGroup
            value={category}
            exclusive
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
                    '&.Mui-selected': {
                      bgcolor: cat.color,
                      color: 'white',
                      borderColor: `${cat.color} !important`,
                      '&:hover': { bgcolor: cat.color },
                    },
                  }}
                >
                  {cat.icon}
                </ToggleButton>
              </Tooltip>
            ))}
          </ToggleButtonGroup>
        ) : (
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

      {/* 공개 설정 (소유자만) */}
      {isOwner && (
        <FormControlLabel
          control={
            <Checkbox
              defaultChecked={marker.isPublic}
              onChange={(e) => { isPublicRef.current = e.target.checked; }}
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

      {/* 저장/삭제 버튼 */}
      {isOwner && (
        <Stack direction="row" spacing={1}>
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
            {isNewMarker ? 'SAVE' : 'UPDATE'}
          </Button>
          <Button
            variant="contained"
            fullWidth
            startIcon={<DeleteIcon />}
            onClick={onDelete}
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

      {/* 좋아요 & 댓글 섹션 (저장된 마커만 표시) */}
      {!isNewMarker && (
        <>
          <Divider sx={{ borderColor: '#333', my: 1 }} />
          
          {/* 좋아요 & 북마크 & 댓글 버튼 영역 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LikeButton
                markerId={marker.markerId}
                initialLikeCount={marker.likeCount || 0}
                size="medium"
              />
              <BookmarkButton
                markerId={marker.markerId}
                size="medium"
              />
            </Box>
            
            <Button
              size="small"
              startIcon={<ChatBubbleOutlineIcon />}
              endIcon={showComments ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setShowComments(!showComments)}
              sx={{ 
                color: '#00ffff',
                fontFamily: '"VT323", "DungGeunMo", monospace',
                fontSize: '1rem',
              }}
            >
              COMMENTS {marker.commentCount || 0}
            </Button>
          </Box>

          {/* 댓글 목록 (토글) */}
          <Collapse in={showComments}>
            <Box sx={{ 
              maxHeight: 250, 
              overflow: 'auto',
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

export default MarkerDetailPanel;

