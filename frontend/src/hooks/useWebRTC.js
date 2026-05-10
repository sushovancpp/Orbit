import { useEffect, useRef, useState, useCallback } from 'react';
import { getSocket } from '../services/socket';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }],
};

export default function useWebRTC(targetUserId) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callState, setCallState] = useState('idle'); // idle | calling | ringing | connected | ended
  const [callType, setCallType] = useState('video'); // video | audio

  const peerRef = useRef(null);
  const socket = getSocket();

  const cleanup = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;
    localStream?.getTracks().forEach(t => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setCallState('idle');
  }, [localStream]);

  const createPeer = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) socket?.emit('call:ice-candidate', { to: targetUserId, candidate });
    };
    pc.ontrack = (e) => setRemoteStream(e.streams[0]);
    pc.onconnectionstatechange = () => {
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) cleanup();
    };
    return pc;
  }, [targetUserId, socket, cleanup]);

  const startCall = useCallback(async (type = 'video') => {
    setCallType(type);
    setCallState('calling');
    const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
    setLocalStream(stream);
    const pc = createPeer();
    peerRef.current = pc;
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket?.emit('call:offer', { to: targetUserId, offer, type });
  }, [createPeer, socket, targetUserId]);

  const answerCall = useCallback(async (offer, type = 'video') => {
    setCallType(type);
    setCallState('connected');
    const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
    setLocalStream(stream);
    const pc = createPeer();
    peerRef.current = pc;
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket?.emit('call:answer', { to: targetUserId, answer });
  }, [createPeer, socket, targetUserId]);

  const endCall = useCallback(() => {
    socket?.emit('call:end', { to: targetUserId });
    cleanup();
  }, [socket, targetUserId, cleanup]);

  const toggleMute = useCallback(() => {
    localStream?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
  }, [localStream]);

  const toggleCamera = useCallback(() => {
    localStream?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
  }, [localStream]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('call:offer', async ({ from, offer, type }) => {
      setCallState('ringing');
      setCallType(type);
      // Store offer for when user accepts
      peerRef._pendingOffer = { offer, from, type };
    });

    socket.on('call:answer', async ({ answer }) => {
      await peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
      setCallState('connected');
    });

    socket.on('call:ice-candidate', async ({ candidate }) => {
      await peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on('call:end', cleanup);

    return () => {
      socket.off('call:offer');
      socket.off('call:answer');
      socket.off('call:ice-candidate');
      socket.off('call:end');
    };
  }, [socket, cleanup]);

  return {
    localStream, remoteStream,
    callState, callType,
    startCall, answerCall, endCall,
    toggleMute, toggleCamera,
  };
}
