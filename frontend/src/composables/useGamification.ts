import { ref, computed } from 'vue';
import axios from '@/utils/axios';
import { useAppToast } from './useAppToast';

export function useGamification() {
  const { showSuccessToast, showErrorToast } = useAppToast();
  
  const userPoints    = ref<any>(null);
  const currentLevel  = ref<any>(null);
  const tasks         = ref<any[]>([]);
  const rewards       = ref<any[]>([]);
  const userRewards   = ref<any[]>([]);
  const mailbox       = ref<any[]>([]);   // Quà trong hộp thư (status='unlocked')
  const badges        = ref<any[]>([]);   // Huy hiệu trong túi đồ
  const userCurrency  = ref(0);
  const loading       = ref(false);

  // ── Points & Level ────────────────────────────────────────
  const fetchUserPoints = async (userId: number) => {
    try {
      const res = await axios.get(`/api/points/${userId}`);
      userPoints.value = res.data.data;
    } catch (e) { console.error('fetchUserPoints:', e); }
  };

  const fetchCurrentLevel = async (userId: number) => {
    try {
      const res = await axios.get(`/api/levels/history/${userId}?limit=1`);
      if (res.data.data?.length > 0) currentLevel.value = res.data.data[0];
    } catch (e) { console.error('fetchCurrentLevel:', e); }
  };

  // ── Tasks ─────────────────────────────────────────────────
  const fetchTasks = async () => {
    loading.value = true;
    try {
      const res = await axios.get('/api/tasks');
      tasks.value = res.data.data || [];
    } catch (e) { tasks.value = []; }
    finally { loading.value = false; }
  };

  const completeTask = async (taskId: number) => {
    try {
      await axios.post('/api/tasks/complete', { task_id: taskId });
      showSuccessToast('Hoàn thành nhiệm vụ! +Điểm');
      await fetchTasks();
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || 'Lỗi hoàn thành nhiệm vụ');
      throw e;
    }
  };

  // ── Reward Catalog ────────────────────────────────────────
  const fetchRewards = async (page = 1, limit = 10) => {
    loading.value = true;
    try {
      const res = await axios.get(`/api/rewards?page=${page}&limit=${limit}`);
      rewards.value = res.data.data || [];
      return res.data.pagination;
    } catch (e) { rewards.value = []; return null; }
    finally { loading.value = false; }
  };

  // ── Hộp Thư (Mailbox) ─────────────────────────────────────
  /** Lấy danh sách quà đang chờ trong hộp thư của user */
  const fetchMailbox = async () => {
    try {
      const res = await axios.get('/api/user-rewards/mailbox');
      mailbox.value = res.data.data || [];
    } catch (e) {
      console.error('fetchMailbox:', e);
      mailbox.value = [];
    }
  };

  /** User bấm nhận 1 món quà cụ thể từ hộp thư (theo userRewardId) */
  const claimFromMailbox = async (userRewardId: number) => {
    try {
      const res = await axios.post('/api/user-rewards/claim', { userRewardId });
      showSuccessToast(res.data.message || 'Nhận quà thành công!');
      // Refresh hộp thư, tủ đồ và tiền tệ sau khi nhận
      await Promise.all([fetchMailbox(), fetchInventoryBadges(), fetchUserCurrency()]);
      return res.data.data;
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || 'Lỗi khi nhận quà');
      throw e;
    }
  };

  // ── Inventory / Túi Đồ ────────────────────────────────────
  /** Lấy danh sách huy hiệu đang sở hữu trong túi đồ */
  const fetchInventoryBadges = async () => {
    try {
      const res = await axios.get('/api/inventory/badges');
      badges.value = res.data.data || [];
    } catch (e) { console.error('fetchInventoryBadges:', e); badges.value = []; }
  };

  /** Đeo huy hiệu được chọn */
  const equipBadge = async (rewardId: number) => {
    try {
      await axios.post('/api/inventory/equip', { rewardId });
      showSuccessToast('Đeo huy hiệu thành công!');
      await fetchInventoryBadges(); // Refresh túi đồ
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || 'Lỗi khi đeo huy hiệu');
      throw e;
    }
  };

  // ── Currency / Linh Thạch ─────────────────────────────────
  const fetchUserCurrency = async () => {
    try {
      const res = await axios.get('/api/currency/balance');
      userCurrency.value = res.data.data?.balance ?? 0;
    } catch (e) { console.error('fetchUserCurrency:', e); }
  };

  // ── (Legacy) Mua & Đổi từ catalog ─────────────────────────
  const fetchUserRewards = async (userId: number) => {
    try {
      const res = await axios.get(`/api/user-rewards/${userId}`);
      userRewards.value = res.data.data || [];
    } catch (e) { userRewards.value = []; }
  };

  /** Đổi quà từ catalog (milestone / cấp độ) — không qua hộp thư */
  const claimReward = async (rewardId: number, userId: number) => {
    try {
      await axios.post('/api/user-rewards/milestone', { reward_id: rewardId });
      showSuccessToast('Đổi phần thưởng thành công!');
      await Promise.all([fetchUserPoints(userId), fetchUserRewards(userId)]);
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || 'Lỗi khi đổi phần thưởng');
      throw e;
    }
  };

  const buyReward = async (rewardId: number, userId: number) => {
    try {
      await axios.post('/api/user-rewards/buy', { rewardId });
      showSuccessToast('Mua vật phẩm thành công!');
      await Promise.all([fetchUserCurrency(), fetchUserRewards(userId)]);
    } catch (e: any) {
      showErrorToast(e.response?.data?.message || 'Lỗi khi mua vật phẩm');
      throw e;
    }
  };

  const levelProgress = computed(() => {
    if (!userPoints.value || !currentLevel.value) return 0;
    const current = userPoints.value.total_exp || 0;
    const next    = currentLevel.value.next_level_points || 1000;
    return Math.min(Math.max((current / next) * 100, 0), 100);
  });

  return {
    // State
    userPoints, currentLevel, tasks, rewards,
    userRewards, mailbox, badges, userCurrency, loading,
    levelProgress,
    // Points & Level
    fetchUserPoints, fetchCurrentLevel,
    // Tasks
    fetchTasks, completeTask,
    // Catalog rewards
    fetchRewards, fetchUserRewards, claimReward, buyReward,
    // Hộp thư
    fetchMailbox, claimFromMailbox,
    // Túi đồ
    fetchInventoryBadges, equipBadge,
    // Currency
    fetchUserCurrency,
  };
}


