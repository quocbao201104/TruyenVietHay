import axios from "@/utils/axios";

export interface Chapter {
  id: number;
  truyen_id: number;
  ten_chuong: string; // Keep for compatibility
  tieu_de: string; // Backend field name
  slug: string;
  noi_dung: string;
  so_chuong: number;
  created_at?: string;
  thoi_gian_dang?: string; // Backend field name
  truyen?: {
      id: number;
      ten_truyen: string;
      slug: string;
  };
  navigation?: {
      prev_slug: string | null;
      next_slug: string | null;
  };
  trang_thai?: string;
  ly_do_tu_choi?: string;
  luot_xem?: number;
}

export interface ChapterListResponse {
    chapters: Chapter[];
}

export const getChapterById = async (id: number): Promise<Chapter> => {
  const response = await axios.get<Chapter>(`/api/chuong/${id}`);
  return response.data;
};

export const getChapterBySlug = async (slug: string, storySlug: string): Promise<Chapter> => {
  const response = await axios.get<Chapter>(`/api/chuong/slug/${storySlug}/${slug}`);
  return response.data;
};

export const getChaptersByStoryId = async (storyId: number, page = 1, limit = 1000): Promise<ChapterListResponse> => {
  const response = await axios.get<ChapterListResponse>(`/api/chuong/truyen/${storyId}`, {
      params: { page, limit }
  });
  return response.data;
};

export const getAdminChaptersByStoryId = async (storyId: number, page = 1, limit = 1000): Promise<ChapterListResponse> => {
  const response = await axios.get<ChapterListResponse>(`/api/chuong/admin/truyen/${storyId}`, {
      params: { page, limit }
  });
  return response.data;
};

export const createChapter = async (data: any): Promise<Chapter> => {
  const response = await axios.post<Chapter>(`/api/chuong`, data);
  return response.data;
};

export const updateChapter = async (id: number, data: any): Promise<Chapter> => {
  const response = await axios.put<Chapter>(`/api/chuong/${id}`, data);
  return response.data;
};

export const deleteChapter = async (id: number): Promise<void> => {
  await axios.delete(`/api/chuong/${id}`);
};

export const approveOrRejectChapter = async (id: number, action: 'duyet' | 'tu_choi', reason?: string): Promise<any> => {
  const response = await axios.put(`/api/chuong/${id}/duyet-chuong`, { action, reason });
  return response.data;
};

export const approveAllChaptersByStoryId = async (storyId: number): Promise<any> => {
  const response = await axios.put(`/api/chuong/truyen/${storyId}/duyet-tat-ca`);
  return response.data;
};

export const incrementChapterView = async (chapterId: number): Promise<any> => {
  const response = await axios.post(`/api/chuong/${chapterId}/view`);
  return response.data;
};
