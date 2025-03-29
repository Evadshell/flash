"use client";
import React from "react";
import { Sun, Moon, Layout } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/AuthContext";

function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const [selectedChannel, setSelectedChannel] = React.useState<string | undefined>(undefined);

  if (isLoading) return <div className="text-white">Loading...</div>;
  if (!isAuthenticated) return <div className="text-white">Please sign in to access the dashboard</div>;

  return (
    <div className={cn("min-h-screen flex", theme === "dark" ? "dark" : "")}>
      <Sidebar onChannelSelect={setSelectedChannel} /> {/* Pass a callback to Sidebar */}
      <main className="flex-1 flex flex-col">
        <nav className="h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-900 text-white">
          <div className="flex items-center space-x-4">
            <Layout className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Flash</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">{user?.firstName || user?.username}</span>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-800">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </nav>
        <ChatArea channelId={selectedChannel} />
      </main>
    </div>
  );
}

export default Dashboard;