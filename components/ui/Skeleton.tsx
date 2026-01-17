import { View } from "react-native";

type SkeletonProps = {
    className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <View
            className={`bg-muted ${className}`}
        />
    );
}
