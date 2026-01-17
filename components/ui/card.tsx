import * as React from 'react';
import { Text, View, type TextProps, type ViewProps } from 'react-native';
import { cn } from '../../lib/utils';

const Card = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => (
    <View
        ref={ref}
        className={cn(
            'bg-card border-border flex flex-col gap-6 rounded-xl border py-6 shadow-sm shadow-black/5',
            className
        )}
        {...props}
    />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => (
    <View
        ref={ref}
        className={cn('flex flex-col gap-1.5 px-6', className)}
        {...props}
    />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<Text, TextProps>(({ className, ...props }, ref) => (
    <Text
        ref={ref}
        role="heading"
        aria-level={3}
        className={cn('text-2xl font-semibold leading-none tracking-tight text-white', className)}
        {...props}
    />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<Text, TextProps>(({ className, ...props }, ref) => (
    <Text
        ref={ref}
        className={cn('text-sm text-gray-400', className)}
        {...props}
    />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => (
    <View ref={ref} className={cn('px-6', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => (
    <View
        ref={ref}
        className={cn('flex flex-row items-center px-6', className)}
        {...props}
    />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };

