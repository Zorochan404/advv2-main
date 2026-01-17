import React from "react";
import { View } from "react-native";
import MapView, { Marker } from "react-native-maps";

interface MapProps {
  latitude: number;
  longitude: number;
}

const Map: React.FC<MapProps> = ({ latitude, longitude }) => {
  return (
    <View className="flex-1 overflow-hidden rounded-3xl">
      <MapView
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        style={{ width: "100%", height: "100%" }}
        showsUserLocation={true}
        scrollEnabled={false}
      >
        <Marker
          coordinate={{
            latitude,
            longitude,
          }}
          title="Car Location.."
          description="Rehabari Parking, Guwahati"
        />
      </MapView>
    </View>
  );
};

export default Map;
