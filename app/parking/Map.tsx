import React from "react";
import { View } from "react-native";
import { LeafletMap } from "../../components/leaflet";

interface MapProps {
  latitude: number;
  longitude: number;
}

const Map: React.FC<MapProps> = ({ latitude, longitude }) => {
  return (
    <View className="flex-1 overflow-hidden rounded-3xl">
      <LeafletMap
        latitude={latitude}
        longitude={longitude}
        height={300}
        draggable={false}
      />
    </View>
  );
};

export default Map;
