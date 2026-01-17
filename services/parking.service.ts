import { apiClient } from "./api/client";
import { Car } from "./car.service";

export interface Parking {
    id: number;
    name: string;
    description?: string;
    lat: string | number;
    lng: string | number;
    address?: string;
    locality?: string;
    city: string;
    state: string;
    zip?: string;
    pincode?: number;
    country: string;
    capacity: number;
    hourly_rate?: string;
    monthly_rate?: string;
    is_active?: boolean;
    mainimg: string;
    images: string[];
    distance?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

export interface ParkingResponse {
    data: Parking[];
    pagination: Pagination;
}

export interface ParkingDetailData {
    parking: Parking;
    cars: Car[];
    totalCars: number;
    availableCars: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    statusCode: number;
}

export const parkingService = {
    getNearbyParking: async (params: {
        lat: number;
        lng: number;
        radius?: number;
        limit?: number;
        page?: number;
    }) => {
        const response = await apiClient.get<ApiResponse<ParkingResponse>>('/parking/nearby', {
            params: {
                radius: 500,
                limit: 10,
                page: 1,
                ...params,
            }
        });
        return response.data;
    },

    getParkingById: async (id: string | number) => {
        const response = await apiClient.get<ApiResponse<ParkingDetailData>>(`/parking/getbyid/${id}`);
        return response.data;
    }
};
