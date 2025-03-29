"use client"
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Sun, Moon, MessageSquare, Users, Settings, Phone, Layout } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import { cn } from '@/lib/utils';

function Dashboard() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={cn(
      "min-h-screen flex",
      theme === 'dark' ? 'dark' : ''
    )}>
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <nav className="h-14 border-b flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Layout className="h-6 w-6" />
            <h1 className="text-xl font-semibold">RemoteHub</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </nav>
        <ChatArea />
      </main>
    </div>
  );
}

export default Dashboard;