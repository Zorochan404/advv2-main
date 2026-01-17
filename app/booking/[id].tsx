import { BookingDetailResponse, bookingService } from '@/services/booking.service';
import { uploadToCloudinary } from '@/utils/cloudinary';
import dayjs from 'dayjs';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Camera, MapPin, Plus, Trash2, Wrench } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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

    const handleFinalPayment = async () => {
        if (!bookingDetail) return;

        Alert.alert(
            "Confirm Payment",
            `Are you sure you want to pay ₹${bookingDetail.billingBreakdown.remainingAmount}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Pay Now",
                    onPress: async () => {
                        setProcessingPayment(true);
                        try {
                            const payload = {
                                bookingId: bookingDetail.id,
                                paymentReferenceId: "pay_ref_sample_" + Date.now()
                            };
                            const response = await bookingService.makeFinalPayment(payload);
                            if (response.success || response.statusCode === 200) { // Check for success or 200 OK
                                Alert.alert("Success", "Final payment completed successfully!");
                                // Refresh booking details
                                const detailResponse = await bookingService.getBookingDetail(id as string);
                                if (detailResponse.success) {
                                    setBookingDetail(detailResponse.data.booking);
                                }
                            } else {
                                Alert.alert("Error", response.message || "Payment failed");
                            }
                        } catch (error) {
                            console.error("Payment error:", error);
                            Alert.alert("Error", "Failed to process payment");
                        } finally {
                            setProcessingPayment(false);
                        }
                    }
                }
            ]
        );
    };

    const pickImage = async (type: 'car' | 'tool') => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                if (type === 'car') {
                    setCarImages([...carImages, result.assets[0].uri]);
                } else {
                    setToolImages([...toolImages, result.assets[0].uri]);
                }
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to pick image");
        }
    };

    const removeImage = (type: 'car' | 'tool', index: number) => {
        if (type === 'car') {
            setCarImages(carImages.filter((_, i) => i !== index));
        } else {
            setToolImages(toolImages.filter((_, i) => i !== index));
        }
    };

    const handleSubmitImages = async () => {
        if (carImages.length === 0 && toolImages.length === 0) {
            Alert.alert("No Images", "Please select at least one image to upload.");
            return;
        }

        setSubmittingImages(true);
        try {
            // Upload images to Cloudinary
            const uploadPromises = [
                ...carImages.map(img => uploadToCloudinary(img)),
                ...toolImages.map(img => uploadToCloudinary(img))
            ];

            const uploadedUrls = await Promise.all(uploadPromises);

            const uploadedCarImages = uploadedUrls.slice(0, carImages.length);
            const uploadedToolImages = uploadedUrls.slice(carImages.length);

            const payload = {
                carConditionImages: uploadedCarImages.length > 0 ? uploadedCarImages : undefined,
                toolImages: uploadedToolImages.length > 0 ? uploadedToolImages : undefined
            };

            const response = await bookingService.uploadBookingImages(id as string, payload);

            Alert.alert("Success", "Images uploaded successfully!");
            // setCarImages([]);
            // setToolImages([]);

            // Allow some time for backend to process if needed, then refresh could happen here
            // Ideally refetch booking details or just reset local state
        } catch (error) {
            console.error("Error uploading images:", error);
            Alert.alert("Error", "Failed to upload images. Please try again.");
        } finally {
            setSubmittingImages(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#f97316" />
                <Text className="text-white mt-4">Loading booking details...</Text>
            </SafeAreaView>
        );
    }

    if (!bookingDetail) {
        return (
            <SafeAreaView className="flex-1 bg-black items-center justify-center">
                <Text className="text-white">Booking not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-orange-500 px-4 py-2 rounded-lg">
                    <Text className="text-white font-medium">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const { car, statusSummary, billingBreakdown } = bookingDetail;

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
                        {statusSummary.overallStatus}
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
                                source={{ uri: car.images[0] }}
                                className="w-24 h-24 rounded-lg bg-gray-800"
                                resizeMode="cover"
                            />
                            <View className="flex-1 justify-center">
                                <Text className="text-white text-lg font-bold mb-1">{car.name}</Text>
                                <Text className="text-gray-400 text-sm mb-2">{car.number}</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    <View className="bg-gray-800 px-2 py-1 rounded border border-gray-700">
                                        <Text className="text-gray-300 text-xs capitalize">{car.color}</Text>
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
                                    {dayjs(bookingDetail.startDate).format("DDD, MMM D, YYYY")}
                                </Text>
                                <Text className="text-gray-400 text-xs mt-0.5">
                                    {dayjs(bookingDetail.startDate).format("h:mm A")}
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
                                    {dayjs(bookingDetail.endDate).format("DDD, MMM D, YYYY")}
                                </Text>
                                <Text className="text-gray-400 text-xs mt-0.5">
                                    {dayjs(bookingDetail.endDate).format("h:mm A")}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Locations */}
                <View className="px-5 mt-6">
                    <Text className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">Locations</Text>
                    <View className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                        <View className="flex-row gap-3 mb-4">
                            <MapPin size={20} color="#f97316" className="mt-1" />
                            <View>
                                <Text className="text-white font-medium mb-1">Pickup Location</Text>
                                <Text className="text-gray-400 text-sm leading-5">
                                    {bookingDetail.pickupParking?.name || "N/A"}
                                </Text>
                                <Text className="text-gray-500 text-xs mt-1">
                                    {bookingDetail.pickupParking?.city}, {bookingDetail.pickupParking?.state}
                                </Text>
                            </View>
                        </View>
                        <View className="h-px bg-gray-800 my-2 ml-8" />
                        <View className="flex-row gap-3 mt-2">
                            <MapPin size={20} color="#3b82f6" className="mt-1" />
                            <View>
                                <Text className="text-white font-medium mb-1">Dropoff Location</Text>
                                <Text className="text-gray-400 text-sm leading-5">
                                    {bookingDetail.dropoffParking?.name || "N/A"}
                                </Text>
                                <Text className="text-gray-500 text-xs mt-1">
                                    {bookingDetail.dropoffParking?.city}, {bookingDetail.dropoffParking?.state}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* OTP Section */}
                {bookingDetail.otpCode && !bookingDetail.otpVerified && (
                    <View className="px-5 mt-6">
                        <Text className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">OTP Verification</Text>
                        <View className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex-row items-center justify-between">
                            <View>
                                <Text className="text-orange-500 text-xs font-bold uppercase mb-1">Share with Parking Incharge</Text>
                                <Text className="text-white text-3xl font-bold tracking-widest">{bookingDetail.otpCode}</Text>

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
                            <TouchableOpacity onPress={() => pickImage('car')} className="bg-orange-500/10 p-2 rounded-full">
                                <Plus size={20} color="#f97316" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                            {carImages.length === 0 ? (
                                <View className="w-24 h-24 bg-gray-800 rounded-lg items-center justify-center border border-dashed border-gray-600">
                                    <Camera size={24} color="#6b7280" />
                                    <Text className="text-gray-500 text-xs mt-1">Add Photo</Text>
                                </View>
                            ) : (
                                carImages.map((uri, index) => (
                                    <View key={index} className="relative mr-3">
                                        <Image source={{ uri }} className="w-24 h-24 rounded-lg" />
                                        <TouchableOpacity
                                            onPress={() => removeImage('car', index)}
                                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                                        >
                                            <Trash2 size={12} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </View>

                    {/* Tools Present */}
                    <View className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                        <View className="mb-4">
                            <Text className="text-white font-medium mb-2 flex-row items-center gap-2">
                                <Wrench size={16} color="#9ca3af" /> Tools Checklist
                            </Text>
                            {bookingDetail.tools && bookingDetail.tools.length > 0 ? (
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
                            <TouchableOpacity onPress={() => pickImage('tool')} className="bg-orange-500/10 p-2 rounded-full">
                                <Plus size={20} color="#f97316" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                            {toolImages.length === 0 ? (
                                <View className="w-24 h-24 bg-gray-800 rounded-lg items-center justify-center border border-dashed border-gray-600">
                                    <Camera size={24} color="#6b7280" />
                                    <Text className="text-gray-500 text-xs mt-1">Add Photo</Text>
                                </View>
                            ) : (
                                toolImages.map((uri, index) => (
                                    <View key={index} className="relative mr-3">
                                        <Image source={{ uri }} className="w-24 h-24 rounded-lg" />
                                        <TouchableOpacity
                                            onPress={() => removeImage('tool', index)}
                                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                                        >
                                            <Trash2 size={12} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </ScrollView>

                        {(carImages.length > 0 || toolImages.length > 0) && (
                            <TouchableOpacity
                                onPress={handleSubmitImages}
                                disabled={submittingImages}
                                className={`mt-4 py-3 rounded-lg flex-row justify-center items-center ${submittingImages ? 'bg-orange-500/50' : 'bg-orange-500'}`}
                            >
                                {submittingImages ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text className="text-white font-bold">Submit Verification Images</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Booking Status / Next Steps */}


                {/* Payment Breakdown */}
                <View className="px-5 mt-6 mb-8">
                    <Text className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">Payment Summary</Text>
                    <View className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-400">Base Price</Text>
                            <Text className="text-white">₹{billingBreakdown.basePrice}</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-400">Insurance & Fees</Text>
                            <Text className="text-white">₹{billingBreakdown.insuranceAmount + billingBreakdown.deliveryCharges}</Text>
                        </View>
                        {billingBreakdown.discountAmount > 0 && (
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-green-500">Discount</Text>
                                <Text className="text-green-500">-₹{billingBreakdown.discountAmount}</Text>
                            </View>
                        )}
                        <View className="h-px bg-gray-800 my-3" />
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-white font-semibold">Total Amount</Text>
                            <Text className="text-white font-bold text-lg">₹{billingBreakdown.totalPrice}</Text>
                        </View>
                        <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-800 border-dashed">
                            <Text className="text-orange-500">Paid Advance</Text>
                            <Text className="text-orange-500 font-medium">₹{billingBreakdown.advanceAmount}</Text>
                        </View>
                        <View className="flex-row justify-between mt-1">
                            <Text className="text-gray-400">Remaining to Pay</Text>
                            <Text className="text-gray-300 font-medium">₹{billingBreakdown.remainingAmount}</Text>
                        </View>
                    </View>
                </View>

                {/* Final Payment Button */}
                {statusSummary.finalPaymentStatus === 'pending' && (
                    <View className="px-5 mt-6 mb-8">
                        <TouchableOpacity
                            onPress={handleFinalPayment}
                            disabled={processingPayment}
                            className={`py-4 rounded-xl flex-row justify-center items-center shadow-lg ${processingPayment ? 'bg-orange-500/50' : 'bg-orange-500'}`}
                        >
                            {processingPayment ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Make Final Payment (₹{billingBreakdown.remainingAmount})</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}
