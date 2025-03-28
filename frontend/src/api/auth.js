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

export const sendCommunityMessage = async (formData) => {
  try {
    console.log('Sending data:', {
      text: formData.get('text'),
      userId: formData.get('userId'),
      username: formData.get('username'),
      image: formData.get('image') ? 'File present' : 'No file' 
    });

    const response = await apiClient.post('/api/messages/community', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in sendCommunityMessage:', error);
    throw error.response ? error.response.data : error.message;
  }
};

export const getPrivateMessages = async (recipientId, senderId) => {
  const response = await apiClient.get(`/api/messages/private`, { 
    params: { 
      recipientId,
      senderId 
    }
  });
  console.log(response.data)
  return response.data;
};


export const sendPrivateMessage = async (formData) => {
  try {
    console.log('Sending private message data:', {
      text: formData.get('text'),
      senderId: formData.get('senderId'),
      recipientId: formData.get('recipientId'),
      image: formData.get('image') ? 'File present' : 'No file'
    });

    const response = await apiClient.post('/api/messages/private', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('Private message response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in sendPrivateMessage:', error);
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

export const removeFriend = async ( userId, friendId) => {
  try {
    const response = await apiClient.post('/api/friends/remove', {
      userId,
      friendId
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const blockFriend = async (userId, blockedUserId) => {
  try {
    const response = await apiClient.post('/api/friends/block', {
      userId,
      blockedUserId
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};


