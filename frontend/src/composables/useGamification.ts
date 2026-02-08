import { ref, computed } from 'vue';
import axios from '@/utils/axios';
import { useAppToast } from './useAppToast';

export function useGamification() {
  const { showSuccessToast, showErrorToast } = useAppToast();
  
  const userPoints = ref(null);
  const currentLevel = ref(null);
  const nextLevel = ref(null);
  const tasks = ref([]);
  const rewards = ref([]);
  const userRewards = ref([]);
  const loading = ref(false);

  const fetchUserPoints = async (userId: number) => {
    try {
      const response = await axios.get(`/api/points/${userId}`);
      userPoints.value = response.data.data;
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  };

  const fetchCurrentLevel = async (userId: number) => {
    try {
      const response = await axios.get(`/api/levels/history/${userId}?limit=1`);
      if (response.data.data && response.data.data.length > 0) {
        currentLevel.value = response.data.data[0];
      }
    } catch (error) {
      console.error('Error fetching level:', error);
    }
  };

  const fetchTasks = async () => {
    loading.value = true;
    try {
      const response = await axios.get('/api/tasks');
      tasks.value = response.data.data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      tasks.value = [];
    } finally {
      loading.value = false;
    }
  };

  const completeTask = async (taskId: number) => {
    try {
      await axios.post('/api/tasks/complete', { task_id: taskId });
      showSuccessToast('Hoàn thành nhiệm vụ thành công! +Điểm');
      // Refresh data
      await fetchTasks();
    } catch (error: any) {
      showErrorToast(error.response?.data?.message || 'Lỗi khi hoàn thành nhiệm vụ');
      throw error;
    }
  };

  const fetchRewards = async (page = 1, limit = 10) => {
    loading.value = true;
    try {
      const response = await axios.get(`/api/rewards?page=${page}&limit=${limit}`);
      rewards.value = response.data.data || [];
      return response.data.pagination;
    } catch (error) {
      console.error('Error fetching rewards:', error);
      rewards.value = [];
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchUserRewards = async (userId: number) => {
    try {
      const response = await axios.get(`/api/user-rewards/${userId}`);
      userRewards.value = response.data.data || [];
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      userRewards.value = [];
    }
  };

  const claimReward = async (rewardId: number, userId: number) => {
    try {
      await axios.post('/api/rewards/claim', { reward_id: rewardId });
      showSuccessToast('Đổi phần thưởng thành công!');
      await fetchUserPoints(userId); // Refresh points
      await fetchUserRewards(userId); // Refresh inventory
    } catch (error: any) {
      showErrorToast(error.response?.data?.message || 'Lỗi khi đổi phần thưởng');
      throw error;
    }
  };

  const userCurrency = ref(0); // State for Linh Thach

  const fetchUserCurrency = async () => {
    try {
        const response = await axios.get('/api/currency/balance');
        userCurrency.value = response.data.data.balance;
    } catch (error) {
        console.error('Error fetching currency:', error);
    }
  };

  const buyReward = async (rewardId: number, userId: number) => {
      try {
          await axios.post('/api/user-rewards/buy', { rewardId });
          showSuccessToast('Mua vật phẩm thành công!');
          await fetchUserCurrency(); // Update balance
          await fetchUserRewards(userId); // Update inventory
      } catch (error: any) {
          showErrorToast(error.response?.data?.message || 'Lỗi khi mua vật phẩm');
          throw error;
      }
  };

  const levelProgress = computed(() => {
    if (!userPoints.value || !currentLevel.value) return 0;
    // This logic might need adjustment based on how we determine "next level" requirements
    // For now assuming we have simple logic or nextLevel data
    return 0; 
  });

  return {
    userPoints,
    currentLevel,
    tasks,
    rewards,
    userRewards,
    userCurrency, // Export currency
    loading,
    fetchUserPoints,
    fetchCurrentLevel,
    fetchTasks,
    completeTask,
    fetchRewards,
    fetchUserRewards,
    fetchUserCurrency, // Export fetch function
    buyReward, // Export buy function
    claimReward, // Catalog claim (milestone)
    levelProgress
  };
}
