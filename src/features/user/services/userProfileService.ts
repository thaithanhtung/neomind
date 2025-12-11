import { supabase } from '@/features/mindmap/services/supabaseService';

export type UserRole = 'user' | 'super_admin';

export interface UserProfile {
  user_id: string;
  role: UserRole;
  ai_model: string;
  created_at: string;
  updated_at: string;
}

export const userProfileService = {
  /**
   * Lấy profile của user hiện tại
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCurrentUserProfile:', error);
      return null;
    }
  },

  /**
   * Update AI model - CHỈ super_admin mới được phép
   */
  async updateAIModel(model: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Kiểm tra role trước khi update
      const profile = await this.getCurrentUserProfile();
      if (!profile) {
        return { success: false, error: 'User profile not found' };
      }

      if (profile.role !== 'super_admin') {
        return {
          success: false,
          error: 'Only super_admin can update AI model',
        };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ai_model: model,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating AI model:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateAIModel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Check xem user có phải super_admin không
   */
  async isSuperAdmin(): Promise<boolean> {
    const profile = await this.getCurrentUserProfile();
    return profile?.role === 'super_admin';
  },

  /**
   * Tạo hoặc update user profile
   */
  async upsertUserProfile(
    userId: string,
    data: Partial<Omit<UserProfile, 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('user_profiles').upsert(
        {
          user_id: userId,
          ...data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      if (error) {
        console.error('Error upserting user profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in upsertUserProfile:', error);
      return false;
    }
  },
};
