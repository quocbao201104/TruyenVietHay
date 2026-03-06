import axios from "@/utils/axios";

import { type Story } from "@/modules/storyText/story.service";
export type { Story };

export interface StoryResponse {
    data: Story[];
    pagination: any;
}

export const getTopViewStories = async (limit = 10): Promise<Story[]> => {
    const response = await axios.get<StoryResponse>("/api/truyen/public", {
        params: {
            sort_by: "luot_xem", // Views
            order: "DESC",
            limit
        }
    });
    return response.data.data;
};
