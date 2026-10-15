import React, { useMemo } from 'react';

import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

const ShowAllGIFScreen = ({ route, navigation }: any) => {

    const { pokemonId } = route.params;
    const pokemon = useSelector((state: RootState) => state.pokemon.pokemon.find(item => item.id === pokemonId));

    const gifs = useMemo(() => {
        if (!pokemon?.sprites) {
            return [];
        }

        const sprites: any = pokemon.sprites;

        const gifList = [
            {
                title: 'Front Animated',
                url: sprites.versions?.['generation-v']?.['black-white']?.animated
                    ?.front_default,
            },
            {
                title: 'Front Shiny Animated',
                url: sprites.versions?.['generation-v']?.['black-white']?.animated
                    ?.front_shiny,
            },
            {
                title: 'Back Animated',
                url: sprites.versions?.['generation-v']?.['black-white']?.animated
                    ?.back_default,
            },
            {
                title: 'Back Shiny Animated',
                url: sprites.versions?.['generation-v']?.['black-white']?.animated
                    ?.back_shiny,
            },
        ];

        return gifList.filter(item => item.url);
    }, [pokemon]);

    if (!pokemon) {
        return (
            <View style={styles.center}>
                <Text style={styles.notFoundText}>Pokemon not found</Text>
                <TouchableOpacity
                    style={styles.goBackButton}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.goBackText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <Image source={require('../assets/back.png')} style={styles.backIcon} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>All GIFs</Text>
                </View>
            </View>

            <View style={styles.intro}>
                <Text style={styles.introTitle}>Animated Sprites</Text>
                <Text style={styles.introText}>
                    Explore all available animated sprites
                    for {pokemon.name}
                </Text>
            </View>

            {gifs.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🎬</Text>
                    <Text style={styles.emptyTitle}>No GIFs Available</Text>
                    <Text style={styles.emptyText}>
                        Animated sprites are not available
                        for this Pokemon.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={gifs}
                    numColumns={2}
                    keyExtractor={(item, index) => `${item.title}-${index}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                    columnWrapperStyle={styles.row}
                    renderItem={({ item }) => (
                        <View style={styles.gifCard}>
                            <View style={styles.gifContainer}>
                                <Image
                                    source={{ uri: item.url }}
                                    style={styles.gif}
                                    resizeMode="contain"
                                />
                            </View>

                            <View style={styles.gifFooter}>
                                <View style={styles.playBadge}>
                                    <Text style={styles.playText}>GIF</Text>
                                </View>
                                <Text style={styles.gifTitle}>{item.title}</Text>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

export default ShowAllGIFScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },

    header: {
        height: 100,
        paddingTop: 45,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
    },

    backButton: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
    },

    backIcon: {
        width: 25,
        height: 25,
        tintColor: 'black',
        resizeMode: 'contain',
    },

    backArrow: {
        fontSize: 36,
        fontWeight: '300',
        color: '#222',
    },

    headerCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: '#1D1D1F',
    },

    intro: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 4,
    },

    introTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1D1D1F',
    },

    introText: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 19,
        color: '#888',
    },

    list: {
        padding: 16,
        paddingTop: 12,
        paddingBottom: 30,
    },

    row: {
        justifyContent: 'space-between',
    },

    gifCard: {
        width: '48%',
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },

    gifContainer: {
        height: 170,
        backgroundColor: '#F1F3F8',
        alignItems: 'center',
        justifyContent: 'center',
    },

    gif: {
        width: '90%',
        height: '90%',
    },

    gifFooter: {
        padding: 12,
    },

    playBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#1D1D1F',
    },

    playText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FFFFFF',
    },

    gifTitle: {
        marginTop: 8,
        fontSize: 13,
        fontWeight: '700',
        color: '#444',
    },

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },

    emptyIcon: {
        fontSize: 42,
        marginBottom: 15,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#222',
    },

    emptyText: {
        marginTop: 8,
        fontSize: 14,
        lineHeight: 20,
        color: '#888',
        textAlign: 'center',
    },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F6FA',
    },

    notFoundText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 20,
    },

    goBackButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#222',
    },

    goBackText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
});