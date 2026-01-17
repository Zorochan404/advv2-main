import { ActivityIndicator, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Text } from './Text';

interface ButtonProps extends TouchableOpacityProps {
    variant?: 'default' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg';
    label?: string;
    loading?: boolean;
}

export function Button({
    variant = 'default',
    size = 'default',
    label,
    loading,
    className,
    disabled,
    children,
    ...props
}: ButtonProps) {

    const baseStyles = "flex-row items-center justify-center rounded-lg";

    const variants = {
        default: "bg-primary-500 active:bg-primary-600",
        outline: "border border-input bg-transparent active:bg-accent",
        ghost: "bg-transparent active:bg-accent",
        destructive: "bg-destructive active:bg-destructive/90",
    };

    const sizes = {
        default: "h-12 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-14 px-8",
    };

    const textVariants = {
        default: "text-white font-semibold",
        outline: "text-foreground font-medium",
        ghost: "text-foreground font-medium",
        destructive: "text-destructive-foreground font-semibold",
    };

    const buttonClass = `${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50' : ''} ${className || ''}`;
    const textClass = `${textVariants[variant]}`;

    return (
        <TouchableOpacity
            className={buttonClass}
            disabled={disabled || loading}
            activeOpacity={0.7}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? 'black' : 'white'} />
            ) : label ? (
                <Text className={textClass}>{label}</Text>
            ) : (
                children
            )}
        </TouchableOpacity>
    );
}
