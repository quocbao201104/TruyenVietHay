import axios from "@/utils/axios";

import { type Story } from "@/modules/storyText/story.service";
export type { Story };

export const getTopRatedStories = async (limit = 50): Promise<Story[]> => {
    const response = await axios.get("/api/ratings/top", {
        params: { limit }
    });
    return response.data.data;
};
