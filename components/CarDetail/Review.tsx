import { Star } from "lucide-react-native";
import React from "react";
import { FlatList, Text, View } from "react-native";

interface ReviewItem {
    id: string;
    name: string;
    rating: number;
    comment: string;
}
interface ReviewProps {
    reviews: ReviewItem[];
}



const Review = ({ reviews }: ReviewProps) => {
    const renderStars = (count: number) => {
        return (
            <View className="flex-row ">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                        key={index}
                        size={16}
                        color={index < count ? "orange" : "#d1d5db"}
                        fill={index < count ? "orange" : "none"}
                        className="mr-1"
                    />
                ))}
            </View>
        );
    };

    return (
        reviews.length === 0 ? (
            <View className=" rounded-2xl shadow my-4 mb-28">
                <Text className="text-lg font-bold mb-3 text-white">
                    No Customer Reviews Yet
                </Text>
            </View>
        ) : (
            <View className=" rounded-2xl shadow my-4 mb-28">
                <Text className="text-lg font-bold mb-3 text-white">
                    Customer Reviews
                </Text>

                <FlatList
                    data={reviews}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View className="mb-4 border-b border-gray-200 pb-2">
                            <Text className="font-semibold text-white mb-2">{item.name}</Text>
                            {renderStars(item.rating)}
                            <Text className="text-gray-600 mt-1 text-white">
                                {item.comment}
                            </Text>
                        </View>
                    )}
                />
            </View>
        )
    );
};

export default Review;
