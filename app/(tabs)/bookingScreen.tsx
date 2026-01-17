import PastBooking from "@/components/ride/PastBooking";
import { UorABooking } from "@/components/ride/UorABooking";
import { RefreshCcw } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";


export default function BookingsScreen() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (

    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-16 pb-4">
        <Text className="text-white text-lg font-semibold">My bookings</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <RefreshCcw size={22} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Empty State */}
        <UorABooking key={`ua-${refreshKey}`} />

        {/* Past Bookings */}
        <PastBooking key={`pb-${refreshKey}`} />
      </ScrollView>


      {/* Bottom Navigation */}
    </View>

  );
}
