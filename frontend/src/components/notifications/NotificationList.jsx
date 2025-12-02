// frontend/src/components/notifications/NotificationList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

import NotificationsIcon from '@mui/icons-material/Notifications';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';

import { 
  getNotifications, 
  getUnreadNotificationCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification 
} from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 시간 포맷팅 함수
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now - date) / 1000;

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  
  return date.toLocaleDateString('ko-KR');
};

// 알림 아이콘 매핑
const getNotificationIcon = (type) => {
  switch (type) {
    case 'LIKE':
      return <FavoriteIcon sx={{ color: 'error.main', fontSize: 20 }} />;
    case 'COMMENT':
      return <ChatBubbleIcon sx={{ color: 'primary.main', fontSize: 20 }} />;
    case 'FOLLOW':
      return <PersonAddIcon sx={{ color: 'success.main', fontSize: 20 }} />;
    case 'CHAT':
      return <ChatBubbleIcon sx={{ color: '#ff00ff', fontSize: 20 }} />;
    default:
      return <NotificationsIcon sx={{ fontSize: 20 }} />;
  }
};

// 알림 메시지 생성
const getNotificationMessage = (notification) => {
  switch (notification.type) {
    case 'LIKE':
      return `님이 회원님의 마커를 좋아합니다.`;
    case 'COMMENT':
      return `님이 회원님의 마커에 댓글을 남겼습니다.`;
    case 'FOLLOW':
      return `님이 회원님을 팔로우했습니다.`;
    case 'CHAT':
      return `님이 회원님에게 채팅을 보냈습니다.`;
    default:
      return '';
  }
};

function NotificationList() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  // 읽지 않은 알림 수 조회 함수 (useCallback으로 메모이제이션)
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await getUnreadNotificationCount(token);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('알림 수 조회 실패:', error);
    }
  }, [token]);

  // 읽지 않은 알림 수 주기적 업데이트
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // 30초마다
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications(token, 1, 20);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('알림 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    // 읽음 처리
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(token, notification.notificationId);
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === notification.notificationId
              ? { ...n, isRead: true }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
      }
    }

    handleClose();

    // 해당 페이지로 이동
    if (notification.type === 'CHAT') {
      // 채팅 알림인 경우 채팅 페이지로 이동
      navigate('/chat');
    } else if (notification.type === 'FOLLOW') {
      navigate(`/users/${notification.actorId}`);
    } else if (notification.markerId) {
      // 지도 페이지로 이동 (해당 마커로 포커스)
      navigate('/map', { state: { focusMarkerId: notification.markerId } });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error);
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await deleteNotification(token, notificationId);
      setNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId));
    } catch (error) {
      console.error('알림 삭제 실패:', error);
    }
  };

  const getProfileImageUrl = (url) => {
    if (!url || url.includes('default_profile')) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 360, maxHeight: 480, borderRadius: 2 }
        }}
      >
        {/* 헤더 */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">
            알림
          </Typography>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
            >
              모두 읽음
            </Button>
          )}
        </Box>
        
        <Divider />

        {/* 알림 목록 */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#fff' }}>
              알림이 없습니다.
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ maxHeight: 380, overflow: 'auto' }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.notificationId}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' },
                }}
                secondaryAction={
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleDelete(e, notification.notificationId)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={getNotificationIcon(notification.type)}
                  >
                    <Avatar src={getProfileImageUrl(notification.actorProfileImageUrl)}>
                      {notification.actorUsername?.[0]?.toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" component="span">
                      <strong>{notification.actorUsername}</strong>
                      {getNotificationMessage(notification)}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ color: '#fff' }}>
                      {formatTime(notification.createdAt)}
                      {notification.markerLine1 && ` · "${notification.markerLine1}"`}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}

export default NotificationList;

