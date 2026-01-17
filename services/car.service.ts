import { apiClient } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";
import { Parking } from "./parking.service";

export interface Car {
    id: number;
    name: string;
    description: string;
    number: string;
    color: string;
    model: string;
    maker: string;
    images: string[];
    rcnumber: string;
    rcimg: string;
    pollutionimg: string;
    insuranceimg: string;
    price: string;
    discountprice: string;
    fineperhour: string;
    extensionperhour: string;
    category: string;
    fuel: "Petrol" | "Diesel" | "Electric" | "Hybrid";
    transmission: string;
    seats: number;
    year: number;
    status: string;
    parkingName: string;
    parkingLocation: string;
    parkingCity: string;
    parkingDistance?: number;
    customerReviews?: string[];
    lat?: number;
    lng?: number;
    insuranceamount: string;
}

export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

export interface CarResponse {
    data: Car[];
    pagination: Pagination;
}

export interface CarDetailData {
    car: Car;
    reviews: any[]; // Define specific review type if available
    parking: Parking[];
    avgRating: number;
    reviewsWithUsers: any[];
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    statusCode: number;
}

export const carService = {
    getNearestAvailableCars: async (payload: {
        lat: number;
        lng: number;
        radius?: number;
        startDate?: string;
        endDate?: string;
        startTime?: string;
        endTime?: string;
        limit?: number;
        page?: number;
    }) => {
        const response = await apiClient.post<ApiResponse<CarResponse>>(ENDPOINTS.CARS.NEAREST_AVAILABLE, {
            radius: 5000,
            limit: 10,
            page: 1,
            ...payload,
        });
        return response.data;
    },

    getCarById: async (id: number | string) => {
        const response = await apiClient.get<ApiResponse<CarDetailData>>('/cars/getcar/' + id);
        console.log(response.data);
        return response.data;
    }
};
