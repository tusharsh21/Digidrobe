import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Image, Text, Dimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../constants/theme';

const { width } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
    children: React.ReactNode;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ children }) => {
    const [animationComplete, setAnimationComplete] = useState(false);
    const [appReady, setAppReady] = useState(false);

    const logoScale = useRef(new Animated.Value(0.3)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const taglineTranslateY = useRef(new Animated.Value(20)).current;
    const containerOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        async function prepare() {
            try {
                // Keep the native splash screen visible while we fetch resources
                await SplashScreen.preventAutoHideAsync();

                // Pre-load assets or data if needed here
                await new Promise(resolve => setTimeout(resolve, 500));

                setAppReady(true);
            } catch (e) {
                console.warn(e);
            } finally {
                // Hide the native splash screen and start our JS animation
                await SplashScreen.hideAsync();
                startAnimation();
            }
        }

        prepare();
    }, []);

    const startAnimation = () => {
        Animated.sequence([
            // 1. Logo scale and fade in
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 10,
                    friction: 4,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
            // 2. Tagline slide up and fade in
            Animated.parallel([
                Animated.timing(taglineOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(taglineTranslateY, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
            // 3. Wait a bit
            Animated.delay(1000),
            // 4. Fade out the whole container
            Animated.timing(containerOpacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setAnimationComplete(true);
        });
    };

    return (
        <View style={styles.container}>
            {children}

            {!animationComplete && (
                <Animated.View style={[styles.splashContainer, { opacity: containerOpacity }]}>
                    <Animated.Image
                        source={require('../../assets/icon.png')}
                        style={[
                            styles.logo,
                            {
                                transform: [{ scale: logoScale }],
                                opacity: logoOpacity,
                            },
                        ]}
                        resizeMode="contain"
                    />
                    <Animated.View style={{
                        opacity: taglineOpacity,
                        transform: [{ translateY: taglineTranslateY }],
                        alignItems: 'center'
                    }}>
                        <Text style={styles.tagline}>A digital Wardrobe</Text>
                    </Animated.View>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    splashContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    logo: {
        width: width * 0.6,
        height: width * 0.6,
        marginBottom: 20,
    },
    tagline: {
        fontSize: 18,
        fontWeight: '500',
        color: '#003366', // Matches the logo's deep blue
        letterSpacing: 1,
    },
});
