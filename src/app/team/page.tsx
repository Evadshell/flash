import React from 'react';
import { Users, Mail, Phone, Video } from 'lucide-react';

const Team = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Wilson',
      role: 'Product Designer',
      email: 'sarah.wilson@example.com',
      status: 'online',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      id: 2,
      name: 'Mike Johnson',
      role: 'Frontend Developer',
      email: 'mike.johnson@example.com',
      status: 'offline',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      id: 3,
      name: 'Emma Davis',
      role: 'Product Manager',
      email: 'emma.davis@example.com',
      status: 'online',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  ];

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Team Members</h1>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            Add Member
          </button>
        </div>

        <div className="grid gap-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-card p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-12 w-12 rounded-full"
                    />
                    <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                      member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-secondary rounded-lg" title="Send email">
                    <Mail className="h-5 w-5" />
                  </button>
                  <button className="p-2 hover:bg-secondary rounded-lg" title="Voice call">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 hover:bg-secondary rounded-lg" title="Video call">
                    <Video className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;