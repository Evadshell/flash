"use client"
import React from 'react';
import { Bell, Moon, Sun, Globe, Lock, User } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex-1 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-card rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="font-semibold flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Settings
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full p-2 rounded-lg border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  defaultValue="john.doe@example.com"
                  className="w-full p-2 rounded-lg border bg-background"
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-card rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="font-semibold flex items-center">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 mr-2" />
                ) : (
                  <Sun className="h-5 w-5 mr-2" />
                )}
                Appearance
              </h2>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark mode
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-secondary rounded-lg"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="font-semibold flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when you're mentioned
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates for important events
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-card rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="font-semibold flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Privacy
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Online Status</p>
                  <p className="text-sm text-muted-foreground">
                    Show when you're active
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Read Receipts</p>
                  <p className="text-sm text-muted-foreground">
                    Show when you've read messages
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;