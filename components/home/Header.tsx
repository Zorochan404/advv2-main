import { useCoordinatesStore, useLocationStore } from "@/store/location";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
import { Bell, MapPin } from "lucide-react-native";
import React, { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native"; // Import Image from react-native
import { Button } from "../ui/Button";

// import { Skeleton } from "@/components/ui/Skeleton";
import DateTimeModal from "./DateTimeModel";



interface Category {
    id: number;
    name: string;
    value: string;
}

const initialCategories: Category[] = [
    {
        id: 1,
        name: "All",
        value: "All",
    },
    {
        id: 2,
        name: "SUV",
        value: "SUV",
    },
    {
        id: 3,
        name: "Sedan",
        value: "Sedan",
    },
    {
        id: 4,
        name: "Hatchback",
        value: "Hatchback",
    },
    {
        id: 5,
        name: "Mini SUV",
        value: "Mini SUV",
    }

]

interface FilterData {
    selectedCategory?: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
}

const Header: React.FC<{
    categories: Category[],
    loading: boolean,
    onSubmit: (data: FilterData) => void
}> = ({ categories, onSubmit }) => {
    // Ensure categories is always an array
    const categoriesData = (Array.isArray(categories) && categories.length > 0) ? categories : initialCategories;

    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [startDate, setStartDate] = useState<string>(
        dayjs().format("YYYY-MM-DD")
    );
    const [endDate, setEndDate] = useState<string>(
        dayjs().add(1, "day").format("YYYY-MM-DD")
    );
    const [startTime, setStartTime] = useState<string>("10:00");
    const [endTime, setEndTime] = useState<string>("10:00");
    const [showStartModal, setShowStartModal] = useState<boolean>(false);
    const [showEndModal, setShowEndModal] = useState<boolean>(false);
    const location = useLocationStore((s) => s.location);
    const coordinates = useCoordinatesStore((s) => s.coordinates);
    const fetchLocation = useLocationStore((s) => s.fetchLocation);
    const fetchCoordinates = useCoordinatesStore((s) => s.fetchCoordinates);



    const handleCategoryPress = (category: Category): void => {
        setSelectedCategory(category.id);
    };

    const handleStartDateConfirm = (val: { date: Date, time: string }): void => {
        setStartDate(dayjs(val.date).format("YYYY-MM-DD"));
        setStartTime(val.time);
    };

    const handleEndDateConfirm = (val: { date: Date, time: string }): void => {
        setEndDate(dayjs(val.date).format("YYYY-MM-DD"));
        setEndTime(val.time);
    };

    const handleSubmit = (): void => {
        const data = {
            selectedCategory: categoriesData.find((cat: Category) => cat.id === selectedCategory)?.value,
            startDate,
            endDate,
            startTime,
            endTime,
        };
        console.log("Form Data:", data);
        onSubmit(data);
    };

    return (
        <View className="w-full relative justify-center items-center">
            <View className="w-full bg-orange-500 rounded-b-[32px] pb-12">
                <View className="flex-row w-full px-5 py-4 items-center justify-between">
                    <BlurView
                        tint="light"
                        intensity={30}
                        className="rounded-full overflow-hidden border border-white/20"
                    // style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    >
                        <View className="flex-row items-center gap-2 px-4 py-2">
                            <MapPin color="white" size={18} />
                            <Text className="text-white font-medium text-sm">
                                {" "}
                                {location || "Fetching location..."}
                            </Text>
                        </View>
                    </BlurView>
                    <BlurView
                        tint="light"
                        intensity={30}
                        className="rounded-full overflow-hidden border border-white/20 p-2"
                    // style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    >
                        <Bell color={"white"} size={25} />
                    </BlurView>
                </View>
                <View className="flex-row justify-between px-5 -mt-2 mb-4">
                    <View>
                        <Text className="text-white font-bold text-4xl">Hey,</Text>
                        <Text className="font-bold text-2xl text-white">
                            Let's book a ride for you
                        </Text>
                    </View>
                    <Image
                        source={require("../../assets/images/mic.png")}
                        style={{ width: 160, height: 160 }}
                        className="-mt-8"
                    />
                </View>
            </View>
            <View className="w-[90%] -mt-28 rounded-2xl bg-white z-10 px-4 py-4 shadow-md">
                {/* Category Buttons */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="max-h-[60px] "
                >
                    <View className="flex-row items-start gap-3">
                        {
                            categoriesData.map((category: Category) => (
                                <Button
                                    key={category.id}
                                    onPress={() => handleCategoryPress(category)}
                                    className={`border min-w-[80px] rounded-xl ${selectedCategory === category.id
                                        ? "bg-orange-500 border-orange-500"
                                        : "bg-white border-black"
                                        }`}
                                >
                                    <Text
                                        className={`font-medium text-sm ${selectedCategory === category.id
                                            ? "text-white"
                                            : "text-black"
                                            }`}
                                    >
                                        {category.name}
                                    </Text>
                                </Button>
                            ))
                        }
                    </View>
                </ScrollView>

                {/* Date and Time Inputs */}
                <View className="flex-col gap-2">
                    <View className="flex-row justify-between mt-2 gap-2">
                        {/* Start Date Section */}
                        <View className="gap-2">
                            <Text className="text-gray-700 font-semibold text-base">
                                Start Date
                            </Text>

                            <Button
                                onPress={() => setShowStartModal(true)}
                                className="bg-gray-50 border border-gray-300 rounded-xl px-8"
                            >
                                <Text className="text-black text-xs">
                                    {startDate} {startTime}
                                </Text>
                            </Button>
                        </View>

                        {/* End Date Section */}
                        <View className="gap-2">
                            <Text className="text-gray-700 font-semibold text-base">
                                End Date
                            </Text>
                            <Button
                                onPress={() => setShowEndModal(true)}
                                className="bg-gray-50 border border-gray-300 rounded-xl px-8"
                            >
                                <Text className="text-black text-xs">
                                    {endDate} {endTime}
                                </Text>
                            </Button>
                        </View>
                    </View>

                    <Button
                        onPress={handleSubmit}
                        className="bg-orange-500 mt-2 rounded-xl "
                    >
                        <Text className="text-white font-semibold">Submit</Text>
                    </Button>
                </View>

                {/* Start Modal */}
                <DateTimeModal
                    visible={showStartModal}
                    onClose={() => setShowStartModal(false)}
                    onConfirm={handleStartDateConfirm}
                    isEnd={false}
                />

                {/* End Modal */}
                <DateTimeModal
                    visible={showEndModal}
                    onClose={() => setShowEndModal(false)}
                    onConfirm={handleEndDateConfirm}
                    isEnd={true}
                />
            </View>
        </View>
    );
};

export default Header;
