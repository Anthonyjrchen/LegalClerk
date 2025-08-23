import { useState, useEffect } from 'react';
import { supabase } from "../SupabaseClient";
import { useAuth } from '../AuthProvider';

interface UserProfile {
  id: string;
  display_name: string;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No profile exists - user needs to create one
            setNeedsProfile(true);
          } else {
            console.error('Error fetching user profile:', error);
          }
        } else {
          setProfile(data);
          setNeedsProfile(false);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const createProfile = (displayName: string) => {
    if (user) {
      const newProfile: UserProfile = {
        id: user.id,
        display_name: displayName,
        preferences: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setProfile(newProfile);
      setNeedsProfile(false);
    }
  };

  return {
    profile,
    isLoading,
    needsProfile,
    createProfile
  };
}