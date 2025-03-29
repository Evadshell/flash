// components/ChatArea.tsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Paperclip, Smile, Phone, Video, Mic, MicOff, VideoOff } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { io, Socket } from "socket.io-client";
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";

interface Message {
  _id: string;
  senderEmail: string;
  text: string;
  createdAt: string;
}

interface CallParticipant {
  uid: string;
  videoTrack?: any;
  audioTrack?: any;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";
const CALL_CONFIG = {
  appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || "5226df5ffaba47ec9fa710a427b16c49",
  token: "007eJxTYGBdXhRunGY1d8nxN35K8wq8KmZsFFxptGCVm11VjfCx728UGEyNjMxS0kzT0hKTEk3MU5Mt0xLNDQ0STYzMkwzNkk0sL1TcTW8IZGQ4nveOlZEBAkF8FoaS1OISBgYAT24gsg==", // Should be generated server-side in production
};

const ChatArea = ({ channelId }: { channelId?: string }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  
  const { user } = useAuthContext();
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localTracksRef = useRef<{
    audioTrack?: any;
    videoTrack?: any;
  }>({});

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Initialize Agora client
  const initializeAgoraClient = useCallback(() => {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    
    client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType) => {
      try {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && user.videoTrack) {
          setParticipants(prev => [...prev.filter(p => p.uid !== user.uid.toString()), {
            uid: user.uid.toString(),
            videoTrack: user.videoTrack
          }]);
        }
        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.play();
          setParticipants(prev => prev.map(p => 
            p.uid === user.uid.toString() ? { ...p, audioTrack: user.audioTrack } : p
          ));
        }
      } catch (err) {
        console.error("Subscription error:", err);
        setError("Failed to connect to participant");
      }
    });

    client.on("user-unpublished", (user: IAgoraRTCRemoteUser) => {
      setParticipants(prev => prev.filter(p => p.uid !== user.uid.toString()));
    });

    client.on("user-left", (user: IAgoraRTCRemoteUser) => {
      setParticipants(prev => prev.filter(p => p.uid !== user.uid.toString()));
    });

    client.on("exception", (event) => {
      console.error("Agora exception:", event);
      setError("Call connection issue occurred");
    });

    return client;
  }, []);

  useEffect(() => {
    if (!user || !channelId) return;

    // Socket initialization
    socketRef.current = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const userEmail = user.emailAddresses[0].emailAddress;

    socketRef.current.on("connect", () => {
      socketRef.current?.emit("joinChannel", { channelId, userEmail });
    });

    socketRef.current.on("initialMessages", (initialMessages: Message[]) => {
      setMessages(initialMessages.map(msg => ({
        ...msg,
        createdAt: new Date(msg.createdAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }),
      })));
      setLoading(false);
      scrollToBottom();
    });

    socketRef.current.on("newMessage", (newMessage: Message) => {
      setMessages(prev => [...prev, {
        ...newMessage,
        createdAt: new Date(newMessage.createdAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }),
      }]);
      scrollToBottom();
    });

    socketRef.current.on("error", ({ message }: { message: string }) => {
      setError(message);
      setLoading(false);
    });

    // Initialize Agora client
    clientRef.current = initializeAgoraClient();
    setLoading(true);

    return () => {
      socketRef.current?.disconnect();
      cleanupCall();
    };
  }, [channelId, user, scrollToBottom, initializeAgoraClient]);

  const startCall = async () => {
    if (!clientRef.current || !user || !channelId) return;

    try {
      const userId = user.emailAddresses[0].emailAddress;
      localTracksRef.current.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localTracksRef.current.videoTrack = await AgoraRTC.createCameraVideoTrack();
      
      await clientRef.current.join(CALL_CONFIG.appId, channelId, CALL_CONFIG.token, userId);
      await clientRef.current.publish([
        localTracksRef.current.audioTrack,
        localTracksRef.current.videoTrack
      ]);

      if (localVideoRef.current) {
        localTracksRef.current.videoTrack.play(localVideoRef.current);
      }
      
      setIsInCall(true);
      setError(null);
    } catch (err) {
      console.error("Call start error:", err);
      setError("Failed to start video call");
      cleanupCall();
    }
  };

  const cleanupCall = async () => {
    try {
      if (localTracksRef.current.audioTrack) {
        localTracksRef.current.audioTrack.close();
      }
      if (localTracksRef.current.videoTrack) {
        localTracksRef.current.videoTrack.close();
      }
      if (clientRef.current) {
        await clientRef.current.leave();
      }
    } catch (err) {
      console.error("Cleanup error:", err);
    } finally {
      localTracksRef.current = {};
      setIsInCall(false);
      setParticipants([]);
    }
  };

  const toggleAudio = async () => {
    if (!localTracksRef.current.audioTrack) return;
    try {
      await localTracksRef.current.audioTrack.setEnabled(!isAudioOn);
      setIsAudioOn(prev => !prev);
    } catch (err) {
      console.error("Audio toggle error:", err);
      setError("Failed to toggle audio");
    }
  };

  const toggleVideo = async () => {
    if (!localTracksRef.current.videoTrack) return;
    try {
      await localTracksRef.current.videoTrack.setEnabled(!isVideoOn);
      setIsVideoOn(prev => !prev);
    } catch (err) {
      console.error("Video toggle error:", err);
      setError("Failed to toggle video");
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || !channelId || !socketRef.current) return;

    const userEmail = user.emailAddresses[0].emailAddress;
    socketRef.current.emit("sendMessage", {
      channelId,
      text: message,
      userEmail,
    });
    setMessage("");
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white h-screen">
      <div className="border-b border-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">
            {channelId ? `# ${channelId}` : "No Channel Selected"}
          </h2>
          {channelId && <span className="text-sm text-gray-400">3 members</span>}
        </div>
        {channelId && (
          <div className="flex items-center space-x-2">
            <button
              onClick={startCall}
              className="p-2 hover:bg-gray-800 rounded-lg disabled:opacity-50"
              title="Start voice call"
              disabled={isInCall}
            >
              <Phone className="h-5 w-5 text-gray-400" />
            </button>
            <button
              onClick={startCall}
              className="p-2 hover:bg-gray-800 rounded-lg disabled:opacity-50"
              title="Start video call"
              disabled={isInCall}
            >
              <Video className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {!channelId ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p className="text-lg">Select a channel to start chatting</p>
          </div>
        ) : loading ? (
          <div className="text-center text-gray-400">Loading messages...</div>
        ) : error ? (
          <div className="text-center text-red-400">{error}</div>
        ) : (
          <>
            {isInCall && (
              <div className="space-y-4">
                <div className="relative w-full max-w-md">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg border-2 border-gray-700 bg-black"
                  />
                  <span className="absolute bottom-2 left-2 bg-gray-800 px-2 py-1 rounded text-sm">
                    You ({user?.emailAddresses[0].emailAddress})
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {participants.map((participant) => (
                    <div key={participant.uid} className="relative w-full max-w-md">
                      <video
                        ref={(el) => el && participant.videoTrack?.play(el)}
                        autoPlay
                        playsInline
                        className="w-full rounded-lg border-2 border-gray-700 bg-black"
                      />
                      <span className="absolute bottom-2 left-2 bg-gray-800 px-2 py-1 rounded text-sm">
                        {participant.uid}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg._id} className="flex items-start space-x-3">
                <img
                  src={
                    user?.emailAddresses[0].emailAddress === msg.senderEmail
                      ? user.profileImageUrl || user.imageUrl
                      : "https://via.placeholder.com/32"
                  }
                  alt={msg.senderEmail}
                  className="h-8 w-8 rounded-full border-2 border-gray-700"
                  onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/32")}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-200">
                      {user?.emailAddresses[0].emailAddress === msg.senderEmail
                        ? user.fullName || user.username
                        : msg.senderEmail.split("@")[0]}
                    </span>
                    <span className="text-xs text-gray-500">{msg.createdAt}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-300">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {channelId && (
        <div className="p-4 border-t border-gray-800">
          {isInCall ? (
            <div className="flex justify-center space-x-4">
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
                onClick={cleanupCall}
                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Phone className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage}>
              <div className="flex items-center space-x-2">
                <button type="button" className="p-2 hover:bg-gray-800 rounded-lg">
                  <Paperclip className="h-5 w-5 text-gray-400" />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button type="button" className="p-2 hover:bg-gray-800 rounded-lg">
                  <Smile className="h-5 w-5 text-gray-400" />
                </button>
                <button
                  type="submit"
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={!message.trim() || loading}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatArea;