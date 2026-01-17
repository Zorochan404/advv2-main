import { Car, carService } from "@/services/car.service";
import { Parking } from "@/services/parking.service";
import { useCallback, useEffect, useState } from "react";

export const useCarDetails = (id: string | number) => {
    const [car, setCar] = useState<Car | null>(null);
    const [parking, setParking] = useState<Parking | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [avgRating, setAvgRating] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCarDetails = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);
        try {
            const response = await carService.getCarById(id);

            if (response.success && response.data) {
                setCar(response.data.car);
                if (response.data.parking && response.data.parking.length > 0) {
                    setParking(response.data.parking[0]);
                }
                setReviews(response.data.reviews || []);
                setAvgRating(response.data.avgRating || 0);
            } else {
                setError(response.message || "Failed to fetch car details");
            }
        } catch (err) {
            console.error("Error fetching car details:", err);
            setError("Failed to load car details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCarDetails();
    }, [fetchCarDetails]);

    return { car, parking, reviews, avgRating, loading, error, refetch: fetchCarDetails };
};
