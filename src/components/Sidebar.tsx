"use client"
import React, { useState } from 'react';
import { MessageSquare, Users, Settings, Phone, ChevronDown, Plus, Hash, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [channels, setChannels] = useState([
    { id: 1, name: 'general', participants: ['John Doe', 'Sarah Wilson', 'Mike Johnson'] },
    { id: 2, name: 'development', participants: ['John Doe', 'Alex Turner', 'Emma Davis'] },
    { id: 3, name: 'design', participants: ['Sarah Wilson', 'Lisa Brown', 'Chris Evans'] },
  ]);
  const [showParticipants, setShowParticipants] = useState<number | null>(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const [teamMembers] = useState([
    { id: 1, name: 'Sarah Wilson', status: 'online', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: 2, name: 'Mike Johnson', status: 'offline', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: 3, name: 'Emma Davis', status: 'online', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  ]);

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const newChannel = {
      id: channels.length + 1,
      name: newChannelName.toLowerCase().replace(/\s+/g, '-'),
      participants: ['John Doe']
    };

    setChannels([...channels, newChannel]);
    setNewChannelName('');
    setShowChannelModal(false);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement invite functionality
    setInviteEmail('');
    setShowInviteModal(false);
  };

  return (
    <>
      <aside className={`${isCollapsed ? 'w-16' : 'w-64'} border-r bg-card flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
                className="h-8 w-8 rounded-full"
              />
              <div>
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-secondary rounded-lg"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/messages" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary">
            <MessageSquare className="h-5 w-5" />
            {!isCollapsed && <span>Messages</span>}
          </Link>
          <Link href="/team" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary">
            <Users className="h-5 w-5" />
            {!isCollapsed && <span>Team</span>}
          </Link>
          <Link href="/calls" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary">
            <Phone className="h-5 w-5" />
            {!isCollapsed && <span>Calls</span>}
          </Link>
          <Link href="/settings" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary">
            <Settings className="h-5 w-5" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </nav>

        {!isCollapsed && (
          <>
            <div className="p-4 border-t">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Team Members</h3>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="p-1 hover:bg-secondary rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-6 w-6 rounded-full"
                        />
                        <div className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${
                          member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <span className="text-sm">{member.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Channels</h3>
                  <button
                    onClick={() => setShowChannelModal(true)}
                    className="p-1 hover:bg-secondary rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {channels.map((channel) => (
                    <div key={channel.id} className="space-y-1">
                      <button
                        onClick={() => setShowParticipants(showParticipants === channel.id ? null : channel.id)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-secondary group"
                      >
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span>{channel.name}</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${showParticipants === channel.id ? 'rotate-180' : ''}`} />
                      </button>
                      {showParticipants === channel.id && (
                        <div className="ml-6 space-y-1">
                          {channel.participants.map((participant, index) => (
                            <div key={index} className="text-sm text-muted-foreground py-1 px-2">
                              {participant}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Create Channel Modal */}
      {showChannelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Channel</h3>
              <button
                onClick={() => setShowChannelModal(false)}
                className="p-1 hover:bg-secondary rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateChannel}>
              <div className="mb-4">
                <label htmlFor="channelName" className="block text-sm font-medium mb-1">
                  Channel Name
                </label>
                <input
                  id="channelName"
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full p-2 rounded-lg border bg-background"
                  placeholder="e.g. project-discussion"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowChannelModal(false)}
                  className="px-4 py-2 rounded-lg hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 hover:bg-secondary rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleInvite}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2 rounded-lg border bg-background"
                  placeholder="colleague@example.com"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-lg hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;