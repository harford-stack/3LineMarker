// frontend/src/components/users/FollowListModal.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';

import FollowButton from '../FollowButton';
import { getFollowers, getFollowing } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function FollowListModal({ open, onClose, userId, type = 'followers' }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // page의 최신 값을 참조하기 위한 ref
  const pageRef = useRef(page);
  
  // page가 변경될 때마다 ref 업데이트
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const title = type === 'followers' ? '팔로워' : '팔로잉';

  // 사용자 목록 로드 함수 (useCallback으로 메모이제이션)
  // 주의: loading과 page는 의존성 배열에서 제외
  // - loading: 함수 내부에서 체크만 하므로 포함 불필요 (무한 루프 방지)
  // - page: 항상 명시적으로 pageNum을 전달하므로 포함 불필요
  const loadUsers = useCallback(async (pageNum, reset = false) => {
    // loading 상태는 함수 내부에서 체크하되, 의존성 배열에는 포함하지 않음
    // (loading이 변경될 때마다 함수가 재생성되는 것을 방지)
    setLoading(true);
    try {
      const fetchFn = type === 'followers' ? getFollowers : getFollowing;
      const data = await fetchFn(token, userId, pageNum);
      
      const userList = type === 'followers' ? data.followers : data.following;
      
      if (reset) {
        setUsers(userList);
      } else {
        setUsers((prev) => [...prev, ...userList]);
      }
      
      setTotalCount(data.totalCount);
      setPage(pageNum);
      setHasMore(userList.length >= data.limit);
    } catch (error) {
      console.error('목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [token, userId, type]);

  useEffect(() => {
    if (open) {
      setUsers([]);
      setPage(1);
      setHasMore(true);
      loadUsers(1, true);
    }
  }, [open, userId, type, loadUsers]);

  const handleUserClick = (clickedUserId) => {
    onClose();
    navigate(`/users/${clickedUserId}`);
  };

  // 더보기 버튼 핸들러
  // pageRef를 사용해서 최신 page 값을 참조 (의존성 배열에서 page 제외)
  const handleLoadMore = () => {
    loadUsers(pageRef.current + 1);
  };

  const getProfileImageUrl = (url) => {
    if (!url || url.includes('default_profile')) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight="bold">
          {title} ({totalCount})
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, maxHeight: 400 }}>
        {users.length === 0 && !loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {type === 'followers' ? '팔로워가 없습니다.' : '팔로잉하는 사용자가 없습니다.'}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {users.map((user) => (
              <ListItem
                key={user.userId}
                sx={{
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                secondaryAction={
                  <FollowButton
                    userId={user.userId}
                    initialIsFollowing={user.isFollowing}
                    size="small"
                  />
                }
              >
                <ListItemAvatar>
                  <Avatar
                    src={getProfileImageUrl(user.profileImageUrl)}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleUserClick(user.userId)}
                  >
                    {user.username?.[0]?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      fontWeight="500"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleUserClick(user.userId)}
                    >
                      {user.username}
                    </Typography>
                  }
                  secondary={`@${user.userId}`}
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* 더보기 버튼 */}
        {hasMore && users.length < totalCount && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button onClick={handleLoadMore} disabled={loading}>
              {loading ? <CircularProgress size={20} /> : '더보기'}
            </Button>
          </Box>
        )}

        {/* 로딩 표시 */}
        {loading && users.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default FollowListModal;

