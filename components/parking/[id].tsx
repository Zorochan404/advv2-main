import { router, useLocalSearchParams } from "expo-router";
import { MoveLeft } from "lucide-react-native";
import {
    Dimensions,
    Image,
    ScrollView,
    TouchableOpacity,
    View
} from "react-native";
import ParkingContent from "./content";
import CarsSection from "../home/CarsSection";

const { width } = Dimensions.get("window");


export default function ParkingDetail() {
    const { carName, images, location } =
        useLocalSearchParams();





    const proceedWithBooking = () => {
        // Navigate to booking summary with all necessary parameters
        // router.push({
        //   pathname: "/Screen/BookingConfirmation/BookingSummaryScreen",
        //   params: {
        //     carName,
        //     location,
        //     images,

        //   }
        // });
    };

    return (
        <View className="flex-1 ">
            {/* Floating badges */}

            <ScrollView>


                <Image
                    source={{ uri: images as string }}
                    style={{ width: width, height: 280 }}
                    resizeMode="cover"
                    className="rounded-b-3xl"
                />

                <View className="absolute top-14 left-5 z-10 rounded-full bg-white overflow-hidden p-2">
                    <TouchableOpacity onPress={() => router.back()}>
                        <MoveLeft color="black" size={20} />
                    </TouchableOpacity>
                </View>




                {/* Content */}
                <ParkingContent
                    name={carName as string}
                    location={location as string}
                />

                {/* <CarsSection cars={cars} loading={loading} error={error} /> */}
            </ScrollView>


            {/* DateTimeModal */}
            {/* <DateTimeModal          
        visible={showStartModal}
        onClose={() => setShowStartModal(false)}
        onConfirm={handleDateRangeConfirm}
      /> */}
        </View>
    );
}
