import { router } from 'expo-router'
import { ArrowRight, MapPin } from 'lucide-react-native'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const PastBooking = () => {
    return (
        <View className="px-5 mt-6">
            <View className="flex-row justify-between items-center">
                <Text className="text-white font-semibold text-base">
                    Past bookings
                </Text>

            </View>

            <TouchableOpacity onPress={() => router.navigate("/bookingScreen")}>
                <View className="bg-black border border-gray-800 shadow-lg rounded-2xl mt-4 p-4">
                    <Text className="text-gray-300 text-xs">Confirmed</Text>
                    <View className="flex-row items-center gap-2 py-1">
                        <Text className="text-white font-semibold">
                            22 Aug 2025, 16:20
                        </Text>
                        <ArrowRight size={16} color="white" />
                        <Text className="text-white font-semibold">
                            25 Aug 2025, 16:20
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Text className="text-white text-sm">
                            Car · Maruti Swift
                        </Text>
                        <View className="flex-row items-center gap-1">
                            <MapPin size={14} color="white" />
                            <Text className="text-gray-300 text-sm">Rehabari Parking, Guwahati</Text>
                        </View>

                    </View>

                </View>
            </TouchableOpacity>
        </View >
    )
}

export default PastBooking