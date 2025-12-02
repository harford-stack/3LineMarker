// frontend/src/pages/ChatPage.jsx
// 채팅 페이지 컴포넌트 (WebSocket 버전)
// 사용자 간 1:1 실시간 채팅 기능을 제공하는 페이지입니다.
// Socket.io를 사용하여 실시간 메시지 전송/수신을 구현했습니다.

// ===== 1단계: 필요한 도구들 가져오기 =====

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client'; // Socket.io 클라이언트

import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  Paper,
  Badge,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';

import ChatIcon from '@mui/icons-material/Chat';

import { getChatRooms, getOrCreateChatRoom, getChatMessages, markChatMessagesAsRead, deleteChatRoom, searchUsers } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useRetroDialog } from '../components/ui/RetroDialog';
import { alertSuccess, alertError } from '../styles/commonStyles';

// ===== 2단계: ChatPage 컴포넌트 정의 =====

function ChatPage() {
  // ===== 상태 관리 =====
  
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAuth();
  
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // 레트로 다이얼로그 훅
  const { showConfirm } = useRetroDialog();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  // ===== 훅 사용 =====
  
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null); // Socket.io 연결 참조
  
  // ===== 함수 정의 =====
  
  /**
   * loadChatRooms 함수
   * 
   * 채팅방 목록을 서버에서 가져오는 함수입니다.
   */
  const loadChatRooms = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const roomsData = await getChatRooms(token);
      setRooms(roomsData);
    } catch (error) {
      console.error('채팅방 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  /**
   * loadMessages 함수
   * 
   * 선택한 채팅방의 메시지 목록을 서버에서 가져오는 함수입니다.
   * 초기 메시지 로드 시에만 사용하고, 이후에는 WebSocket으로 실시간 업데이트됩니다.
   */
  const loadMessages = useCallback(async (roomId) => {
    if (!token || !roomId) return;

    try {
      const data = await getChatMessages(token, roomId, 1, 100);
      setMessages(data.messages || []);
      
      // 메시지를 읽음 처리
      await markChatMessagesAsRead(token, roomId);
      
      // 채팅방 목록 새로고침
      loadChatRooms();
      
    } catch (error) {
      console.error('메시지 목록 조회 실패:', error);
    }
  }, [token, loadChatRooms]);

  /**
   * handleRoomSelect 함수
   * 
   * 채팅방을 선택했을 때 실행되는 함수입니다.
   * WebSocket을 통해 채팅방에 입장합니다.
   */
  const handleRoomSelect = useCallback(async (room) => {
    if (!room || !room.roomId) {
      console.error('채팅방 정보가 올바르지 않습니다:', room);
      return;
    }

    console.log('채팅방 선택:', room.roomId);

    setSelectedRoomId(room.roomId);
    setOtherUser(room.otherUser);
    
    // 초기 메시지 로드
    await loadMessages(room.roomId);
    
    // WebSocket이 연결되어 있으면 채팅방 입장
    if (socketRef.current && socketConnected) {
      socketRef.current.emit('join-room', { roomId: room.roomId });
      console.log('채팅방 입장 이벤트 전송:', room.roomId);
    } else {
      console.warn('Socket이 연결되지 않았지만 채팅방은 선택되었습니다.');
    }
    
  }, [loadMessages, socketConnected]);

  /**
   * handleSendMessage 함수
   * 
   * 메시지를 전송하는 함수입니다.
   * WebSocket을 통해 실시간으로 메시지를 전송합니다.
   */
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedRoomId || !socketRef.current || !socketConnected) return;

    const messageText = messageInput.trim();
    
    try {
      setSending(true);
      
      // Optimistic update: 메시지를 즉시 화면에 표시 (서버 응답을 기다리지 않음)
      const tempMessage = {
        messageId: `temp-${Date.now()}`, // 임시 ID
        roomId: selectedRoomId,
        senderId: user?.userId,
        message: messageText,
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      
      // 메시지 목록에 즉시 추가
      setMessages((prevMessages) => [...prevMessages, tempMessage]);
      
      // 입력창 비우기
      setMessageInput('');
      
      // WebSocket을 통해 메시지 전송
      socketRef.current.emit('send-message', {
        roomId: selectedRoomId,
        message: messageText,
      });
      
      // 채팅방 목록 새로고침 (마지막 메시지 업데이트)
      loadChatRooms();
      
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      // 에러 발생 시 임시 메시지 제거
      setMessages((prevMessages) => 
        prevMessages.filter(m => !String(m.messageId).startsWith('temp-'))
      );
    } finally {
      setSending(false);
    }
  };

  /**
   * scrollToBottom 함수
   * 
   * 메시지 목록의 맨 아래로 스크롤하는 함수입니다.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * formatTime 함수
   * 
   * 날짜를 "방금 전", "5분 전" 같은 형식으로 변환합니다.
   */
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

  /**
   * handleSearchUsers 함수
   * 
   * 사용자를 검색하는 함수입니다.
   */
  const handleSearchUsers = async (query) => {
    if (!query.trim() || !token) return;

    try {
      setSearching(true);
      const data = await searchUsers(token, query, 1, 10);
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('사용자 검색 실패:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  /**
   * handleLeaveRoom 함수
   * 
   * 채팅방을 나가는 함수입니다.
   */
  const handleLeaveRoom = async () => {
    if (!selectedRoomId || !token) return;

    // 레트로 다이얼로그로 확인
    const confirmed = await showConfirm(
      '채팅방을 나가시겠습니까?\n채팅방과 모든 메시지가 삭제됩니다.',
      '채팅방 나가기'
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteChatRoom(token, selectedRoomId);
      
      // 채팅방 선택 해제
      setSelectedRoomId(null);
      setOtherUser(null);
      setMessages([]);
      
      // 채팅방 목록 새로고침
      await loadChatRooms();
      
      // 성공 메시지 표시
      setSnackbar({
        open: true,
        message: '✓ 채팅방을 나갔습니다.',
        severity: 'success',
      });
      
      console.log('채팅방 나가기 완료');
    } catch (error) {
      console.error('채팅방 나가기 실패:', error);
      // 에러 메시지 표시
      setSnackbar({
        open: true,
        message: `⚠ 채팅방 나가기에 실패했습니다: ${error.message || '알 수 없는 오류'}`,
        severity: 'error',
      });
    }
  };

  /**
   * handleStartChat 함수
   * 
   * 특정 사용자와 채팅을 시작하는 함수입니다.
   */
  const handleStartChat = async (otherUserId) => {
    if (!token || !otherUserId) {
      console.error('채팅 시작 실패: token 또는 otherUserId가 없습니다.', { token: !!token, otherUserId });
      return;
    }

    try {
      console.log('채팅방 생성 시도:', otherUserId);
      
      // 채팅방 조회 또는 생성
      const data = await getOrCreateChatRoom(token, otherUserId);
      console.log('채팅방 생성 응답:', data);
      
      if (!data || !data.room || !data.otherUser) {
        console.error('채팅방 생성 응답 형식 오류:', data);
        return;
      }
      
      // 채팅방 선택
      await handleRoomSelect({
        roomId: data.room.roomId,
        otherUser: data.otherUser,
      });

      // 사용자 검색 닫기
      setShowUserSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      
      // WebSocket이 연결되어 있으면 채팅방 입장
      if (socketRef.current && socketConnected) {
        socketRef.current.emit('join-room', { roomId: data.room.roomId });
        console.log('새 채팅방 입장 이벤트 전송:', data.room.roomId);
      }

      // 채팅방 목록 새로고침
      await loadChatRooms();
      
      console.log('채팅방 생성 및 선택 완료');
    } catch (error) {
      console.error('채팅 시작 실패:', error);
      // 에러 메시지 표시
      setSnackbar({
        open: true,
        message: `⚠ 채팅방 생성에 실패했습니다: ${error.message || '알 수 없는 오류'}`,
        severity: 'error',
      });
    }
  };

  // ===== useEffect: Socket.io 연결 및 이벤트 처리 =====
  
  /**
   * Socket.io 연결 및 이벤트 리스너 설정
   * 
   * 컴포넌트가 마운트될 때 Socket.io 서버에 연결하고,
   * 인증, 메시지 수신 등의 이벤트를 처리합니다.
   */
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Socket.io 서버에 연결
    // process.env.REACT_APP_API_BASE_URL: 백엔드 서버 주소 (예: http://localhost:3010)
    const socket = io(process.env.REACT_APP_API_BASE_URL || 'http://localhost:3010', {
      transports: ['websocket', 'polling'], // WebSocket과 폴링 모두 지원
      reconnection: true, // 자동 재연결
      reconnectionDelay: 1000, // 재연결 지연 시간 (1초)
      reconnectionAttempts: 5, // 최대 재연결 시도 횟수
    });

    socketRef.current = socket;

    // 연결 성공 이벤트
    socket.on('connect', () => {
      console.log('[Socket.io] 서버에 연결되었습니다:', socket.id);
      setSocketConnected(true);
      
      // 연결되면 즉시 인증
      socket.emit('authenticate', { token });
    });

    // 인증 성공 이벤트
    socket.on('authenticated', (data) => {
      console.log('[Socket.io] 인증 완료:', data);
    });

    // 채팅방 입장 성공 이벤트
    socket.on('joined-room', (data) => {
      console.log('[Socket.io] 채팅방 입장:', data);
    });

    // 새 메시지 수신 이벤트
    socket.on('new-message', (message) => {
      console.log('[Socket.io] 새 메시지 수신:', message);
      
      // 메시지 목록에 추가
      setMessages((prevMessages) => {
        // messageId를 문자열로 변환 (숫자일 수 있음)
        const messageIdStr = String(message.messageId);
        
        // 이미 있는 메시지인지 확인 (중복 방지)
        const exists = prevMessages.some(m => String(m.messageId) === messageIdStr);
        if (exists) {
          // 임시 메시지가 있으면 실제 메시지로 교체
          return prevMessages.map(m => {
            const mIdStr = String(m.messageId);
            return mIdStr === `temp-${messageIdStr}` || 
            (mIdStr.startsWith('temp-') && m.message === message.message && m.senderId === message.senderId)
              ? message 
              : m;
          }).filter(m => {
            const mIdStr = String(m.messageId);
            return !mIdStr.startsWith('temp-') || mIdStr === messageIdStr;
          });
        }
        
        // 임시 메시지가 있으면 교체, 없으면 추가
        const hasTempMessage = prevMessages.some(m => {
          const mIdStr = String(m.messageId);
          return mIdStr.startsWith('temp-') && 
            m.message === message.message && 
            m.senderId === message.senderId;
        });
        
        if (hasTempMessage) {
          // 임시 메시지를 실제 메시지로 교체
          return prevMessages.map(m => {
            const mIdStr = String(m.messageId);
            return mIdStr.startsWith('temp-') && 
              m.message === message.message && 
              m.senderId === message.senderId
                ? message 
                : m;
          });
        }
        
        return [...prevMessages, message];
      });
      
      // 채팅방 목록 새로고침 (읽지 않은 메시지 수 업데이트)
      loadChatRooms();
      
      // 메시지 읽음 처리 (내가 보낸 메시지가 아닌 경우)
      if (message.senderId !== user?.userId && selectedRoomId === message.roomId) {
        socket.emit('mark-messages-read', { roomId: message.roomId });
      }
    });

    // 에러 이벤트
    socket.on('error', (error) => {
      console.error('[Socket.io] 에러:', error);
    });

    // 연결 해제 이벤트
    socket.on('disconnect', () => {
      console.log('[Socket.io] 서버 연결이 끊어졌습니다.');
      setSocketConnected(false);
    });

    // 컴포넌트 언마운트 시 Socket 연결 해제
    return () => {
      console.log('[Socket.io] 연결 해제');
      socket.disconnect();
    };
  }, [token, navigate, user, selectedRoomId, loadChatRooms]);

  /**
   * 페이지가 처음 로드될 때 채팅방 목록을 불러옵니다.
   */
  useEffect(() => {
    loadChatRooms();
  }, [loadChatRooms]);

  /**
   * URL state에서 채팅방 정보를 받아서 자동으로 채팅방을 선택합니다.
   * 프로필 페이지에서 채팅 버튼을 클릭했을 때 사용됩니다.
   */
  useEffect(() => {
    if (location.state?.roomId && location.state?.otherUser) {
      handleRoomSelect({
        roomId: location.state.roomId,
        otherUser: location.state.otherUser,
      });
      // state 초기화 (한 번만 실행되도록)
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, handleRoomSelect, navigate]);

  /**
   * 메시지 목록이 변경될 때마다 맨 아래로 스크롤합니다.
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ===== 화면에 그리기 =====
  
  return (
    <Box sx={{
      display: 'flex',
      height: 'calc(100vh - 140px)',
      background: 'radial-gradient(ellipse at center, #0f3460 0%, #0a0a0f 70%)',
    }}>
      {/* 왼쪽 사이드바: 채팅방 목록 */}
      <Paper sx={{
        width: 350,
        borderRight: '3px solid #ff00ff',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'rgba(26, 26, 46, 0.95)',
        overflow: 'hidden',
      }}>
        {/* 채팅방 목록 헤더 */}
        <Box sx={{
          p: 2,
          borderBottom: '2px solid #ff00ff',
          bgcolor: 'rgba(255, 0, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Typography
            variant="h6"
            sx={{
              color: '#ff00ff',
              fontFamily: '"Press Start 2P", "Galmuri11", cursive',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <ChatIcon /> CHAT ROOMS
          </Typography>
          {/* Socket 연결 상태 표시 */}
          <Box sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: socketConnected ? '#00ff00' : '#ff0040',
            boxShadow: socketConnected ? '0 0 10px #00ff00' : 'none',
          }} />
        </Box>

        {/* 사용자 검색 버튼 */}
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 0, 255, 0.2)' }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setShowUserSearch(!showUserSearch)}
            sx={{
              borderColor: '#00ffff',
              color: '#00ffff',
              fontFamily: '"VT323", "DungGeunMo", monospace',
              fontSize: '0.9rem',
              '&:hover': {
                borderColor: '#00ff00',
                bgcolor: 'rgba(0, 255, 0, 0.1)',
              },
            }}
          >
            {showUserSearch ? '검색 닫기' : '+ 새 채팅 시작'}
          </Button>
        </Box>

        {/* 사용자 검색 영역 */}
        {showUserSearch && (
          <Box sx={{ p: 2, borderBottom: '2px solid rgba(255, 0, 255, 0.2)', bgcolor: 'rgba(0, 0, 0, 0.3)' }}>
            <TextField
              fullWidth
              placeholder="사용자 ID 또는 닉네임 검색..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  handleSearchUsers(e.target.value);
                } else {
                  setSearchResults([]);
                }
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                  '& input': {
                    color: '#00ffff',
                    fontFamily: '"VT323", "DungGeunMo", monospace',
                    fontSize: '0.9rem',
                  },
                  '& fieldset': {
                    borderColor: '#00ffff',
                  },
                },
              }}
            />
            {searching && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} sx={{ color: '#00ffff' }} />
              </Box>
            )}
            {!searching && searchResults.length > 0 && (
              <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                {searchResults.map((searchUser) => (
                  <ListItem
                    key={searchUser.userId}
                    disablePadding
                    sx={{
                      borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                    }}
                  >
                    <ListItemButton
                      onClick={() => handleStartChat(searchUser.userId)}
                      sx={{
                        '&:hover': {
                          bgcolor: 'rgba(0, 255, 255, 0.1)',
                        },
                      }}
                    >
                    <ListItemAvatar>
                      <Avatar
                        src={searchUser.profileImageUrl || ''}
                        sx={{ bgcolor: '#00ffff' }}
                      >
                        {searchUser.username?.[0] || '?'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            color: '#00ffff',
                            fontFamily: '"VT323", "DungGeunMo", monospace',
                            fontSize: '0.9rem',
                          }}
                        >
                          {searchUser.username || searchUser.userId}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          sx={{
                            color: '#fff',
                            fontFamily: '"VT323", "DungGeunMo", monospace',
                            fontSize: '0.7rem',
                          }}
                        >
                          {searchUser.userId}
                        </Typography>
                      }
                    />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
            {!searching && searchQuery.trim() && searchResults.length === 0 && (
              <Typography
                sx={{
                  color: '#fff',
                  fontFamily: '"VT323", "DungGeunMo", monospace',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                검색 결과가 없습니다.
              </Typography>
            )}
          </Box>
        )}

        {/* 채팅방 목록 */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress sx={{ color: '#ff00ff' }} />
            </Box>
          ) : rooms.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography sx={{ color: '#fff', fontFamily: '"VT323", "DungGeunMo", monospace' }}>
                채팅방이 없습니다.
              </Typography>
            </Box>
          ) : (
            <List>
              {rooms.map((room) => (
                <ListItem
                  key={room.roomId}
                  disablePadding
                  sx={{
                    borderBottom: '1px solid rgba(255, 0, 255, 0.2)',
                  }}
                >
                  <ListItemButton
                    onClick={() => handleRoomSelect(room)}
                    selected={selectedRoomId === room.roomId}
                    sx={{
                      '&:hover': {
                        bgcolor: 'rgba(255, 0, 255, 0.1)',
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(255, 0, 255, 0.2)',
                        borderLeft: '4px solid #ff00ff',
                      },
                    }}
                  >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={room.unreadCount > 0 ? room.unreadCount : 0}
                      color="error"
                      overlap="circular"
                    >
                      <Avatar
                        src={room.otherUser.profileImageUrl || ''}
                        sx={{
                          bgcolor: '#00ffff',
                          border: '2px solid #ff00ff',
                        }}
                      >
                        {room.otherUser.username?.[0] || '?'}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          color: '#ff00ff',
                          fontFamily: '"VT323", "DungGeunMo", monospace',
                          fontSize: '1.1rem',
                        }}
                      >
                        {room.otherUser.username || '알 수 없음'}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        sx={{
                          color: '#aaa',
                          fontFamily: '"VT323", "DungGeunMo", monospace',
                          fontSize: '0.9rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {room.lastMessage || '메시지가 없습니다.'}
                      </Typography>
                    }
                  />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Paper>

      {/* 오른쪽 메인 영역: 메시지 표시 */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', // 중앙 정렬
      }}>
        {/* 메시지 영역 컨테이너 (너비 제한) */}
        <Box sx={{
          width: '100%',
          maxWidth: 800, // 최대 너비 800px
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}>
          {selectedRoomId ? (
            <>
              {/* 메시지 영역 헤더 */}
              <Box sx={{
                p: 2,
                borderBottom: '2px solid #ff00ff',
                bgcolor: 'rgba(255, 0, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ff00ff',
                    fontFamily: '"VT323", "DungGeunMo", monospace',
                    fontSize: '1.2rem',
                  }}
                >
                  {otherUser?.username || '알 수 없음'}
                </Typography>
                <Button
                  onClick={handleLeaveRoom}
                  variant="outlined"
                  sx={{
                    borderColor: '#ff0040',
                    color: '#ff0040',
                    borderRadius: 0,
                    fontFamily: '"VT323", "DungGeunMo", monospace',
                    fontSize: '0.8rem',
                    px: 1.5,
                    py: 0.5,
                    minWidth: 'auto',
                    '&:hover': {
                      borderColor: '#ff0040',
                      bgcolor: 'rgba(255, 0, 64, 0.1)',
                      boxShadow: '0 0 10px #ff0040',
                    },
                  }}
                >
                  나가기
                </Button>
              </Box>

              {/* 메시지 목록 */}
              <Box sx={{
                flex: 1,
                overflow: 'auto',
                p: 2,
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
              }}>
              {messages.map((message) => {
                // senderId와 userId를 문자열로 변환하여 비교 (타입 불일치 방지)
                // user 객체는 userId 필드를 사용합니다 (user_id가 아님)
                const isMyMessage = String(message.senderId) === String(user?.userId);

                return (
                  <Box
                    key={message.messageId}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      mb: 2,
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* 상대방 메시지일 때 왼쪽 여백 없음 (왼쪽 정렬) */}
                    {/* 내 메시지일 때 왼쪽 여백 추가 (오른쪽 정렬) */}
                    {isMyMessage && <Box sx={{ flex: 1, minWidth: 0 }} />}
                    
                    <Paper
                      sx={{
                        p: 1.5,
                        maxWidth: '60%',
                        minWidth: '120px',
                        bgcolor: isMyMessage ? 'rgba(255, 0, 255, 0.3)' : 'rgba(0, 255, 255, 0.3)',
                        border: `2px solid ${isMyMessage ? '#ff00ff' : '#00ffff'}`,
                        borderRadius: 0,
                        boxShadow: isMyMessage 
                          ? '4px 4px 0 rgba(255, 0, 255, 0.5)' 
                          : '4px 4px 0 rgba(0, 255, 255, 0.5)',
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#fff',
                          fontFamily: '"VT323", "DungGeunMo", monospace',
                          fontSize: '1rem',
                          wordBreak: 'break-word',
                        }}
                      >
                        {message.message}
                      </Typography>
                      <Typography
                        sx={{
                          color: '#aaa',
                          fontFamily: '"VT323", "DungGeunMo", monospace',
                          fontSize: '0.7rem',
                          mt: 0.5,
                          textAlign: isMyMessage ? 'right' : 'left',
                        }}
                      >
                        {formatTime(message.createdAt)}
                      </Typography>
                    </Paper>
                    
                    {/* 상대방 메시지일 때 오른쪽 여백 추가 (왼쪽 정렬) */}
                    {/* 내 메시지일 때 오른쪽 여백 없음 (오른쪽 정렬) */}
                    {!isMyMessage && <Box sx={{ flex: 1, minWidth: 0 }} />}
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>

            {/* 메시지 입력 영역 */}
            <Box sx={{
              p: 2,
              borderTop: '2px solid #ff00ff',
              bgcolor: 'rgba(26, 26, 46, 0.95)',
              display: 'flex',
              gap: 1,
            }}>
              <TextField
                fullWidth
                placeholder="메시지를 입력하세요..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sending || !socketConnected}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    '& input': {
                      color: '#ff00ff',
                      fontFamily: '"VT323", "DungGeunMo", monospace',
                      fontSize: '1.1rem',
                    },
                    '& fieldset': {
                      borderColor: '#ff00ff',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00ffff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00ff00',
                      boxShadow: '0 0 15px #00ff00',
                    },
                  },
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={sending || !messageInput.trim() || !socketConnected}
                variant="contained"
                sx={{
                  bgcolor: '#ff00ff',
                  color: '#000',
                  borderRadius: 0, // 레트로 스타일: 각진 모서리
                  border: '3px solid #000',
                  boxShadow: '4px 4px 0 #000',
                  fontFamily: '"Press Start 2P", "Galmuri11", cursive',
                  fontSize: '0.6rem',
                  px: 2,
                  py: 1.5,
                  minWidth: 'auto',
                  '&:hover': {
                    bgcolor: '#cc00cc',
                    transform: 'translate(2px, 2px)',
                    boxShadow: '2px 2px 0 #000',
                  },
                  '&:active': {
                    transform: 'translate(4px, 4px)',
                    boxShadow: 'none',
                  },
                  '&:disabled': {
                    bgcolor: '#440044',
                    color: '#660066',
                    borderColor: '#333',
                    boxShadow: 'none',
                  },
                }}
              >
                {sending ? (
                  <CircularProgress size={20} sx={{ color: '#000' }} />
                ) : (
                  'SEND'
                )}
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Typography
              sx={{
                color: '#fff',
                fontFamily: '"VT323", "DungGeunMo", monospace',
                fontSize: '1.5rem',
              }}
            >
              채팅방을 선택하세요
            </Typography>
          </Box>
          )}
        </Box>
      </Box>

      {/* ===== 스낵바 알림 (화면 중앙) ===== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          top: '50% !important',
          transform: 'translateY(-50%)',
        }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            ...(snackbar.severity === 'success' ? alertSuccess : alertError),
            px: 4,
            py: 2,
            minWidth: '400px',
            maxWidth: '600px',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ChatPage;
