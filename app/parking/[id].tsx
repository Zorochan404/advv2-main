import CarCard from "@/components/layout/CarCard";
import ParkingContent from "@/components/parking/content";
import { useParkingDetails } from "@/hooks/useParkingDetails";
import { router, useLocalSearchParams } from "expo-router";
import { MoveLeft } from "lucide-react-native";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get("window");

export default function ParkingDetail() {
    const { id } = useLocalSearchParams();
    const { parking, cars, loading, error } = useParkingDetails(id as string);

    const availableCars = cars.filter((car) => car.status === "available");
    console.log("availableCars", availableCars);

    if (loading && !parking) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator size="large" color="#f97316" />
            </View>
        );
    }

    if (error && !parking) {
        return (
            <View className="flex-1 justify-center items-center bg-black px-5">
                <Text className="text-red-500 mb-4">{error}</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-orange-500 px-4 py-2 rounded-lg">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Fallback image if parking not loaded yet or no image
    const mainImage = parking?.mainimg || "https://via.placeholder.com/400x280";
    const parkingName = parking?.name || "Parking Details";
    const parkingLocation = parking?.locality ? `${parking.locality}, ${parking.city}` : parking?.city || "";

    return (
        <View className="flex-1 bg-background mb-14">
            <ScrollView>
                <View className="relative">
                    <Image
                        source={{ uri: mainImage }}
                        style={{ width: width, height: 280 }}
                        resizeMode="cover"
                        className="rounded-b-3xl"
                    />

                    <View className="absolute top-14 left-5 z-10 rounded-full bg-white/80 overflow-hidden p-2">
                        <TouchableOpacity onPress={() => router.back()}>
                            <MoveLeft color="black" size={20} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                <ParkingContent
                    name={parkingName}
                    location={parkingLocation}
                />

                {/* Available Cars */}
                <View className="mt-2">
                    <View className="px-5 pb-4">
                        <Text className="text-white text-lg font-bold">Available Cars ({availableCars.length})</Text>
                    </View>
                    {availableCars.length > 0 ? (
                        availableCars.map((car) => (
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
                                    key={car.id}
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
                        ))
                    ) : (
                        <View className="px-5 py-2">
                            <Text className="text-white text-lg font-bold">No available cars</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

