"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Send, Paperclip, Smile, Phone, Video } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

const ChatArea = ({ channelId }: { channelId?: string }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { _id: string; user: { name: string; avatar: string }; text: string; time: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const fetchMessages = useCallback(async () => {
    if (!channelId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/messages?channelId=${channelId}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(
          data.map((msg) => ({
            _id: msg._id,
            user: {
              name: user?.id === msg.userId ? (user.fullName || user.username) : msg.userId, // TODO: Fetch real names
              avatar: user?.id === msg.userId ? (user.profileImageUrl || user.imageUrl) : "https://via.placeholder.com/32",
            },
            text: msg.text,
            time: new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true }),
          }))
        );
      }
    } catch (err) {
      setError("Failed to load messages. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [channelId, user]);

  useEffect(() => {
    if (channelId) fetchMessages();
  }, [channelId, fetchMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || !channelId) return;

    const newMessage = {
      userId: user.id,
      channelId,
      text: message,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });

      if (!res.ok) throw new Error("Failed to send message");
      const savedMessage = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          _id: savedMessage._id,
          user: {
            name: user.fullName || user.username,
            avatar: user.profileImageUrl || user.imageUrl,
          },
          text: message,
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true }),
        },
      ]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white h-screen">
      <div className="border-b border-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">{channelId ? `# ${channelId}` : "No Channel Selected"}</h2>
          {channelId && <span className="text-sm text-gray-400">3 members</span>}
        </div>
        {channelId && (
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-800 rounded-lg" title="Start voice call">
              <Phone className="h-5 w-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg" title="Start video call">
              <Video className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {!channelId ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p className="text-lg">Select a channel from the sidebar to start chatting</p>
          </div>
        ) : loading ? (
          <div className="text-center text-gray-400">Loading messages...</div>
        ) : error ? (
          <div className="text-center text-red-400">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className="flex items-start space-x-3">
              <img
                src={msg.user.avatar}
                alt={msg.user.name}
                className="h-8 w-8 rounded-full border-2 border-gray-700"
                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/32")}
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-200">{msg.user.name}</span>
                  <span className="text-xs text-gray-500">{msg.time}</span>
                </div>
                <p className="mt-1 text-sm text-gray-300">{msg.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {channelId && (
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
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
  );
};

export default ChatArea;