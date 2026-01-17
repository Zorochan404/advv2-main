import ParkingCard from "@/components/layout/ParkingCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Parking } from "@/services/parking.service";
import { router } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface ParkingSectionProps {
    data: Parking[];
    loading: boolean;
    error: string | null;
}

const ParkingSection: React.FC<ParkingSectionProps> = ({ data, loading, error }) => {
    if (loading) {
        return (
            <View className="my-4">
                <View className="px-5 mb-2">
                    <Skeleton className="h-6 w-40 rounded" />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5">
                    {[1, 2, 3].map((i) => (
                        <View key={i} className="mr-5">
                            <Skeleton className="h-48 w-80 rounded-xl" />
                        </View>
                    ))}
                </ScrollView>
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

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <View className="my-4">
            <View className="flex-row justify-between items-center px-5 mb-2">
                <Text className="text-white text-lg font-bold">Popular Parkings</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {data.map((parking) => (
                    <TouchableOpacity
                        key={parking.id}
                        activeOpacity={0.9}
                        onPress={() => {
                            try {
                                router.push({
                                    pathname: "/parking/[id]" as any,
                                    params: {
                                        id: parking.id,
                                        carName: parking.name,
                                        location: `${parking.city}, ${parking.state}`,
                                        images: parking.mainimg,
                                    },
                                });
                            } catch (error) {
                                console.error("Navigation error:", error);
                                Alert.alert("Navigation Error", "Unable to navigate to parking details");
                            }
                        }}
                    >
                        <ParkingCard
                            image={{ uri: parking.mainimg }}
                            name={parking.name}
                            location={`${parking.city}, ${parking.state}`}
                            totalCars={parking.capacity}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default ParkingSection;
