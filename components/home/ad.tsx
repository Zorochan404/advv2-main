import { Skeleton } from "@/components/ui/Skeleton";
import React, { useRef } from "react";
import { Animated, Dimensions, Image, View } from "react-native";

const { width } = Dimensions.get("window");



const CARD_WIDTH = width * 0.85;
const SNAP_WIDTH = CARD_WIDTH;
const SPACER = (width - CARD_WIDTH) / 2;

const Ad = ({ ads, loading }: { ads: any, loading: boolean }) => {
    const scrollX = useRef(new Animated.Value(0)).current;

    // Ensure ads.data is always an array
    const adsData = ads?.data && Array.isArray(ads.data) ? ads.data : [];
    const carouselImages = adsData.map((ad: any) => ad.imageUrl);
    // Show loading state if no ads data
    if (loading || carouselImages.length === 0) {
        return (
            <View className="w-full justify-center items-center py-6 px-5">
                <Skeleton className="w-full h-48 rounded-xl" />
            </View>
        );
    }

    return (
        <View className="w-full justify-center items-center py-6">
            <Animated.ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={SNAP_WIDTH}
                snapToAlignment="center"
                decelerationRate="fast"
                bounces={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false } // must be false for pagination width interpolation
                )}
                scrollEventThrottle={16}
            >
                {/* Left spacer */}
                <View className="w-5" />

                {carouselImages.map((image: any, index: number) => {
                    const inputRange = [
                        (index - 1) * SNAP_WIDTH,
                        index * SNAP_WIDTH,
                        (index + 1) * SNAP_WIDTH,
                    ];

                    const scale = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.8, 1, 0.8],
                        extrapolate: "clamp",
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.6, 1, 0.6],
                        extrapolate: "clamp",
                    });

                    return (
                        <View key={index} className="items-center">
                            <Animated.View
                                style={{
                                    width: CARD_WIDTH,
                                    height: 180,
                                    transform: [{ scale }],
                                    opacity,
                                    borderRadius: 16,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 6 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 12,
                                }}
                            >
                                <Image
                                    source={{ uri: image }}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: 16,
                                    }}
                                    resizeMode="cover"
                                />
                            </Animated.View>
                        </View>
                    );
                })}

                {/* Right spacer */}
                <View className="w-2" />
            </Animated.ScrollView>

            {/* Pagination Dots */}
            <View className="flex-row justify-center mt-4">
                {carouselImages.map((_: any, index: number) => {
                    const inputRange = [
                        (index - 1) * SNAP_WIDTH,
                        index * SNAP_WIDTH,
                        (index + 1) * SNAP_WIDTH,
                    ];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 16, 8],
                        extrapolate: "clamp",
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: "clamp",
                    });

                    return (
                        <Animated.View
                            key={index}
                            className="h-2 w-2 bg-white mx-2 rounded-full"
                            style={{ opacity, width: dotWidth }}
                        />
                    );
                })}
            </View>
        </View>
    );
};

export default Ad;
