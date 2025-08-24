import React from "react";
import { useUserProfile } from "../hooks/UserProfileState";
import DisplayNameModal from "./DisplayNameModal";

interface ProfileSetupWrapperProps {
  children: React.ReactNode;
}

export default function ProfileSetupWrapper({
  children,
}: ProfileSetupWrapperProps) {
  const { profile, isLoading, needsProfile, createProfile } = useUserProfile();

  const handleProfileComplete = (displayName: string) => {
    createProfile(displayName);
  };

  // Show loading state while checking for profile
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <DisplayNameModal
        isOpen={needsProfile}
        onComplete={handleProfileComplete}
      />
    </>
  );
}
