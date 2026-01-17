import { Text as RNText, TextProps } from 'react-native';
// For now, simple concatenation

export function Text({ className, style, ...props }: TextProps) {
    return (
        <RNText
            className={`text-foreground dark:text-gray-100 ${className}`}
            style={style}
            {...props}
        />
    );
}
