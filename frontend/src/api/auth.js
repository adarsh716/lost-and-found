import apiClient from '../services/apiclient';

export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};


export const registerUser = async (fullName, email, password) => {
  try {
    const response = await apiClient.post('/api/auth/register', { fullName, email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await apiClient.post('/api/auth/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const updateProfile = async (userId, fullName, address, phoneNumber, email) => {
  try {
    const response = await apiClient.put('/api/profile/', { userId, fullName, address, phoneNumber, email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getUserData = async (userId) => {
  try {
    const response = await apiClient.get(`/api/profile`, { params: { userId } });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const updateUsername = async (userId, fullName) => {
  try {
    const response = await apiClient.put('/api/profile/change-username', { userId, fullName });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};


export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const response = await apiClient.put('/api/auth/change', { userId, currentPassword, newPassword });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getCommunityMessages = async () => {
  try {
    const response = await apiClient.get('/api/messages/community');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const sendCommunityMessage = async (messageData) => {
  try {
    const response = await apiClient.post('/api/messages/community', messageData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getPrivateMessages = async (recipientId) => {
  try {
    const response = await apiClient.get(`/api/messages/private/${recipientId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const sendPrivateMessage = async (messageData) => {
  try {
    const response = await apiClient.post('/api/messages/private', messageData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getUserDataPublic = async (userId) => {
  try {
    const response = await apiClient.get(`/api/profile/public`, { params: { userId } });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};


export const sendFriendRequest = async (receiverId, senderId, message) => {
  try {
    const response = await apiClient.post('/api/friends/send', { receiverId, senderId, message });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getFriendRequests = async (userId) => {
  try {
    const response = await apiClient.get(`/api/friends/requests`, { params: { userId } });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const acceptFriendRequest = async (requestId, userId) => {
  try {
    const response = await apiClient.put('/api/friends/accept', {
      requestId,
      userId
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const deleteFriendRequest = async (requestId, userId) => {
  try {
    const response = await apiClient.put('/api/friends/decline', {
      requestId,
      userId
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

