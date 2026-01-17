import { useCarDetails } from "@/hooks/useCarDetails";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowRight, Calendar, MoveLeft } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import CarContent from "../../components/CarDetail/Content";
import DateTimeModal from "../../components/CarDetail/DateTimeModel";
import { useAuthStore } from "../../store/useAuthStore";

const { width } = Dimensions.get("window");

export default function CarDetail() {
    const { id } = useLocalSearchParams();
    const { car, reviews, avgRating, loading, error } = useCarDetails(id as string);

    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedRange, setSelectedRange] = useState<{
        startDate: Date | null;
        endDate: Date | null;
        startTime: string | null;
        endTime: string | null;
    }>({
        startDate: null,
        endDate: null,
        startTime: null,
        endTime: null,
    });

    const [showStartModal, setShowStartModal] = useState(false);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const slide = Math.round(event.nativeEvent.contentOffset.x / width);
        setActiveIndex(slide);
    };

    const handleDateRangeConfirm = (range: {
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
    }) => {
        console.log("Selected Range:", range);
        setSelectedRange(range);
        setShowStartModal(false);
    };

    const handleBookingPress = () => {
        if (!selectedRange.startDate || !selectedRange.endDate) {
            Alert.alert(
                "Date of booking not provided",
                "Please select a date range to continue",
                [
                    {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel",
                    },
                    { text: "OK", onPress: () => console.log("OK Pressed") },
                ]
            );
            return;
        }

        const authStore = useAuthStore.getState();
        if (!authStore.accessToken) {
            // Navigate to login
            router.push("/(auth)/login");
            return;
        }

        proceedWithBooking();
    };

    const proceedWithBooking = () => {
        // Navigate to booking summary with all necessary parameters
        router.push({
            pathname: "/booking/BookingSummaryScreen",
            params: {
                id: id,
                carName: car?.name,
                price: car?.price,
                discountedPrice: car?.discountprice,
                priceLabel: "day",
                seats: car?.seats,
                transmission: car?.transmission,
                fuel: car?.fuel,
                insuranceamount: car?.insuranceamount,
                images: JSON.stringify(parsedImages),
                startDate: selectedRange.startDate ? dayjs(selectedRange.startDate).format("YYYY-MM-DD") : '',
                endDate: selectedRange.endDate ? dayjs(selectedRange.endDate).format("YYYY-MM-DD") : '',
                startTime: selectedRange.startTime,
                endTime: selectedRange.endTime,
            }
        });
    };

    if (loading && !car) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator size="large" color="#f97316" />
            </View>
        );
    }

    if (error && !car) {
        return (
            <View className="flex-1 justify-center items-center bg-black px-5">
                <Text className="text-red-500 mb-4">{error}</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-orange-500 px-4 py-2 rounded-lg">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const parsedImages = car?.images || [];
    const price = car?.price;
    const priceLabel = "day"; // Defaulting as per previous context

    return (
        <View className="flex-1 bg-background">
            <ScrollView>
                <View>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        className="rounded-b-3xl"
                    >
                        {parsedImages.length > 0 ? (
                            parsedImages.map((img: any, i: number) => (
                                <Image
                                    key={i}
                                    source={{ uri: img }}
                                    style={{ width, height: 280 }}
                                    resizeMode="cover"
                                />
                            ))
                        ) : (
                            <Image
                                source={{ uri: "https://via.placeholder.com/400x280" }}
                                style={{ width, height: 280 }}
                                resizeMode="cover"
                            />
                        )}

                    </ScrollView>

                    <View className="absolute bottom-3 w-full flex-row justify-center">
                        {parsedImages.map((_: any, i: number) => (
                            <View
                                key={i}
                                className={`h-2 w-2 rounded-full mx-1 ${i === activeIndex ? "bg-white" : "bg-gray-600"
                                    }`}
                            />
                        ))}
                    </View>
                    <View className="absolute top-14 left-5 z-10 rounded-full bg-white overflow-hidden p-2">
                        <TouchableOpacity onPress={() => router.back()}>
                            <MoveLeft color="black" size={20} />
                        </TouchableOpacity>
                    </View>

                    <View className="absolute top-60 left-4 flex-row z-10 ">
                        <BlurView
                            intensity={90}
                            className="flex-row items-center bg-white px-2 py-1 rounded-full mr-2 shadow overflow-hidden"
                        >
                            <Text className="text-xs">⭐ {avgRating || "no review available"}</Text>
                        </BlurView>
                        <BlurView
                            intensity={90}
                            className="bg-white px-2 py-1 rounded-full shadow overflow-hidden"
                        >
                            <Text className="text-xs">{car?.category || "Car"}</Text>
                        </BlurView>
                    </View>
                </View>

                {/* Content */}
                <CarContent
                    carName={car?.name || ""}
                    seats={car?.seats || 0}
                    transmission={car?.transmission || ""}
                    fuel={car?.fuel || ""}
                    reviews={reviews}
                />
            </ScrollView>

            {/* Bottom Booking Bar */}
            <View className="absolute bottom-14 left-5 right-5 bg-white border-t border-gray-200 flex-row items-center justify-between px-5 py-3 rounded-full gap-2  w-[90%]">
                <View className="flex-row items-center flex-1 justify-between gap-2">
                    <View className="flex-row items-center">
                        <Text className="font-bold text-lg text-black">
                            {`₹${car?.discountprice || car?.price}`}
                        </Text>
                        <Text className="text-lg font-medium text-black">/day</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowStartModal(true)}>
                        <View className="bg-gray-800 rounded-full px-4 py-3 flex-row items-center gap-2">
                            <Calendar color={"white"} size={20} />
                            <Text className="text-gray-300 text-sm">
                                {selectedRange.startDate && selectedRange.endDate
                                    ? `${dayjs(selectedRange.startDate).format("MMM D")} to ${dayjs(
                                        selectedRange.endDate
                                    ).format("D")}`
                                    : "Select Date"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    className="bg-orange-500 px-6 py-3 rounded-full"
                    onPress={handleBookingPress}
                >
                    <ArrowRight size={20} color={"white"} />
                </TouchableOpacity>
            </View>

            <DateTimeModal
                visible={showStartModal}
                onClose={() => setShowStartModal(false)}
                onConfirm={handleDateRangeConfirm}
                carId={id as string}
            />
        </View>
    );
}
