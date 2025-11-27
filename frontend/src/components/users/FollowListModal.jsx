// frontend/src/components/users/FollowListModal.jsx
import React, { useState, useEffect } from 'react';
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

  const title = type === 'followers' ? '팔로워' : '팔로잉';

  useEffect(() => {
    if (open) {
      setUsers([]);
      setPage(1);
      setHasMore(true);
      loadUsers(1, true);
    }
  }, [open, userId, type]);

  const loadUsers = async (pageNum = page, reset = false) => {
    if (loading) return;

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
  };

  const handleUserClick = (clickedUserId) => {
    onClose();
    navigate(`/users/${clickedUserId}`);
  };

  const handleLoadMore = () => {
    loadUsers(page + 1);
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

