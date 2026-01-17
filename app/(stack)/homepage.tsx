import Ad from "@/components/home/ad";
import Header from "@/components/home/Header";
import { useNearbyCars } from "@/hooks/useNearbyCars";
import { Parking, parkingService } from "@/services/parking.service";
import { useCoordinatesStore } from "@/store/location";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CarsSection from "../../components/home/CarsSection";
import ParkingSection from "../../components/home/ParkingSection";
import useHomeStore from "../../store/homeStore";

export default function HomeScreen() {
    const homeStore = useHomeStore();
    const categories = (homeStore as any).categories;
    const fetchData = (homeStore as any).fetchData;
    const loading = (homeStore as any).loading;
    const ads = (homeStore as any).ads;
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Cars State
    const { cars, loading: carsLoading, error: carsError, refetch: refetchCars } = useNearbyCars();

    // Parking State
    const { coordinates, fetchCoordinates } = useCoordinatesStore();
    const [parkingData, setParkingData] = useState<Parking[]>([]);
    const [parkingLoading, setParkingLoading] = useState(false);
    const [parkingError, setParkingError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
        // Ensure we have coordinates for parking
        if (!coordinates) {
            fetchCoordinates();
        }
    }, [fetchData, coordinates, fetchCoordinates]);

    const fetchParking = async () => {
        if (!coordinates) return;

        setParkingLoading(true);
        setParkingError(null);
        try {
            const response = await parkingService.getNearbyParking({
                lat: coordinates.lat,
                lng: coordinates.lon,
            });

            if (response.success && response.data?.data) {
                setParkingData(response.data.data);
            } else {
                setParkingData([]);
            }
        } catch (err) {
            console.error("Error fetching parking:", err);
            setParkingError("Failed to load nearby parking");
        } finally {
            setParkingLoading(false);
        }
    };

    useEffect(() => {
        if (coordinates) {
            fetchParking();
        }
    }, [coordinates]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            fetchData(),
            fetchParking(),
            refetchCars()
        ]);
        setRefreshing(false);
    };

    const handleFilterSubmit = (filters: any) => {
        const { selectedCategory, ...apiFilters } = filters;
        setSelectedCategory(selectedCategory);
        console.log("apiFilters", apiFilters);
        refetchCars(apiFilters);
    };

    const visibleCars = cars.filter(car =>
        !selectedCategory ||
        selectedCategory === 'All' ||
        car.category?.toLowerCase() === selectedCategory.toLowerCase()
    );

    return (
        <View className="flex-1 bg-background">
            <SafeAreaView edges={['top']}>
                <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                    <Header categories={categories} loading={loading} onSubmit={handleFilterSubmit} />
                    <Ad ads={ads} loading={loading} />
                    <ParkingSection data={parkingData} loading={parkingLoading} error={parkingError} />
                    <CarsSection cars={visibleCars} loading={carsLoading} error={carsError} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}