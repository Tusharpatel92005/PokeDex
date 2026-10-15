import React, { useEffect } from 'react';
import {
    Animated,
    Easing,
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const SplashScreen = ({ navigation }: any) => {

    const logoScale = new Animated.Value(0.5);
    const logoOpacity = new Animated.Value(0);
    const textOpacity = new Animated.Value(0);
    const textTranslateY = new Animated.Value(20);

    useEffect(() => {

        Animated.parallel([
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 5,
                tension: 60,
                useNativeDriver: true,
            }),

            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 700,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();

        Animated.sequence([
            Animated.delay(500),

            Animated.parallel([
                Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),

                Animated.timing(textTranslateY, {
                    toValue: 0,
                    duration: 600,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        const timer = setTimeout(() => {
            navigation.replace('MainTabs');
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.backgroundCircleOne} />
            <View style={styles.backgroundCircleTwo} />
            <View style={styles.content}>
                <Animated.View
                    style={[
                        styles.logoContainer,
                        {
                            opacity: logoOpacity,
                            transform: [
                                {
                                    scale: logoScale,
                                },
                            ],
                        },
                    ]}>
                    <Image
                        source={require('../assets/pokeball.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.textContainer,
                        {
                            opacity: textOpacity,
                            transform: [
                                {
                                    translateY: textTranslateY,
                                },
                            ],
                        },
                    ]}>

                    <Text style={styles.appName}>
                        PokeDex
                    </Text>

                    <Text style={styles.tagline}>
                        Explore. Discover. Catch them all.
                    </Text>

                </Animated.View>

            </View>

            <Text style={styles.bottomText}>
                Powered by PokeDex
            </Text>

        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FC',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    logoContainer: {
        width: 180,
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
    },

    logo: {
        width: 155,
        height: 155,
    },

    textContainer: {
        alignItems: 'center',
        marginTop: 25,
    },

    appName: {
        fontSize: 42,
        fontWeight: '900',
        color: '#1D1D1F',
        letterSpacing: 1,
    },

    tagline: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
        color: '#7A7F8C',
        letterSpacing: 0.3,
    },

    bottomText: {
        position: 'absolute',
        bottom: 35,
        fontSize: 12,
        fontWeight: '500',
        color: '#A0A4AE',
    },

    backgroundCircleOne: {
        position: 'absolute',
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: '#EEF0FF',
        top: -150,
        right: -120,
    },

    backgroundCircleTwo: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: '#FFF0F0',
        bottom: -120,
        left: -120,
    },
});

