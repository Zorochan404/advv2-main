import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Booking, bookingService } from '@/services/booking.service'
import dayjs from 'dayjs'
import { router } from 'expo-router'
import { ArrowRight, MapPin } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

export const UorABooking = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await bookingService.getMyBookings();
                if (response.success && response.data?.groupedBookings?.active?.length > 0) {
                    setBookings(response.data.groupedBookings.active);
                } else if (response.success && response.data?.allBookings?.length > 0) {
                    setBookings(response.data.allBookings.filter(b => b.status === 'pending' || b.status === 'confirmed'));
                }
            } catch (error) {
                console.error("Failed to fetch bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (loading) {
        return (
            <View className="px-5 mt-6">
                <View className="flex-row justify-between items-center mb-4">
                    <Skeleton className="h-6 w-40" />
                </View>
                <View className="bg-black border border-gray-800 shadow-lg rounded-2xl p-4">
                    <Skeleton className="h-3 w-20 mb-3" />
                    <View className="flex-row items-center gap-4 py-1 mb-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-4" />
                        <Skeleton className="h-5 w-32" />
                    </View>
                    <View className="flex-row items-center gap-2 mt-1">
                        <Skeleton className="h-4 w-48" />
                    </View>
                </View>
            </View>
        )
    }

    if (bookings.length === 0) {
        // Empty state - no upcoming bookings
        return (
            <View className="items-center px-5 py-6">
                <Image
                    source={require("@/assets/images/booking.png")}
                    style={{ width: 250, height: 250 }}
                    resizeMode="contain"
                />
                <Text className="text-gray-300 text-center mt-4">
                    You have no upcoming trips.{"\n"}Plan your next journey today!
                </Text>

                <Button className="mt-4 bg-orange-500 rounded-lg px-6" onPress={() => router.navigate("/(tabs)")}>
                    <Text className="text-white font-medium">Book now</Text>
                </Button>
            </View>
        );
    }

    // Upcoming bookings list
    return (
        <View className="px-5 mt-6">
            <View className="flex-row justify-between items-center">
                <Text className="text-white font-semibold text-base">
                    Upcoming bookings ({bookings.length})
                </Text>
            </View>

            {bookings.map((booking) => (
                <TouchableOpacity key={booking.id} onPress={() => {
                    if (booking.status === 'active') {
                        router.push(`/activeBooking/${booking.id}` as any);
                    } else {
                        router.push(`/booking/${booking.id}` as any);
                    }
                }}>
                    <View className="bg-black border border-gray-800 shadow-lg rounded-2xl mt-4 p-4">
                        <Text className="text-gray-300 text-xs uppercase">{booking.status}</Text>
                        <View className="flex-row items-center gap-2 py-1">
                            <Text className="text-white font-semibold">
                                {dayjs(booking.startDate).format("DD MMM YYYY, HH:mm")}
                            </Text>
                            <ArrowRight size={16} color="white" />
                            <Text className="text-white font-semibold">
                                {dayjs(booking.endDate).format("DD MMM YYYY, HH:mm")}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-white text-sm">
                                Car · {booking.car?.name || "Unknown Car"}
                            </Text>
                            <View className="flex-row items-center gap-1">
                                <MapPin size={14} color="white" />
                                <Text className="text-gray-300 text-sm">
                                    {booking.pickupParking?.name || booking.pickupParking?.locality || "Location info unavailable"}
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}

