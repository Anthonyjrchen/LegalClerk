import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from "../SupabaseClient";
import { useAuth } from '../AuthProvider';

interface UserProfile {
  id: string;
  display_name: string;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No profile exists - return null to indicate user needs to create one
      return null;
    } else {
      throw new Error(`Error fetching user profile: ${error.message}`);
    }
  }

  return data;
};

export function useUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => fetchUserProfile(user!.id),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes - profiles don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory longer
  });

  const createProfile = async (displayName: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: user.id,
            display_name: displayName,
            preferences: {},
          }
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating profile: ${error.message}`);
      }

      // Update the cache with the new profile
      queryClient.setQueryData(['userProfile', user.id], data);
      
      return data;
    } catch (err) {
      console.error('Error creating user profile:', err);
      throw err;
    }
  };

  const refreshProfile = () => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user.id] });
    }
  };

  return {
    profile: query.data || null,
    isLoading: query.isLoading,
    needsProfile: !query.isLoading && query.data === null && !!user,
    error: query.error,
    createProfile,
    refreshProfile
  };
}