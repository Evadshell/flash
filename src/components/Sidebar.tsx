"use client";
import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  Settings,
  Phone,
  ChevronDown,
  Plus,
  Hash,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { SignedIn, UserButton } from "@clerk/nextjs";

interface SidebarProps {
  onChannelSelect?: (channelId: string) => void;
}

const Sidebar = ({ onChannelSelect }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [channels, setChannels] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [showParticipants, setShowParticipants] = useState<string | null>(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [requestTargetId, setRequestTargetId] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    fetchChannels();
    fetchRequests();
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await fetch("/api/channels");
      if (!res.ok) throw new Error("Failed to fetch channels");
      const data = await res.json();
      if (Array.isArray(data)) setChannels(data);
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests");
      if (!res.ok) throw new Error("Failed to fetch requests");
      const { sentRequests, receivedRequests } = await res.json();
      setSentRequests(sentRequests);
      setReceivedRequests(receivedRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newChannelName.toLowerCase().replace(/\s+/g, "-"),
        }),
      });

      if (!res.ok) throw new Error("Failed to create channel");
      const newChannel = await res.json();
      setChannels((prev) => [...prev, newChannel]);
      setNewChannelName("");
      setShowChannelModal(false);
    } catch (error) {
      console.error("Error creating channel:", error);
      alert("Failed to create channel. Please try again.");
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTargetId.trim() || !selectedChannelId) return;

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: selectedChannelId,
          targetId: requestTargetId, // Assuming targetId is a userId
        }),
      });

      if (!res.ok) throw new Error("Failed to send request");
      const newRequest = await res.json();
      setSentRequests((prev) => [...prev, newRequest]);
      setRequestTargetId("");
      setShowRequestModal(false);
    } catch (error) {
      console.error("Error sending request:", error);
      alert("Failed to send request. Please try again.");
    }
  };

  const handleRequestAction = async (requestId: string, action: "accept" | "reject") => {
    try {
      const res = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      if (!res.ok) throw new Error("Failed to update request");
      const result = await res.json();

      if (action === "accept") {
        setReceivedRequests((prev) => prev.filter((req) => req._id !== requestId));
        fetchChannels(); // Refresh channels to include the newly joined one
        if (onChannelSelect) onChannelSelect(result.channelId); // Auto-select the channel
      } else {
        setReceivedRequests((prev) => prev.filter((req) => req._id !== requestId));
      }
    } catch (error) {
      console.error("Error updating request:", error);
      alert(`Failed to ${action} request. Please try again.`);
    }
  };

  return (
    <aside
      className={`${isCollapsed ? "w-16" : "w-64"} border-r bg-gray-800 text-white flex flex-col transition-all duration-300 h-screen`}
    >
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!isCollapsed && user && (
          <div className="flex items-center space-x-3">
            <SignedIn>
              <div className="flex flex-col items-center space-y-4">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{ elements: { userButtonAvatarBox: "h-12 w-12" } }}
                />
              </div>
            </SignedIn>
            <div>
              <p className="font-semibold text-lg">{user.fullName || user.username || "User"}</p>
              <p className="text-sm text-gray-400">Online</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-700 rounded-lg"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link href="/messages" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
          <MessageSquare className="h-5 w-5" />
          {!isCollapsed && <span className="text-sm">Messages</span>}
        </Link>
        <Link href="/team" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
          <Users className="h-5 w-5" />
          {!isCollapsed && <span className="text-sm">Team</span>}
        </Link>
        <Link href="/calls" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
          <Phone className="h-5 w-5" />
          {!isCollapsed && <span className="text-sm">Calls</span>}
        </Link>
        <Link href="/settings" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
          <Settings className="h-5 w-5" />
          {!isCollapsed && <span className="text-sm">Settings</span>}
        </Link>
      </nav>

      {!isCollapsed && (
        <div className="p-4 border-t border-gray-700 flex-1 overflow-y-auto">
          {/* Channels Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-300">Channels</h3>
              <button
                onClick={() => setShowChannelModal(true)}
                className="p-1 hover:bg-gray-700 rounded-lg"
              >
                <Plus className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-1">
              {channels.map((channel) => (
                <div key={channel._id} className="space-y-1">
                  <button
                    onClick={() => {
                      setShowParticipants(showParticipants === channel._id ? null : channel._id);
                      if (onChannelSelect) onChannelSelect(channel._id);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span>{channel.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedChannelId(channel._id);
                          setShowRequestModal(true);
                        }}
                        className="p-1 hover:bg-gray-600 rounded-lg"
                      >
                        <UserPlus className="h-4 w-4 text-gray-400" />
                      </button>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          showParticipants === channel._id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                  {showParticipants === channel._id && (
                    <div className="ml-6 space-y-1">
                      {channel.participants.map((participant, index) => (
                        <div key={index} className="text-sm text-gray-400 py-1 px-2">
                          {participant}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Requests Section */}
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Requests</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400 font-semibold">Sent Requests</p>
                {sentRequests.map((req) => (
                  <div key={req._id} className="text-sm text-gray-300 py-1 px-2">
                    To: {req.targetId} for #{channels.find((c) => c._id === req.channelId)?.name || req.channelId} - {req.status}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold">Received Requests</p>
                {receivedRequests.map((req) => (
                  <div key={req._id} className="flex items-center justify-between text-sm text-gray-300 py-1 px-2">
                    <span>
                      From: {req.senderId} for #{channels.find((c) => c._id === req.channelId)?.name || req.channelId}
                    </span>
                    {req.status === "pending" && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleRequestAction(req._id, "accept")}
                          className="text-green-400 hover:underline"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRequestAction(req._id, "reject")}
                          className="text-red-400 hover:underline"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Channel Creation Modal */}
      {showChannelModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Channel</h3>
              <button onClick={() => setShowChannelModal(false)} className="p-1 hover:bg-gray-700 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateChannel}>
              <div className="mb-4">
                <label htmlFor="channelName" className="block text-sm font-medium mb-1 text-gray-300">
                  Channel Name
                </label>
                <input
                  id="channelName"
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
                  placeholder="e.g. project-discussion"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowChannelModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Sending Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Send Channel Request</h3>
              <button onClick={() => setShowRequestModal(false)} className="p-1 hover:bg-gray-700 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSendRequest}>
              <div className="mb-4">
                <label htmlFor="targetId" className="block text-sm font-medium mb-1 text-gray-300">
                  User ID to Invite
                </label>
                <input
                  id="targetId"
                  type="text"
                  value={requestTargetId}
                  onChange={(e) => setRequestTargetId(e.target.value)}
                  className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
                  placeholder="Enter user ID"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;