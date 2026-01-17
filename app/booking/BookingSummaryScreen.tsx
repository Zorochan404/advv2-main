import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { ArrowDown, Calendar, MapPin, User } from "lucide-react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { bookingService, BookingSummaryData, Voucher } from "../../services/booking.service";

export default function BookingSummaryScreen() {
    const navigation = useNavigation<any>();
    const params = useLocalSearchParams();
    const [isPaymentSummaryExpanded, setIsPaymentSummaryExpanded] = useState(true);
    const [isVoucherExpanded, setIsVoucherExpanded] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingSummary, setBookingSummary] = useState<BookingSummaryData | null>(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    // Parse car details from params
    // Assuming carId or id is passed in params. Check if 'id' or 'carId' is the correct param name.
    // Based on convention, it's likely 'id' if passing from a detail screen or 'carId'. 
    // We will use params.id or params.carId.
    const carId = (params.id || params.carId) as string;
    const carName = params.carName as string;
    // price, seats, etc. might still be useful for initial display or fallback, 
    // but we should rely on API for costs if possible.
    const price = params.price as string;
    const seats = params.seats as string;
    const transmission = params.transmission as string;
    const fuel = params.fuel as string;
    const images = params.images ? JSON.parse(params.images as string) : [];
    const startDate = params.startDate as string;
    const endDate = params.endDate as string;
    const startTime = params.startTime as string;
    const endTime = params.endTime as string;

    // Use booking summary data if available, otherwise fallback/loading
    const paymentSummary = bookingSummary?.paymentSummary;
    const vouchers = bookingSummary?.vouchers || [];

    // Managed costs from API
    const totalPayment = paymentSummary?.totalPayment || 0;
    const discount = paymentSummary?.discount || 0;
    const finalTotal = paymentSummary?.totalPayment || 0;
    const toBePaidNow = paymentSummary?.toBePaidNow || 0;
    const toBePaidAtPickup = paymentSummary?.toBePaidAtPickup || 0;
    const basePrice = paymentSummary?.rentalCost || 0;
    const insurance = paymentSummary?.insurance || 0;

    // Use API values directly. The API returns updated values when a coupon is applied.
    // No local recalculation needed.

    const handleApplyCoupon = async (voucher: Voucher) => {
        // If already selected, maybe unselect? 
        // For now, let's assume we just apply the new one.
        // Or if clicking the same one, toggle off?
        const isSame = selectedVoucher?.id === voucher.id;

        if (isSame) {
            // Logic to remove coupon if needed, but API for removal wasn't specified.
            // Just reset to original summary if we unselect?
            // For now, let's just allow applying new ones or re-applying.
            // If toggle off, we might need to re-fetch summary or keep original summary stored.
            setSelectedVoucher(null);
            // Ideally we should revert payment summary to original.
            // But simpler approach: just re-fetch summary?
            fetchSummary();
            return;
        }

        try {
            setLoading(true);
            setApplyingCoupon(true);
            const response = await bookingService.applyCoupon(carId, {
                startDate,
                endDate,
                startTime,
                endTime,
                couponCode: voucher.code
            });

            if (response.success) {
                setBookingSummary(prev => prev ? {
                    ...prev,
                    paymentSummary: response.data.paymentSummary
                } : null);

                // We can store the voucher object or the response structure 
                // The response "appliedCoupon" is { code: "...", discountAmount: 100 }
                // We'll store the full voucher object to keep ID reference for UI selection state
                setSelectedVoucher(voucher);
                Alert.alert("Success", response.message);
            } else {
                Alert.alert("Error", response.message || "Failed to apply coupon");
            }
        } catch (error: any) {
            console.error("Apply coupon error:", error);
            Alert.alert("Error", error.response?.data?.message || "Failed to apply coupon");
        } finally {
            setApplyingCoupon(false);
            setLoading(false);
        }
    };

    // Moved fetchSummary outside useEffect to reuse it
    const fetchSummary = async () => {
        if (!carId || !startDate || !endDate) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await bookingService.getBookingSummary(carId, {
                startDate,
                endDate,
                startTime,
                endTime
            });
            if (data && data.success) {
                setBookingSummary(data.data);
                setSelectedVoucher(null); // Reset voucher on fresh fetch
            } else {
                Alert.alert("Error", "Failed to load booking summary");
            }
        } catch (error) {
            console.error("Booking summary error:", error);
            Alert.alert("Error", "Something went wrong fetching booking summary");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [carId, startDate, endDate, startTime, endTime]);


    const handlePayNow = async () => {
        try {
            setLoading(true);

            const response = await bookingService.createBooking({
                carId: parseInt(carId),
                startDate,
                endDate,
                startTime,
                endTime,
                couponCode: selectedVoucher?.code
            });

            if (response.success) {
                Alert.alert("Success", "Your booking has been confirmed!", [
                    { text: "OK", onPress: () => router.navigate("/(tabs)") }
                ]);
            } else {
                Alert.alert("Error", response.message || "Failed to create booking");
            }
        } catch (error: any) {
            console.error("Create booking error:", error);
            Alert.alert("Error", error.response?.data?.message || "Failed to create booking");
        } finally {
            setLoading(false);
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            title: "Booking Summary",
        });
    }, [navigation]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#F97316" />
                <Text className="mt-4 text-gray-500">Loading summary...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 ">
            <ScrollView className="flex-1 px-4 py-4 ">
                {/* Order Summary Section */}
                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Car Details */}
                        <View className="space-y-2">
                            <View className="flex-row items-center my-1">
                                <User size={16} color="#6B7280" style={{ marginRight: 8 }} />
                                <Text className="text-gray-400">Car Model:</Text>
                                <Text className="ml-2 font-medium text-gray-400">{carName}</Text>
                            </View>

                            <View className="flex-row items-center my-1">
                                <MapPin size={16} color="#6B7280" style={{ marginRight: 8 }} />
                                <Text className="text-gray-400">Pickup Location:</Text>
                                <Text className="ml-2 font-medium text-gray-400">Downtown Office</Text>
                            </View>

                            <View className="flex-row items-center my-1">
                                <MapPin size={16} color="#6B7280" style={{ marginRight: 8 }} />
                                <Text className="text-gray-400">Return Location:</Text>
                                <Text className="ml-2 font-medium text-gray-400">Same Location</Text>
                            </View>

                            <View className="flex-row items-center my-1">
                                <Calendar size={16} color="#6B7280" style={{ marginRight: 8 }} />
                                <Text className="text-gray-400">Start Date:</Text>
                                <Text className="ml-2 font-medium text-gray-400">{startDate}</Text>
                            </View>

                            <View className="flex-row items-center my-1">
                                <Calendar size={16} color="#6B7280" style={{ marginRight: 8 }} />
                                <Text className="text-gray-400">Start Time:</Text>
                                <Text className="ml-2 font-medium text-gray-400">{startTime}</Text>
                            </View>

                            <View className="flex-row items-center my-1">
                                <Calendar size={16} color="#6B7280" style={{ marginRight: 8 }} />
                                <Text className="text-gray-400">End Date:</Text>
                                <Text className="ml-2 font-medium text-gray-400">{endDate}</Text>
                            </View>
                            <View className="flex-row items-center my-1">
                                <Calendar size={16} color="#6B7280" style={{ marginRight: 8 }} />
                                <Text className="text-gray-400">End Time:</Text>
                                <Text className="ml-2 font-medium text-gray-400">{endTime}</Text>
                            </View>

                            <View className="flex-row items-center my-1">
                                <Text className="text-gray-400">Seats:</Text>
                                <Text className="ml-2 font-medium text-gray-400">{seats}</Text>
                            </View>

                            <View className="flex-row items-center my-1">
                                <Text className="text-gray-400">Transmission:</Text>
                                <Text className="ml-2 font-medium text-gray-400">{transmission}</Text>
                            </View>

                            <View className="flex-row items-center my-1">
                                <Text className="text-gray-400">Fuel Type:</Text>
                                <Text className="ml-2 font-medium text-gray-400">{fuel}</Text>
                            </View>

                            <View className="flex-row items-center my-1">
                                <Text className="text-gray-400">Base Price:</Text>
                                <Text className="ml-2 font-medium text-gray-400">₹{basePrice.toFixed(2)}</Text>
                            </View>
                        </View>
                    </CardContent>
                </Card>

                {/* Payment Summary Section */}
                <Card className="mb-4">
                    <TouchableOpacity
                        onPress={() => setIsPaymentSummaryExpanded(!isPaymentSummaryExpanded)}
                        className="flex-row items-center justify-between p-4"
                    >
                        <CardTitle className="text-lg font-bold px-2">Payment Summary</CardTitle>
                        <ArrowDown
                            size={20}
                            color="#6B7280"
                            style={{ transform: [{ rotate: isPaymentSummaryExpanded ? '180deg' : '0deg' }] }}
                        />
                    </TouchableOpacity>

                    {isPaymentSummaryExpanded && (
                        <CardContent>
                            <View className="space-y-2">
                                <View className="flex-row justify-between my-1">
                                    <Text className="text-gray-400">Rental Cost</Text>
                                    <Text className="text-gray-400">₹{basePrice.toFixed(2)}</Text>
                                </View>
                                <View className="flex-row justify-between my-1">
                                    <Text className="text-gray-400">Insurance</Text>
                                    <Text className="text-gray-400">₹{insurance.toFixed(2)}</Text>
                                </View>

                                <View className="flex-row justify-between my-1">
                                    <Text className="text-gray-400">Discount</Text>
                                    <Text className="text-gray-400">₹{discount.toFixed(2)}</Text>
                                </View>
                                <View className="flex-row justify-between my-1">
                                    <Text className=" text-sm text-gray-400">To be paid now</Text>
                                    <Text className="font-bold text-sm text-gray-400">₹{toBePaidNow.toFixed(2)}</Text>
                                </View>
                                <View className="flex-row justify-between my-1">
                                    <Text className=" text-sm text-gray-400">To be paid at the time of pickup</Text>
                                    <Text className="font-bold text-sm text-gray-400">₹{toBePaidAtPickup.toFixed(2)}</Text>
                                </View>
                                <View className="border-t border-gray-200 pt-2 mt-2">
                                    <View className="flex-row justify-between my-1">
                                        <Text className="font-bold text-lg text-gray-400">Total Payment</Text>
                                        <Text className="font-bold text-lg text-gray-400">₹{finalTotal.toFixed(2)}</Text>
                                    </View>

                                </View>
                            </View>
                        </CardContent>
                    )}
                </Card>

                {/* Vouchers Section */}
                <Card className="mb-4">
                    <TouchableOpacity
                        onPress={() => setIsVoucherExpanded?.(prev => !prev)}
                        className="p-4 flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center px-2">
                            <Text className="text-lg font-bold text-white">Vouchers</Text>
                        </View>
                        <ArrowDown
                            size={20}
                            color="#6B7280"
                            style={{ transform: [{ rotate: isVoucherExpanded ? '180deg' : '0deg' }] }}
                        />
                    </TouchableOpacity>
                    {isVoucherExpanded && (
                        <CardContent>
                            {vouchers.length === 0 ? (
                                <Text className="text-gray-400 p-2">No vouchers available.</Text>
                            ) : (
                                vouchers.map((voucher) => (
                                    <View key={voucher.id} className="flex-row items-center justify-between mb-4 border-b border-gray-100 pb-2 last:border-0 last:mb-0 last:pb-0">
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                            <Text className="text-gray-400 font-medium">Voucher: <Text className="text-black my-1">{voucher.code}</Text></Text>
                                            <Text className="text-orange-500 font-bold my-1">₹{voucher.discountValue} Discount</Text>
                                            <Text className="text-xs text-gray-400">{voucher.description}</Text>
                                        </View>
                                        <TouchableOpacity
                                            className={`px-4 py-2 rounded-lg ${(selectedVoucher?.id === voucher.id) ? "bg-gray-400" : "bg-orange-500"}`}
                                            onPress={() => handleApplyCoupon(voucher)}
                                            disabled={applyingCoupon}
                                        >
                                            {applyingCoupon && (selectedVoucher?.id === voucher.id) ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Text className="text-white font-semibold">
                                                    {(selectedVoucher?.id === voucher.id) ? "Applied" : "Apply"}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </CardContent>
                    )}
                </Card>




            </ScrollView>

            {/* Bottom Action Bar */}
            <View className="bg-orange-500 px-4 py-4 absolute bottom-10 w-[90%] self-center rounded-2xl">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-white text-sm">Total Cost</Text>
                        <View className="flex-row items-center">
                            <Text className="text-white text-xl font-bold">₹{finalTotal.toFixed(2)}</Text>

                        </View>
                    </View>

                    <Button
                        className="bg-white rounded-lg justify-center items-center"
                        onPress={handlePayNow}
                    >
                        <Text className="text-orange-500 font-bold">Pay Now</Text>
                    </Button>
                </View>
            </View>
        </View>
    );
}