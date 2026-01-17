// components/CarContent.tsx
import { MapPin } from "lucide-react-native";
import { Text, View } from "react-native";
//@ts-ignore
import Map from "./Map";

interface CarContentProps {
  name: string;
  location: string;
}

export default function ParkingContent({
  name,
  location,
}: CarContentProps) {
  return (
    <View className="p-5">
      {/* Car Name */}
      <Text className="text-2xl font-bold mb-1 text-white">{name}</Text>

      {/* Location */}
      <View className="flex-row items-center gap-2">
        <MapPin color={"gray"} size={16} />
        <Text className="text-gray-500 text-sm">
          Rehabari Parking, Guwahati
        </Text>
      </View>

      {/* Description */}


      <View className="w-full h-60 rounded-2xl mt-4 ">
        <Map latitude={26.1733966} longitude={91.7471892} />
      </View>
      {/* <View >
        <Review />
      </View> */}
    </View>
  );
}
