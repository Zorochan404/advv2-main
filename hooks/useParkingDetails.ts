import { Car } from "@/services/car.service";
import { Parking, parkingService } from "@/services/parking.service";
import { useCallback, useEffect, useState } from "react";

export const useParkingDetails = (id: string | number) => {
    const [parking, setParking] = useState<Parking | null>(null);
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchParkingDetails = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);
        try {
            const response = await parkingService.getParkingById(id);

            if (response.success && response.data) {
                setParking(response.data.parking);
                setCars(response.data.cars);
            } else {
                setError(response.message || "Failed to fetch parking details");
            }
        } catch (err) {
            console.error("Error fetching parking details:", err);
            setError("Failed to load parking details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchParkingDetails();
    }, [fetchParkingDetails]);

    return { parking, cars, loading, error, refetch: fetchParkingDetails };
};
