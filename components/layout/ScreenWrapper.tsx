import { StatusBar, View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps extends ViewProps {
    children: React.ReactNode;
    bg?: string;
}

export function ScreenWrapper({ children, style, className, bg = "bg-background", ...props }: ScreenWrapperProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            className={`flex-1 ${bg} ${className}`}
            style={[{ paddingTop: insets.top }, style]}
            {...props}
        >
            <StatusBar barStyle="dark-content" />
            {children}
        </View>
    );
}
