import axios from "@/utils/axios";

export interface AuthorDashboardResponse {
  success: boolean;
  data: {
    totals: { total_views: number; total_comments: number };
    chart: {
      labels: string[];
      series: { name: string; data: number[] }[];
    };
  };
}

export const getAuthorDashboard = async (): Promise<AuthorDashboardResponse> => {
  const res = await axios.get<AuthorDashboardResponse>("/api/author/dashboard");
  return res.data;
};
