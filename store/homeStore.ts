import { apiClient } from '@/services/api/client';
import { create } from 'zustand';

interface HomeState {
    categories: any[];
    ads: any[];
    loading: boolean;
    fetchData: () => Promise<void>;
}

const useHomeStore = create<HomeState>((set) => ({
    categories: [],
    ads: [],
    loading: false,
    fetchData: async () => {
        set({ loading: true });
        try {
            const response = await apiClient.get('/advertisements/active');
            set({ ads: response.data, loading: false });
        } catch (error) {
            console.error("Failed to fetch ads:", error);
            set({ loading: false });
        }
    },
}));

export default useHomeStore;
