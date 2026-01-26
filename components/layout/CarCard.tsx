import { Fuel, Gauge, MapPin, Users } from "lucide-react-native"; // icons
import React from "react";
import {
    Dimensions,
    Image,
    Text,
    View
} from "react-native";

const { width } = Dimensions.get("window");

interface CardProps {
    id: string;
    images: string[];
    carName: string;
    maker?: string;
    price: string;
    discountprice?: string;
    priceLabel?: string;
    popular?: boolean;
    seats: number;
    transmission: string;
    fuel: "Petrol" | "Diesel" | "Electric" | "Hybrid";
    parkingName?: string;
    parkingLocation?: string;
    parkingCity?: string;
    parkingDistance?: number;
}

const CarCard: React.FC<CardProps> = ({
    id,
    images,
    carName,
    maker,
    price,
    discountprice,
    priceLabel = "day",
    popular,
    seats,
    transmission,
    fuel,
    parkingName,
    parkingLocation,
    parkingCity,
    parkingDistance
}) => {
    return (
        <View className="rounded-xl shadow-md overflow-hidden w-[90%] self-center pb-3 mb-2 bg-card">
            {/* Image Carousel */}
            <View className="relative">
                <Image
                    source={{ uri: images[0] || 'https://via.placeholder.com/400x180' }}
                    style={{ width: width * 0.9, height: 180 }}
                    className="rounded-xl"
                    resizeMode="cover"
                />

                {/* Popular Tag */}
                {popular && (
                    <View className="absolute top-3 left-3 bg-orange-500 px-3 py-1 rounded-full shadow">
                        <Text className="text-xs font-semibold text-white">Popular</Text>
                    </View>
                )}
                {/* Distance Tag */}
                {parkingDistance !== undefined && (
                    <View className="absolute bottom-3 right-3 bg-black/60 px-3 py-1 rounded-full">
                        <Text className="text-xs font-semibold text-white">
                            {parkingDistance.toFixed(1)} km away
                        </Text>
                    </View>
                )}
            </View>

            {/* Content */}
            <View className="p-3">
                {/* Car Name + Price */}
                <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                        <Text className="text-lg font-semibold text-white" numberOfLines={1}>
                            {maker ? `${maker} ${carName}` : carName}
                        </Text>
                        {(parkingName || parkingCity) && (
                            <View className="flex-row items-center gap-1 mt-1">
                                <MapPin size={12} color="#9ca3af" />
                                <Text className="text-xs text-gray-400" numberOfLines={1}>
                                    {parkingName} {parkingCity ? `, ${parkingCity}` : ''}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="items-end">
                        <Text className="text-orange-500 font-bold text-lg">
                            ₹{discountprice || price}<Text className="text-sm font-normal">/{priceLabel}</Text>
                        </Text>
                        {discountprice && (
                            <Text className="text-xs text-gray-500 line-through">
                                ${price}
                            </Text>
                        )}
                    </View>
                </View> 

                {/* Car Specs */}
                <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-800">
                    <View className="flex-row items-center gap-1">
                        <Users size={16} color="#e5e7eb" />
                        <Text className="text-xs text-white">{seats} Seats</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <Gauge size={16} color="#e5e7eb" />
                        <Text className="text-xs text-white capitalize">{transmission}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <Fuel size={16} color="#e5e7eb" />
                        <Text className="text-xs text-white capitalize">{fuel}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default CarCard;
