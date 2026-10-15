import React from 'react';

import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { getPokemonImage } from '../types/pokemon';

const BaseStatsScreen = ({ route, navigation }: any) => {

    const { pokemonId } = route.params;
    const pokemon = useSelector((state: RootState) => state.pokemon.pokemon.find(item => item.id === pokemonId));

    if (!pokemon) {
        return (
            <View style={styles.center}>
                <Text style={styles.notFound}>Pokemon not found</Text>
                <TouchableOpacity
                    style={styles.backButtonLarge}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    let totalStats = 0;

    pokemon.stats.forEach(stat => { totalStats += stat.base_stat });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <Image source={require('../assets/back.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Base Stats</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}>
                <View style={styles.pokemonCard}>
                    <View style={styles.smallImageContainer}>
                        <Image
                            source={{ uri: getPokemonImage(pokemon.id) }}
                            style={styles.smallImage}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.pokemonInfo}>
                        <Text style={styles.pokemonId}>#{String(pokemon.id).padStart(3, '0')}</Text>
                        <Text style={styles.pokemonName}>{pokemon.name}</Text>
                        <View style={styles.types}>
                            {pokemon.types.map(item => (
                                <View key={item.slot} style={styles.typeBadge}>
                                    <Text style={styles.typeText}>{item.type.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
                <View style={styles.totalCard}>
                    <View>
                        <Text style={styles.totalLabel}>Total Base Stats</Text>
                        <Text style={styles.totalDescription}>Combined strength of all stats</Text>
                    </View>
                    <Text style={styles.totalValue}>{totalStats}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Base Stats</Text>
                    {pokemon.stats.map(stat => {
                        const value = stat.base_stat;
                        const percentage = Math.min(value / 200 * 100, 100);

                        return (
                            <View key={stat.stat.name} style={styles.statContainer}>
                                <View style={styles.statHeader}>
                                    <Text style={styles.statName}>{stat.stat.name}</Text>
                                    <Text style={styles.statValue}>{value}</Text>
                                </View>

                                <View style={styles.progressBackground}>
                                    <View style={[styles.progress, { width: `${percentage}%` }]} />
                                </View>
                            </View>
                        );
                    })}
                </View>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>About Stats</Text>
                    <StatDescription
                        title="HP"
                        description="Determines how much damage the Pokemon can take before fainting."
                    />

                    <StatDescription
                        title="Attack"
                        description="Determines the power of physical moves."
                    />

                    <StatDescription
                        title="Defense"
                        description="Determines how well the Pokemon withstands physical attacks."
                    />

                    <StatDescription
                        title="Sp. Atk"
                        description="Determines the power of special moves."
                    />

                    <StatDescription
                        title="Sp. Def"
                        description="Determines how well the Pokemon withstands special attacks."
                    />

                    <StatDescription
                        title="Speed"
                        description="Determines which Pokemon generally attacks first."
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const StatDescription = ({title, description,}: {title: string; description: string}) => {
    return (
        <View style={styles.descriptionRow}>
            <Text style={styles.descriptionTitle}>{title}</Text>
            <Text style={styles.descriptionText}>{description}</Text>
        </View>
    );
};

export default BaseStatsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },

    header: {
        height: 100,
        paddingTop: 45,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },

    backIcon: {
        width: 25,
        height: 25,
        tintColor: 'black',
        resizeMode: 'contain',
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1D1D1F',
    },

    headerRight: {
        width: 42,
    },

    content: {
        paddingTop: 12,
        paddingBottom: 40,
    },

    pokemonCard: {
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },

    smallImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F3F8',
    },

    smallImage: {
        width: 90,
        height: 90,
    },

    pokemonInfo: {
        flex: 1,
        marginLeft: 16,
    },

    pokemonId: {
        fontSize: 12,
        fontWeight: '700',
        color: '#999',
    },

    pokemonName: {
        marginTop: 3,
        fontSize: 24,
        fontWeight: '900',
        color: '#222',
        textTransform: 'capitalize',
    },

    types: {
        flexDirection: 'row',
        marginTop: 8,
    },

    typeBadge: {
        marginRight: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        backgroundColor: '#E8F5E9',
    },

    typeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2E7D32',
        textTransform: 'capitalize',
    },

    totalCard: {
        marginHorizontal: 16,
        marginTop: 16,
        padding: 20,
        borderRadius: 20,
        backgroundColor: '#222',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    totalLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },

    totalDescription: {
        marginTop: 5,

        fontSize: 12,
        color: '#AAAAAA',
    },

    totalValue: {
        fontSize: 34,
        fontWeight: '900',
        color: '#FFFFFF',
    },

    card: {
        marginHorizontal: 16,
        marginTop: 16,
        padding: 18,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },

    sectionTitle: {
        marginBottom: 20,
        fontSize: 19,
        fontWeight: '800',
        color: '#1D1D1F',
    },

    statContainer: {
        marginBottom: 20,
    },

    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    statName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#555',
    },

    statValue: {
        fontSize: 15,
        fontWeight: '900',
        color: '#222',
    },

    progressBackground: {
        height: 10,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#E8E8E8',
    },

    progress: {
        height: '100%',
        borderRadius: 10,
        backgroundColor: '#4CAF50',
    },

    descriptionRow: {
        marginBottom: 16,
    },

    descriptionTitle: {
        fontSize: 14,
        fontWeight: '800',

        color: '#333',
    },

    descriptionText: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 19,
        color: '#888',
    },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F6FA',
    },

    notFound: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 20,
    },

    backButtonLarge: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#222',
    },

    backButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});