// frontend/src/components/ui/MapSearchInput.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Chip from '@mui/material/Chip';

import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PlaceIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';

import { searchAll } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 디바운스 훅
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

function MapSearchInput({ onMarkerSelect, onUserSelect }) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ markers: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  // 검색 실행 함수 (useCallback으로 메모이제이션)
  const performSearch = useCallback(async (searchQuery) => {
    setLoading(true);
    try {
      const data = await searchAll(token, searchQuery);
      setResults(data);
      setIsOpen(true);
    } catch (error) {
      console.error('검색 실패:', error);
      setResults({ markers: [], users: [] });
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 검색 실행
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setResults({ markers: [], users: [] });
      setIsOpen(false);
    }
  }, [debouncedQuery, performSearch]);

  const handleClear = () => {
    setQuery('');
    setResults({ markers: [], users: [] });
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleMarkerClick = (marker) => {
    if (onMarkerSelect) {
      onMarkerSelect(marker);
    }
    setIsOpen(false);
  };

  const handleUserClick = (user) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
    setIsOpen(false);
  };

  const handleClickAway = () => {
    setIsOpen(false);
  };

  const hasResults = results.markers.length > 0 || results.users.length > 0;

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
        <TextField
          ref={inputRef}
          fullWidth
          placeholder="마커 내용 또는 사용자 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => hasResults && setIsOpen(true)}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
              borderRadius: 2,
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <SearchIcon color="action" />
                )}
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* 검색 결과 드롭다운 */}
        {isOpen && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 1,
              maxHeight: 400,
              overflow: 'auto',
              zIndex: 1000,
              borderRadius: 2,
            }}
          >
            {!hasResults && !loading && query.trim().length >= 2 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  검색 결과가 없습니다.
                </Typography>
              </Box>
            )}

            {/* 마커 검색 결과 */}
            {results.markers.length > 0 && (
              <>
                <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    마커 ({results.markers.length})
                  </Typography>
                </Box>
                <List dense disablePadding>
                  {results.markers.map((marker) => (
                    <ListItem
                      key={marker.markerId}
                      button
                      onClick={() => handleMarkerClick(marker)}
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <ListItemAvatar>
                        {marker.imageUrl ? (
                          <Avatar
                            variant="rounded"
                            src={marker.imageUrl.startsWith('http') ? marker.imageUrl : `${API_BASE_URL}${marker.imageUrl}`}
                          />
                        ) : (
                          <Avatar variant="rounded" sx={{ bgcolor: 'primary.main' }}>
                            <PlaceIcon />
                          </Avatar>
                        )}
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                            {marker.line1}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              @{marker.username}
                            </Typography>
                            <Chip
                              label={`❤️ ${marker.likeCount}`}
                              size="small"
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {results.markers.length > 0 && results.users.length > 0 && <Divider />}

            {/* 사용자 검색 결과 */}
            {results.users.length > 0 && (
              <>
                <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    사용자 ({results.users.length})
                  </Typography>
                </Box>
                <List dense disablePadding>
                  {results.users.map((user) => (
                    <ListItem
                      key={user.userId}
                      button
                      onClick={() => handleUserClick(user)}
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={user.profileImageUrl && !user.profileImageUrl.includes('default')
                            ? (user.profileImageUrl.startsWith('http') ? user.profileImageUrl : `${API_BASE_URL}${user.profileImageUrl}`)
                            : null
                          }
                        >
                          {user.username?.[0]?.toUpperCase() || <PersonIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.username}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              @{user.userId}
                            </Typography>
                            <Chip
                              label={`📍 ${user.markerCount}`}
                              size="small"
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
}

export default MapSearchInput;

