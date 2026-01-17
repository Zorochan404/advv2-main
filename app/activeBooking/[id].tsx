import { BookingDetailResponse, bookingService } from '@/services/booking.service';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock, CreditCard, MapPin, Wrench, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [bookingDetail, setBookingDetail] = useState<BookingDetailResponse['data']['booking'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [carImages, setCarImages] = useState<string[]>([]);
    const [toolImages, setToolImages] = useState<string[]>([]);
    const [submittingImages, setSubmittingImages] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);

    // Extension State
    const [isExtensionModalVisible, setIsExtensionModalVisible] = useState(false);
    const [extensionType, setExtensionType] = useState<'half_day' | 'full_day' | 'custom'>('half_day');
    const [customExtensionDays, setCustomExtensionDays] = useState('1');
    const [extending, setExtending] = useState(false);

    const openImage = (url: string) => {
        setSelectedImage(url);
        setIsImageModalVisible(true);
    };

    const closeImage = () => {
        setIsImageModalVisible(false);
        setSelectedImage(null);
    };

    const openExtensionModal = () => {
        setIsExtensionModalVisible(true);
        setExtensionType('half_day');
    };

    const closeExtensionModal = () => {
        setIsExtensionModalVisible(false);
        setExtensionType('half_day');
        setCustomExtensionDays('1');
    };

    const extensionDetails = useMemo(() => {
        if (!bookingDetail?.car) return null;

        let hours = 0;
        let price = 0;

        if (extensionType === 'half_day') {
            hours = 12; // Assuming half day is 12 hours for calculation simplicity relative to price
            price = bookingDetail.car.halfdayprice || (bookingDetail.car.discountprice / 2) || (bookingDetail.car.price / 2);
        } else if (extensionType === 'full_day') {
            hours = 24;
            // Assuming full day price is ~2x half day or calculated via hourly if daily rate isn't explicit in this partial type
            // Based on car type usually having a daily rate, but here we only see halfdayprice/extensionperhour
            price = (bookingDetail.car.discountprice) || (bookingDetail.car.price);
        } else {
            const days = parseInt(customExtensionDays) || 0;
            hours = days * 24;
            // Use daily rate (halfdayprice * 2) or hourly rate * 24
            const dailyRate = (bookingDetail.car.discountprice) || (bookingDetail.car.price);
            price = days * dailyRate;
        }

        const newEndDate = dayjs(bookingDetail.endDate).add(hours, 'hour');

        return { hours, price, newEndDate };
    }, [bookingDetail, extensionType, customExtensionDays]);

    const handleExtendBooking = async () => {
        if (!extensionDetails || extensionDetails.hours <= 0) return;

        try {
            setExtending(true);
            const payload = {
                bookingId: bookingDetail!.id,
                extensionTime: extensionDetails.hours,
                paymentReferenceId: 'pay_test_' + Date.now() // Mock payment reference
            };

            const response = await bookingService.applyTopup(payload);

            if (response.success) {
                Alert.alert("Success", "Booking extended successfully!");
                closeExtensionModal();
                // Refresh details
                const detailRes = await bookingService.getBookingDetail(id as string);
                if (detailRes.success) setBookingDetail(detailRes.data.booking);
            } else {
                Alert.alert("Error", response.message || "Failed to extend booking");
            }
        } catch (error) {
            console.error("Extension error:", error);
            Alert.alert("Error", "Failed to extend booking. Please try again.");
        } finally {
            setExtending(false);
        }
    };


    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!id) return;
            try {
                const response = await bookingService.getBookingDetail(id as string);
                if (response.success) {
                    setBookingDetail(response.data.booking);
                    if (response.data.booking.carConditionImages?.length > 0) {
                        setCarImages(response.data.booking.carConditionImages);
                    }
                    if (response.data.booking.toolImages?.length > 0) {
                        setToolImages(response.data.booking.toolImages);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch booking details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetails();
    }, [id]);








    return (
        <SafeAreaView className="flex-1 bg-black">
            {/* Header */}
            <View className="flex-row items-center px-5 py-4 border-b border-gray-900">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-semibold flex-1">Booking Details</Text>
                <View className="bg-orange-500/20 px-3 py-1 rounded-full">
                    <Text className="text-orange-500 text-xs font-medium uppercase tracking-wider">
                        {bookingDetail?.statusSummary?.overallStatus}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Car Details Card */}
                <View className="px-5 mt-6">
                    <Text className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">Car Details</Text>
                    <View className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                        <View className="flex-row gap-4">
                            <Image
                                source={{ uri: bookingDetail?.car?.images[0] }}
                                className="w-24 h-24 rounded-lg bg-gray-800"
                                resizeMode="cover"
                            />
                            <View className="flex-1 justify-center">
                                <Text className="text-white text-lg font-bold mb-1">{bookingDetail?.car?.name}</Text>
                                <Text className="text-gray-400 text-sm mb-2">{bookingDetail?.car?.number}</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    <View className="bg-gray-800 px-2 py-1 rounded border border-gray-700">
                                        <Text className="text-gray-300 text-xs capitalize">{bookingDetail?.car?.color}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Trip Schedule */}
                <View className="px-5 mt-6">
                    <Text className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">Schedule</Text>
                    <View className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                        <View className="flex-row p-4 border-b border-gray-800 items-center">
                            <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                                <Calendar size={20} color="#3b82f6" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-xs mb-1">Start Date</Text>
                                <Text className="text-white font-semibold">
                                    {dayjs(bookingDetail?.startDate).format("DDD, MMM D, YYYY")}
                                </Text>
                                <Text className="text-gray-400 text-xs mt-0.5">
                                    {dayjs(bookingDetail?.startDate).format("h:mm A")}
                                </Text>
                            </View>
                        </View>
                        <View className="flex-row p-4 items-center">
                            <View className="w-10 h-10 rounded-full bg-orange-500/20 items-center justify-center mr-3">
                                <Calendar size={20} color="#f97316" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-xs mb-1">End Date</Text>
                                <Text className="text-white font-semibold">
                                    {dayjs(bookingDetail?.endDate).format("DDD, MMM D, YYYY")}
                                </Text>
                                <Text className="text-gray-400 text-xs mt-0.5">
                                    {dayjs(bookingDetail?.endDate).format("h:mm A")}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Locations */}
                <View className="px-5 mt-6">
                    {/* Extend Booking Button in Schedule Section */}
                    {bookingDetail?.status === 'active' && (
                        <TouchableOpacity
                            onPress={openExtensionModal}
                            className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex-row items-center justify-center mb-6"
                        >
                            <Clock size={16} color="#f97316" className="mr-2" />
                            <Text className="text-orange-500 font-medium">Extend Booking</Text>
                        </TouchableOpacity>
                    )}

                    <Text className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">Locations</Text>
                    <View className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                        <View className="flex-row gap-3 mb-4">
                            <MapPin size={20} color="#f97316" className="mt-1" />
                            <View>
                                <Text className="text-white font-medium mb-1">Pickup Location</Text>
                                <Text className="text-gray-400 text-sm leading-5">
                                    {bookingDetail?.pickupParking?.name || "N/A"}
                                </Text>
                                <Text className="text-gray-500 text-xs mt-1">
                                    {bookingDetail?.pickupParking?.city}, {bookingDetail?.pickupParking?.state}
                                </Text>
                            </View>
                        </View>
                        <View className="h-px bg-gray-800 my-2 ml-8" />
                        <View className="flex-row gap-3 mt-2">
                            <MapPin size={20} color="#3b82f6" className="mt-1" />
                            <View>
                                <Text className="text-white font-medium mb-1">Dropoff Location</Text>
                                <Text className="text-gray-400 text-sm leading-5">
                                    {bookingDetail?.dropoffParking?.name || "N/A"}
                                </Text>
                                <Text className="text-gray-500 text-xs mt-1">
                                    {bookingDetail?.dropoffParking?.city}, {bookingDetail?.dropoffParking?.state}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* OTP Section */}
                {bookingDetail?.otpCode && !bookingDetail?.otpVerified && (
                    <View className="px-5 mt-6">
                        <Text className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">OTP Verification</Text>
                        <View className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex-row items-center justify-between">
                            <View>
                                <Text className="text-orange-500 text-xs font-bold uppercase mb-1">Share with Parking Incharge</Text>
                                <Text className="text-white text-3xl font-bold tracking-widest">{bookingDetail?.otpCode}</Text>

                            </View>
                            <View className="w-12 h-12 bg-orange-500 rounded-full items-center justify-center shadow-lg shadow-orange-500/50">
                                <Text className="text-white font-bold text-xl">#</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Image Upload for Check-in */}
                <View className="px-5 mt-6">
                    <Text className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">Pickup Verification</Text>

                    {/* Car Condition Images */}
                    <View className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-4">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-white font-medium">Car Condition</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                            {bookingDetail?.carConditionImages?.map((uri, index) => (
                                <View key={index} className="relative mr-3">
                                    <Image source={{ uri }} className="w-24 h-24 rounded-lg" />
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Tools Present */}
                    <View className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                        <View className="mb-4">
                            <Text className="text-white font-medium mb-2 flex-row items-center gap-2">
                                <Wrench size={16} color="#9ca3af" /> Tools Checklist
                            </Text>
                            {bookingDetail?.tools && bookingDetail.tools.length > 0 ? (
                                <View className="flex-row flex-wrap gap-2">
                                    {bookingDetail.tools.map((tool, idx) => (
                                        <View key={idx} className="bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                                            <Text className="text-gray-300 text-xs">{tool}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text className="text-gray-500 text-sm italic">No tools listed for this car.</Text>
                            )}
                        </View>

                        <View className="flex-row justify-between items-center mb-3 pt-3 border-t border-gray-800">
                            <Text className="text-white font-medium">Tool Images</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                            {(
                                toolImages.map((uri, index) => (
                                    <View key={index} className="relative mr-3">
                                        <Image source={{ uri }} className="w-24 h-24 rounded-lg" />
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>

                {/* car documents   */}

                <View className="px-5 mt-6 mb-8">
                    <Text className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">Documents</Text>
                    <View className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-gray-400">Insurance</Text>
                            <TouchableOpacity onPress={() => bookingDetail?.car.insuranceimg && openImage(bookingDetail.car.insuranceimg)}>
                                {bookingDetail?.car.insuranceimg ? (
                                    <Image source={{ uri: bookingDetail.car.insuranceimg }} className="w-10 h-10 rounded bg-gray-800" resizeMode="cover" />
                                ) : (
                                    <Text className="text-gray-500 italic">N/A</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-gray-400">RC</Text>
                            <TouchableOpacity onPress={() => bookingDetail?.car.rcimg && openImage(bookingDetail.car.rcimg)}>
                                {bookingDetail?.car.rcimg ? (
                                    <Image source={{ uri: bookingDetail.car.rcimg }} className="w-10 h-10 rounded bg-gray-800" resizeMode="cover" />
                                ) : (
                                    <Text className="text-gray-500 italic">N/A</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-gray-400">Pollution</Text>
                            <TouchableOpacity onPress={() => bookingDetail?.car.pollutionimg && openImage(bookingDetail.car.pollutionimg)}>
                                {bookingDetail?.car.pollutionimg ? (
                                    <Image source={{ uri: bookingDetail.car.pollutionimg }} className="w-10 h-10 rounded bg-gray-800" resizeMode="cover" />
                                ) : (
                                    <Text className="text-gray-500 italic">N/A</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>


                {/* Payment Breakdown */}
                <View className="px-5 mt-6 mb-8">
                    <Text className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">Payment Summary</Text>
                    <View className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-400">Base Price</Text>
                            <Text className="text-white">₹{bookingDetail?.billingBreakdown?.basePrice}</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-400">Insurance & Fees</Text>
                            <Text className="text-white">₹{(bookingDetail?.billingBreakdown?.insuranceAmount || 0) + (bookingDetail?.billingBreakdown?.deliveryCharges || 0)} </Text>
                        </View>
                        {(bookingDetail?.billingBreakdown?.discountAmount || 0) > 0 && (
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-green-500">Discount</Text>
                                <Text className="text-green-500">-₹{bookingDetail?.billingBreakdown?.discountAmount}</Text>
                            </View>
                        )}
                        <View className="h-px bg-gray-800 my-3" />
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-white font-semibold">Total Amount</Text>
                            <Text className="text-white font-bold text-lg">₹{bookingDetail?.billingBreakdown?.totalPrice}</Text>
                        </View>
                        <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-800 border-dashed">
                            <Text className="text-orange-500">Paid Advance</Text>
                            <Text className="text-orange-500 font-medium">₹{bookingDetail?.billingBreakdown?.advanceAmount}</Text>
                        </View>
                        <View className="flex-row justify-between mt-1">
                            <Text className="text-gray-400">Remaining to Pay</Text>
                            <Text className="text-gray-300 font-medium">₹{bookingDetail?.billingBreakdown?.remainingAmount}</Text>
                        </View>
                    </View>
                </View>


            </ScrollView>

            {/* Full Screen Image Modal */}
            <Modal
                visible={isImageModalVisible}
                transparent={false}
                onRequestClose={closeImage}
                animationType="fade"
            >
                <SafeAreaView className="flex-1 bg-black">
                    <View className="flex-1 relative justify-center items-center">
                        <TouchableOpacity
                            onPress={closeImage}
                            className="absolute top-4 right-4 z-10 p-2 bg-gray-800 rounded-full"
                        >
                            <X size={24} color="white" />
                        </TouchableOpacity>
                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage }}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        )}
                    </View>
                </SafeAreaView>
            </Modal>

            {/* Extension Modal */}
            <Modal
                visible={isExtensionModalVisible}
                transparent={true}
                onRequestClose={closeExtensionModal}
                animationType="slide"
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-black rounded-t-3xl border-t border-gray-800 p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white text-xl font-bold">Extend Booking</Text>
                            <TouchableOpacity onPress={closeExtensionModal} className="bg-gray-800 p-2 rounded-full">
                                <X size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-400 text-sm mb-4">Choose duration to extend your trip</Text>

                        <View className="flex-row gap-3 mb-6">
                            <TouchableOpacity
                                onPress={() => setExtensionType('half_day')}
                                className={`flex-1 p-3 rounded-xl border ${extensionType === 'half_day' ? 'bg-orange-500 border-orange-500' : 'bg-gray-800 border-gray-700'}`}
                            >
                                <Text className={`text-center font-bold mb-1 ${extensionType === 'half_day' ? 'text-white' : 'text-gray-300'}`}>Half Day</Text>
                                <Text className={`text-center text-xs ${extensionType === 'half_day' ? 'text-white/80' : 'text-gray-500'}`}>12 Hours</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setExtensionType('full_day')}
                                className={`flex-1 p-3 rounded-xl border ${extensionType === 'full_day' ? 'bg-orange-500 border-orange-500' : 'bg-gray-800 border-gray-700'}`}
                            >
                                <Text className={`text-center font-bold mb-1 ${extensionType === 'full_day' ? 'text-white' : 'text-gray-300'}`}>Full Day</Text>
                                <Text className={`text-center text-xs ${extensionType === 'full_day' ? 'text-white/80' : 'text-gray-500'}`}>24 Hours</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setExtensionType('custom')}
                                className={`flex-1 p-3 rounded-xl border ${extensionType === 'custom' ? 'bg-orange-500 border-orange-500' : 'bg-gray-800 border-gray-700'}`}
                            >
                                <Text className={`text-center font-bold mb-1 ${extensionType === 'custom' ? 'text-white' : 'text-gray-300'}`}>Custom</Text>
                                <Text className={`text-center text-xs ${extensionType === 'custom' ? 'text-white/80' : 'text-gray-500'}`}>Days</Text>
                            </TouchableOpacity>
                        </View>

                        {extensionType === 'custom' && (
                            <View className="mb-6">
                                <Text className="text-gray-400 text-xs mb-2">Number of Days</Text>
                                <View className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 flex-row items-center">
                                    <Clock size={18} color="#9ca3af" className="mr-3" />
                                    <TextInput
                                        className="flex-1 text-white text-base"
                                        value={customExtensionDays}
                                        onChangeText={setCustomExtensionDays}
                                        keyboardType="numeric"
                                        placeholder="Enter days"
                                        placeholderTextColor="#6b7280"
                                    />
                                </View>
                            </View>
                        )}

                        <View className="bg-black/50 rounded-xl p-4 mb-6 border border-gray-800">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-400">New End Date</Text>
                                <Text className="text-white font-medium">
                                    {extensionDetails?.newEndDate.format("MMM D, HH:mm A")}
                                </Text>
                            </View>
                            <View className="flex-row justify-between pt-2 border-t border-gray-800">
                                <Text className="text-gray-400">Additional Cost</Text>
                                <Text className="text-orange-500 font-bold text-lg">₹{extensionDetails?.price}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleExtendBooking}
                            disabled={extending}
                            className={`bg-orange-500 rounded-xl py-4 flex-row justify-center items-center ${extending ? 'opacity-70' : ''}`}
                        >
                            {extending ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text className="text-white font-bold text-lg mr-2">Pay & Extend</Text>
                                    <CreditCard size={20} color="white" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}
