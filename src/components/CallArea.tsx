// components/CallArea.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, Phone } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

// Abstracted call service interface
interface CallService {
  join: (channel: string, userId: string) => Promise<void>;
  leave: () => Promise<void>;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
}

// Configuration
const CALL_CONFIG = {
  appId: "5226df5ffaba47ec9fa710a427b16c49",
  defaultChannel: "test",
  token: "007eJxTYGBdXhRunGY1d8nxN35K8wq8KmZsFFxptGCVm11VjfCx728UGEyNjMxS0kzT0hKTEk3MU5Mt0xLNDQ0STYzMkwzNkk0sL1TcTW8IZGQ4nveOlZEBAkF8FoaS1OISBgYAT24gsg=="
};

const CallArea = ({ channelId }: { channelId?: string }) => {
  const [isInCall, setIsInCall] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);
  const { user } = useAuthContext();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const callServiceRef = useRef<CallService | null>(null);

  // Initialize call service (hiding Agora implementation)
  const initializeCallService = async () => {
    const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
    
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    let localAudioTrack: any;
    let localVideoTrack: any;

    const join = async (channel: string, userId: string) => {
      await client.join(CALL_CONFIG.appId, channel, CALL_CONFIG.token, userId);
      
      localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localVideoTrack = await AgoraRTC.createCameraVideoTrack();
      
      await client.publish([localAudioTrack, localVideoTrack]);
      if (localVideoRef.current) {
        localVideoTrack.play(localVideoRef.current);
      }
    };

    const leave = async () => {
      if (localAudioTrack) localAudioTrack.close();
      if (localVideoTrack) localVideoTrack.close();
      await client.leave();
    };

    const toggleAudio = async () => {
      if (localAudioTrack) {
        await localAudioTrack.setEnabled(!localAudioTrack.enabled);
      }
    };

    const toggleVideo = async () => {
      if (localVideoTrack) {
        await localVideoTrack.setEnabled(!localVideoTrack.enabled);
      }
    };

    // Handle remote users
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "video") {
        const remoteVideoTrack = user.videoTrack;
        setParticipants((prev) => [...prev, { uid: user.uid, videoTrack: remoteVideoTrack }]);
      }
      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
    });

    client.on("user-unpublished", (user) => {
      setParticipants((prev) => prev.filter((p) => p.uid !== user.uid));
    });

    client.on("user-left", (user) => {
      setParticipants((prev) => prev.filter((p) => p.uid !== user.uid));
    });

    return { join, leave, toggleAudio, toggleVideo };
  };

  useEffect(() => {
    if (!user || !channelId) return;

    const setupCall = async () => {
      callServiceRef.current = await initializeCallService();
    };
    setupCall();

    return () => {
      callServiceRef.current?.leave();
    };
  }, [user, channelId]);

  const startCall = async () => {
    if (!callServiceRef.current || !user || !channelId) return;
    
    try {
      const userId = user.emailAddresses[0].emailAddress;
      await callServiceRef.current.join(channelId, userId);
      setIsInCall(true);
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const endCall = async () => {
    if (!callServiceRef.current) return;
    
    try {
      await callServiceRef.current.leave();
      setIsInCall(false);
      setParticipants([]);
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };

  const toggleAudio = async () => {
    if (!callServiceRef.current) return;
    
    await callServiceRef.current.toggleAudio();
    setIsAudioOn((prev) => !prev);
  };

  const toggleVideo = async () => {
    if (!callServiceRef.current) return;
    
    await callServiceRef.current.toggleVideo();
    setIsVideoOn((prev) => !prev);
  };

  useEffect(() => {
    participants.forEach((participant) => {
      const videoElement = document.getElementById(`remote-${participant.uid}`) as HTMLVideoElement;
      if (videoElement && participant.videoTrack) {
        participant.videoTrack.play(videoElement);
      }
    });
  }, [participants]);

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white h-screen">
      <div className="border-b border-gray-800 p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {channelId ? `# ${channelId} Call` : "No Call Active"}
        </h2>
        {channelId && !isInCall && (
          <button
            onClick={startCall}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start Call
          </button>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {isInCall ? (
          <>
            {/* Local Video */}
            <div className="relative w-full max-w-md">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg border-2 border-gray-700"
              />
              <span className="absolute bottom-2 left-2 bg-gray-800 px-2 py-1 rounded text-sm">
                You ({user?.emailAddresses[0].emailAddress})
              </span>
            </div>

            {/* Remote Participants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participants.map((participant) => (
                <div key={participant.uid} className="relative w-full max-w-md">
                  <video
                    id={`remote-${participant.uid}`}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg border-2 border-gray-700"
                  />
                  <span className="absolute bottom-2 left-2 bg-gray-800 px-2 py-1 rounded text-sm">
                    {participant.uid}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p className="text-lg">
              {channelId ? "Click 'Start Call' to begin" : "Select a channel to start a call"}
            </p>
          </div>
        )}
      </div>

      {isInCall && (
        <div className="p-4 border-t border-gray-800 flex justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-lg ${isAudioOn ? "bg-gray-700" : "bg-red-600"} hover:bg-opacity-80`}
          >
            {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-2 rounded-lg ${isVideoOn ? "bg-gray-700" : "bg-red-600"} hover:bg-opacity-80`}
          >
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>
          <button
            onClick={endCall}
            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Phone className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CallArea;