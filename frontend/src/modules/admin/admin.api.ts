import axios from "@/utils/axios";

export interface AdminDashboardResponse {
  success: boolean;
  data: {
    overview: {
      total_views: number;
      total_novels: number;
      total_users: number;
    };
    top_stories: {
      id: number;
      ten_truyen: string;
      slug: string;
      luot_xem: number;
      tac_gia: string;
    }[];
    chart: {
      labels: string[];
      series: { name: string; data: number[] }[];
    };
  };
}

export const getAdminDashboard = async (): Promise<AdminDashboardResponse> => {
  const res = await axios.get<AdminDashboardResponse>("/api/admin/dashboard");
  return res.data;
};
