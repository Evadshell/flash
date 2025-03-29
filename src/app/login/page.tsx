"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Layout } from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const Login = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg transform transition-all hover:shadow-xl">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Layout className="h-14 w-14 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome to Flash
          </h2>
          <p className="text-gray-600 text-sm">
            Access your account to get started
          </p>
        </div>

        {/* Auth Buttons Section */}
        <div className="space-y-4">
          <SignedOut>
            <SignInButton mode="modal" >
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal" >
              <button className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 font-medium">
                Create an Account
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <div className="flex flex-col items-center space-y-4">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-12 w-12",
                  },
                }}
              />
              <button
                onClick={() => router.push("/dashboard")}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </SignedIn>
        </div>

        {/* Forgot Password Link */}
        <SignedOut>
          <div className="text-center">
            <a
              href="/forgot-password" // Update this to your actual forgot password route
              className="text-sm text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200"
            >
              Forgot your password?
            </a>
          </div>
        </SignedOut>
      </div>
    </div>
  );
};

export default Login;