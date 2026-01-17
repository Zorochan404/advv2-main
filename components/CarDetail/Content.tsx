// components/CarContent.tsx
import { Fuel, Gauge, MapPin, Users } from "lucide-react-native";
import { Text, View } from "react-native";
//@ts-ignore
import Map from "./Map";
import Review from "./Review";

interface CarContentProps {
  carName: string;
  seats: string | number;
  transmission: string;
  fuel: string;
  reviews: any[];
}

export default function CarContent({
  carName,
  seats,
  transmission,
  fuel,
  reviews,
}: CarContentProps) {
  return (
    <View className="p-5">
      {/* Car Name */}
      <Text className="text-2xl font-bold mb-1 text-white">{carName}</Text>

      {/* Location */}
      <View className="flex-row items-center gap-2">
        <MapPin color={"gray"} size={16} />
        <Text className="text-gray-500 text-sm">
          Rehabari Parking, Guwahati
        </Text>
      </View>

      {/* Description */}

      <View className="flex-row justify-between py-3">
        <View className="flex-row items-center gap-1">
          <Users size={18} color="#e5e7eb" />
          <Text className="text-sm text-white">{seats} Seats</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Gauge size={18} color="#e5e7eb" />
          <Text className="text-sm text-white">{transmission}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Fuel size={18} color="#e5e7eb" />
          <Text className="text-sm text-white">{fuel}</Text>
        </View>
      </View>
      <View className="w-full h-60 rounded-2xl my-2">
        <Map latitude={26.1733966} longitude={91.7471892} />
      </View>
      <View >
        <Review reviews={reviews}/>
      </View>
    </View>
  );
}
