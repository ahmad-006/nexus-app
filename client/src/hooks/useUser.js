import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { userKeys, teamKeys } from '../api/queryKeys';
import useAuthStore from '../store/authStore';
import { toast } from 'sonner';

/**
 * ============================================================================
 * Pure Fetchers & API Calls
 * ============================================================================
 */

export const fetchUserProfile = async (signal) => {
  const response = await axiosInstance.get('/users/me', { signal });
  return response.data.data.user;
};

export const updateUserProfile = async (userData) => {
  const response = await axiosInstance.patch('/users/me', userData);
  return response.data.data.user;
};

export const uploadUserAvatar = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await axiosInstance.post('/users/me/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const updateUserPassword = async (passwordData) => {
  const response = await axiosInstance.patch('/auth/update-password', passwordData);
  return response.data;
};

export const deleteUserAccount = async () => {
  const response = await axiosInstance.delete('/users/me');
  return response.data;
};

/**
 * ============================================================================
 * React Query Hooks
 * ============================================================================
 */

/**
 * Hook to retrieve current logged-in user's profile
 */
export const useUserProfile = () => {
  const { setUser } = useAuthStore();

  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: ({ signal }) => fetchUserProfile(signal),
    staleTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (userData) => {
      if (userData) {
        setUser(userData);
      }
    },
  });
};

/**
 * Hook to update name/profile fields
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setUser, updateUser } = useAuthStore();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    },
  });
};

/**
 * Hook to upload avatar via ImageKit CDN
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: uploadUserAvatar,
    onSuccess: (data) => {
      const imageUrl = data.imageUrl;
      updateUser({ image: imageUrl });
      queryClient.setQueryData(userKeys.profile(), (old) =>
        old ? { ...old, image: imageUrl } : old
      );
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      toast.success('Avatar uploaded successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to upload avatar';
      toast.error(message);
    },
  });
};

/**
 * Hook to change password with old/new validation
 */
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: updateUserPassword,
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update password';
      toast.error(message);
    },
  });
};

/**
 * Hook to permanently delete operative account
 */
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: deleteUserAccount,
    onSuccess: () => {
      queryClient.clear();
      logout();
      toast.success('Operative account terminated');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete account';
      toast.error(message);
    },
  });
};
