import { useRef, useEffect } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { useState } from 'react';
import useWebRTC from '../../hooks/useWebRTC';

export default function VideoCall({ targetUser, onClose }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const {
    localStream, remoteStream, callState,
    startCall, endCall, toggleMute, toggleCamera,
  } = useWebRTC(targetUser?._id);

  useEffect(() => {
    if (localStream && localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => { startCall('video'); }, []);

  const handleMic = () => { toggleMute(); setMicOn(p => !p); };
  const handleCam = () => { toggleCamera(); setCamOn(p => !p); };
  const handleEnd = () => { endCall(); onClose(); };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center">
      {/* Remote video */}
      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

      {/* Local video (picture-in-picture) */}
      <div className="absolute top-4 right-4 w-32 h-44 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
        <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
      </div>

      {/* Status */}
      {callState !== 'connected' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <img src={targetUser?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${targetUser?.username}`}
            className="w-24 h-24 rounded-full mb-4 border-4 border-white/20" />
          <h3 className="text-xl font-semibold">{targetUser?.name}</h3>
          <p className="text-white/60 mt-1 capitalize">{callState === 'calling' ? 'Calling…' : callState}</p>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 flex items-center gap-4">
        <button onClick={handleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'}`}>
          {micOn ? <Mic size={22} className="text-white" /> : <MicOff size={22} className="text-white" />}
        </button>
        <button onClick={handleEnd}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
          <PhoneOff size={26} className="text-white" />
        </button>
        <button onClick={handleCam}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${camOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'}`}>
          {camOn ? <Video size={22} className="text-white" /> : <VideoOff size={22} className="text-white" />}
        </button>
      </div>
    </div>
  );
}
