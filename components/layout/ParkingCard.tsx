import { MapPin } from "lucide-react-native";
import React from "react";
import { Image, Text, View } from "react-native";

interface ParkingCardProps {
  image: { uri: string };
  name: string;
  location: string;
  totalCars: number;
}

const ParkingCard: React.FC<ParkingCardProps> = ({
  image,
  name,
  location,
  totalCars,
}) => {
  return (
    <View className="rounded-xl border border-gray-800 bg-black shadow-lg ml-5 overflow-hidden w-80">
      {/* Image */}
      <View className="relative">
        <Image source={image} className="w-full h-36" resizeMode="cover" />
      </View>

      {/* Details */}
      <View className="p-3">
        <Text className="text-white font-bold text-base">{name}</Text>
        <View className="flex-row items-center gap-2">
          <MapPin size={16} color="#e5e7eb" />
          <Text className="text-gray-400 text-xs">{location}</Text>
        </View>


        {/* Prices */}
        <View className="flex-row items-center mt-2 gap-2">
          <Text className="text-white font-bold text-sm">Total cars:</Text>
          <Text className="text-white font-bold text-sm">{totalCars}</Text>
        </View>
      </View>
    </View>
  );
};

export default ParkingCard;
