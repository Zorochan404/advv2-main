import { Car, carService } from "@/services/car.service";
import { useCoordinatesStore } from "@/store/location";
import { useCallback, useEffect, useState } from "react";

export interface FilterParams {
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    radius?: number;
}

export const useNearbyCars = (filters?: FilterParams) => {
    const { coordinates } = useCoordinatesStore();
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCars = useCallback(async (overrideFilters?: FilterParams) => {
        if (!coordinates) return;

        setLoading(true);
        setError(null);
        try {
            const currentFilters = overrideFilters || filters;
            const response = await carService.getNearestAvailableCars({
                lat: coordinates.lat,
                lng: coordinates.lon,
                ...currentFilters
            });

            if (response.success && response.data?.data) {
                setCars(response.data.data);
            } else {
                setCars([]);
            }
        } catch (err) {
            console.error("Error fetching cars:", err);
            setError("Failed to load nearby cars");
        } finally {
            setLoading(false);
        }
    }, [coordinates, filters]); // Re-create if coordinates or filters change, but filters change usually means we call fetchCars manually or effect triggers it

    useEffect(() => {
        if (coordinates) {
            fetchCars();
        }
    }, [coordinates, fetchCars]);

    return { cars, loading, error, refetch: fetchCars };
};
