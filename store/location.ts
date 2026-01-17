import * as Location from "expo-location";
import { create } from "zustand";

type LocationState = {
  location: string | null;
  fetchLocation: () => Promise<void>;
};

type CoordinatesState = {
  coordinates: {
    lat: number;
    lon: number;
  } | null;
  fetchCoordinates: () => Promise<void>;
  setCoordinates: (coordinates: { lat: number; lon: number }) => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  location: null,
  fetchLocation: async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        set({ location: "Permission denied" });
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const places = await Location.reverseGeocodeAsync(loc.coords);
      if (places.length > 0) {
        const { district, city, region } = places[0];
        const formatted =
          `${district ? district + ", " : ""}${city ? city + ", " : ""}${region ? region + ", " : ""}`.replace(
            /,\s*$/,
            ""
          );

        set({ location: formatted || "Unknown location" });

        // Also update coordinates store
        useCoordinatesStore.getState().setCoordinates({
          lat: loc.coords.latitude,
          lon: loc.coords.longitude
        });

      } else {
        set({ location: "Unknown location" });
      }
    } catch (error) {
      console.log(error)
      set({ location: "location disabled" });
    }
  },
}));

export const useCoordinatesStore = create<CoordinatesState>((set) => ({
  coordinates: null,
  fetchCoordinates: async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      set({
        coordinates: {
          lat: loc.coords.latitude,
          lon: loc.coords.longitude
        }
      });
      console.log("Coordinates fetched:", {
        lat: loc.coords.latitude,
        lon: loc.coords.longitude
      });
    } catch (error) {
      console.log("Error fetching coordinates:", error);
    }
  },
  setCoordinates: (coordinates: { lat: number; lon: number }) => {
    set({ coordinates });
  }
}));


