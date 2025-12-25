import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, getUserId, getRandomColor } from '../supabaseClient';

export const useCollaboration = (roomId, params) => {
  const [isActive, setIsActive] = useState(false);
  const [users, setUsers] = useState([]);
  const [sharedParams, setSharedParams] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const userId = useRef(getUserId());
  const userColor = useRef(getRandomColor());
  const updateTimeoutRef = useRef(null);

  // Heartbeat to keep user presence alive
  useEffect(() => {
    if (!isActive) return;

    const heartbeat = setInterval(async () => {
      await supabase
        .from('room_users')
        .update({ last_active: new Date().toISOString() })
        .eq('room_id', roomId)
        .eq('user_id', userId.current);
    }, 10000); // Every 10 seconds

    return () => clearInterval(heartbeat);
  }, [isActive, roomId]);

  // Clean up stale users (inactive > 30 seconds)
  useEffect(() => {
    if (!isActive) return;

    const cleanup = setInterval(async () => {
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
      await supabase
        .from('room_users')
        .delete()
        .lt('last_active', thirtySecondsAgo);
    }, 15000); // Every 15 seconds

    return () => clearInterval(cleanup);
  }, [isActive]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!isActive) return;

    // Subscribe to room parameters
    const paramsChannel = supabase
      .channel(`room:${roomId}:params`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaboration_rooms',
          filter: `id=eq.${roomId}`
        },
        (payload) => {
          if (payload.new && payload.new.params) {
            setSharedParams(payload.new.params);
          }
        }
      )
      .subscribe();

    // Subscribe to room users
    const usersChannel = supabase
      .channel(`room:${roomId}:users`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_users',
          filter: `room_id=eq.${roomId}`
        },
        async () => {
          // Fetch updated user list
          const { data } = await supabase
            .from('room_users')
            .select('*')
            .eq('room_id', roomId)
            .order('last_active', { ascending: false });
          
          if (data) {
            setUsers(data.map(u => ({
              id: u.user_id,
              name: u.user_name,
              color: u.user_color,
              lastActive: u.last_active
            })));
          }
        }
      )
      .subscribe();

    return () => {
      paramsChannel.unsubscribe();
      usersChannel.unsubscribe();
    };
  }, [isActive, roomId]);

  // Start collaboration
  const startCollaboration = useCallback(async () => {
    try {
      // Create or get room
      const { data: existingRoom } = await supabase
        .from('collaboration_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (!existingRoom) {
        // Create new room
        await supabase
          .from('collaboration_rooms')
          .insert({
            id: roomId,
            params: params
          });
      }

      // Add user to room
      const userName = `Researcher ${userId.current.slice(-4)}`;
      
      await supabase
        .from('room_users')
        .upsert({
          room_id: roomId,
          user_id: userId.current,
          user_name: userName,
          user_color: userColor.current,
          last_active: new Date().toISOString()
        }, {
          onConflict: 'room_id,user_id'
        });

      setIsActive(true);
      setIsConnected(true);

      // Fetch initial users
      const { data: roomUsers } = await supabase
        .from('room_users')
        .select('*')
        .eq('room_id', roomId);

      if (roomUsers) {
        setUsers(roomUsers.map(u => ({
          id: u.user_id,
          name: u.user_name,
          color: u.user_color,
          lastActive: u.last_active
        })));
      }

      // Fetch initial params
      const { data: room } = await supabase
        .from('collaboration_rooms')
        .select('params')
        .eq('id', roomId)
        .single();

      if (room) {
        setSharedParams(room.params);
      }

    } catch (error) {
      console.error('Error starting collaboration:', error);
      alert('Failed to start collaboration. Please try again.');
    }
  }, [roomId, params]);

  // Stop collaboration
  const stopCollaboration = useCallback(async () => {
    try {
      // Remove user from room
      await supabase
        .from('room_users')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId.current);

      setIsActive(false);
      setIsConnected(false);
      setUsers([]);
      setSharedParams(null);

    } catch (error) {
      console.error('Error stopping collaboration:', error);
    }
  }, [roomId]);

  // Update shared params (debounced)
  const updateSharedParams = useCallback((newParams) => {
    if (!isActive) return;

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Debounce updates to avoid too many database writes
    updateTimeoutRef.current = setTimeout(async () => {
      try {
        await supabase
          .from('collaboration_rooms')
          .update({ params: newParams })
          .eq('id', roomId);
      } catch (error) {
        console.error('Error updating params:', error);
      }
    }, 500); // 500ms debounce
  }, [isActive, roomId]);

  // Cleanup on unmount
// Cleanup on unmount
// Cleanup on unmount
useEffect(() => {
  // Capture ref value at effect setup time (not in cleanup)
  const currentUserId = userId.current;
  
  return () => {
    if (isActive) {
      supabase
        .from('room_users')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', currentUserId)
        .then(() => {});
    }
  };
}, [isActive, roomId]);

  return {
    isActive,
    isConnected,
    users,
    sharedParams,
    startCollaboration,
    stopCollaboration,
    updateSharedParams
  };
};