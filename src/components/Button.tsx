import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, StyleProp } from 'react-native';
import { Colors, Spacing } from '../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'black';
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    loading?: boolean;
    disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    style,
    textStyle,
    loading = false,
    disabled = false,
}) => {
    const getButtonStyle = () => {
        switch (variant) {
            case 'black':
                return styles.black;
            case 'secondary':
                return styles.secondary;
            case 'outline':
                return styles.outline;
            default:
                return styles.primary;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'black':
                return styles.blackText;
            case 'secondary':
                return styles.secondaryText;
            case 'outline':
                return styles.outlineText;
            default:
                return styles.primaryText;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.base, getButtonStyle(), style, (disabled || loading) && styles.disabled]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? Colors.primary : '#FFF'} />
            ) : (
                <Text style={[styles.textBase, getTextStyle(), textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        height: 48,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.l,
    },
    textBase: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    primary: {
        backgroundColor: Colors.primary,
    },
    primaryText: {
        color: '#FFF',
    },
    black: {
        backgroundColor: '#000',
        height: 40,
        borderRadius: 20,
        paddingHorizontal: Spacing.m,
    },
    blackText: {
        color: '#FFF',
        fontSize: 13,
    },
    secondary: {
        backgroundColor: Colors.secondary,
    },
    secondaryText: {
        color: Colors.onSecondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    outlineText: {
        color: Colors.text,
    },
    disabled: {
        opacity: 0.5,
    },
});
