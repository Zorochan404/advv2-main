import CarCard from "@/components/layout/CarCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Car } from "@/services/car.service";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CarsSectionProps {
    cars: Car[];
    loading: boolean;
    error: string | null;
}

const CarsSection: React.FC<CarsSectionProps> = ({ cars, loading, error }) => {

    console.log(cars.map((car) => car.images));

    if (loading) {
        return (
            <View className="my-4 px-5">
                <View className="mb-2">
                    <Skeleton className="h-6 w-40 rounded" />
                </View>
                {[1, 2].map((i) => (
                    <View key={i} className="mb-4">
                        <Skeleton className="h-60 w-full rounded-xl" />
                    </View>
                ))}
            </View>
        );
    }

    if (error) {
        return (
            <View className="my-4 px-5">
                <Text className="text-red-500">{error}</Text>
            </View>
        );
    }

    if (!cars || cars.length === 0) {
        return (
            <View className="my-4 px-5 items-center">
                <Text className="text-gray-500">No cars available nearby</Text>
            </View>
        );
    }

    return (
        <View className="mb-20">
            <View className="px-5 pb-2">
                <Text className="text-white text-lg font-bold">Featured Cars</Text>
            </View>
            {cars.map((car) => (
                <TouchableOpacity
                    key={car.id}
                    activeOpacity={0.9}
                    onPress={() =>
                        router.push({
                            pathname: "/carDetails/[id]",
                            params: {
                                id: car.id,
                            },
                        })
                    }
                >
                    <CarCard
                        id={car.id.toString()}
                        images={car.images}
                        carName={car.name}
                        maker={car.maker}
                        price={car.price}
                        discountprice={car.discountprice}
                        priceLabel="hour"
                        seats={car.seats}
                        transmission={car.transmission}
                        fuel={car.fuel}
                        parkingName={car.parkingName}
                        parkingLocation={car.parkingLocation}
                        parkingCity={car.parkingCity}
                        parkingDistance={car.parkingDistance}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default CarsSection;
