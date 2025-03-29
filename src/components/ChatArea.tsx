"use client"
import React, { useState } from 'react';
import { Send, Paperclip, Smile, Phone, Video } from 'lucide-react';

const ChatArea = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: {
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      text: "Hey team! How's everyone doing today?",
      time: '12:34 PM'
    },
    {
      id: 2,
      user: {
        name: 'Sarah Wilson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      text: 'Going great! Just finished the new feature implementation.',
      time: '12:36 PM'
    },
    {
      id: 3,
      user: {
        name: 'Mike Johnson',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      text: 'Excellent work, Sarah! Looking forward to reviewing it.',
      time: '12:38 PM'
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      user: {
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      text: message,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold"># general</h2>
          <span className="text-sm text-muted-foreground">3 members</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-secondary rounded-lg" title="Start voice call">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-lg" title="Start video call">
            <Video className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start space-x-3">
            <img
              src={msg.user.avatar}
              alt={msg.user.name}
              className="h-8 w-8 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{msg.user.name}</span>
                <span className="text-xs text-muted-foreground">{msg.time}</span>
              </div>
              <p className="mt-1 text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <button type="button" className="p-2 hover:bg-secondary rounded-lg">
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 rounded-lg bg-secondary"
          />
          <button type="button" className="p-2 hover:bg-secondary rounded-lg">
            <Smile className="h-5 w-5" />
          </button>
          <button
            type="submit"
            className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
            disabled={!message.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatArea;