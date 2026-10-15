import React, { useMemo, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { getPokemonImage } from '../types/pokemon';
import { SafeAreaView } from 'react-native-safe-area-context';

const LeaderBoardScreen = ({ navigation }: any) => {

    const [search, setSearch] = useState('');
    const pokemonList = useSelector((state: RootState) => state.pokemon.pokemon);
    const trendingPokemon = useMemo(() => {

        const searchText = search.trim().toLowerCase();

        return pokemonList
            .map(pokemon => {
                const score = pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0);
                return { ...pokemon, score };
            })
            .filter(pokemon => {
                if (!searchText) {
                    return true;
                }

                const matchesName = pokemon.name.toLowerCase().includes(searchText);
                const matchesId = pokemon.id.toString().includes(searchText);
                return matchesName || matchesId;
            })
            .sort((a, b) => b.score - a.score);
    }, [pokemonList, search]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>Leader Board</Text>
                <View style={styles.headerRight} />
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Image
                        source={require('../assets/search.png')}
                        style={styles.searchIcon}
                    />

                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search Pokémon by name or ID"
                        placeholderTextColor="#999"
                        style={styles.searchInput}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    {search.length > 0 && (
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={() => setSearch('')}>
                            <Text style={styles.clearText}>×</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}>

                {trendingPokemon.length > 0 ? (
                    trendingPokemon.map((pokemon, index) => {
                        const rank = index + 1;

                        return (
                            <TouchableOpacity
                                key={pokemon.id}
                                activeOpacity={0.8}
                                style={styles.pokemonCard}
                                onPress={() =>
                                    navigation.navigate('BaseStats', {
                                        pokemonId: pokemon.id,
                                    })
                                }>

                                <View style={styles.rankContainer}>
                                    <Text
                                        style={[
                                            styles.rank,
                                            rank === 1 && styles.firstRank,
                                            rank === 2 && styles.secondRank,
                                            rank === 3 && styles.thirdRank,
                                        ]}>
                                        {rank}
                                    </Text>
                                </View>

                                <View style={styles.imageContainer}>
                                    <Image
                                        source={{
                                            uri: getPokemonImage(pokemon.id),
                                        }}
                                        style={styles.pokemonImage}
                                        resizeMode="contain"
                                    />
                                </View>

                                <View style={styles.pokemonInfo}>
                                    <Text
                                        style={styles.pokemonName}
                                        numberOfLines={1}>
                                        {pokemon.name}
                                    </Text>

                                    <Text style={styles.pokemonId}>
                                        #{pokemon.id}
                                    </Text>
                                </View>

                                <View style={styles.scoreContainer}>
                                    <Text style={styles.scoreLabel}>
                                        Score
                                    </Text>

                                    <Text style={styles.score}>
                                        {pokemon.score}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>
                            No Pokémon found
                        </Text>

                        <Text style={styles.emptyText}>
                            Try searching with a different name or ID.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default LeaderBoardScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },

    header: {
        height: 45,
        paddingHorizontal: 16,
        flexDirection: 'row',
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

    heading: {
        fontSize: 30,
        fontWeight: '800',
        color: '#1D1D1F',
    },

    headerRight: {
        width: 42,
    },

    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
        backgroundColor: '#F5F6FA',
    },

    searchBar: {
        height: 50,
        paddingHorizontal: 14,
        borderRadius: 16,
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

    searchIcon: {
        width: 20,
        height: 20,
        tintColor: '#777',
        resizeMode: 'contain',
    },

    searchInput: {
        flex: 1,
        height: '100%',
        marginLeft: 10,
        paddingVertical: 0,
        fontSize: 14,
        color: '#222',
    },

    clearButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F1F5',
    },

    clearText: {
        fontSize: 20,
        lineHeight: 22,
        color: '#666',
        fontWeight: '500',
    },

    content: {
        paddingTop: 12,
        paddingBottom: 40,
    },

    pokemonCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 12,
        minHeight: 90,
        borderRadius: 20,
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

    rankContainer: {
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    rank: {
        fontSize: 20,
        fontWeight: '900',
        color: '#777',
    },

    firstRank: {
        fontSize: 24,
        color: '#D4A017',
    },

    secondRank: {
        fontSize: 23,
        color: '#8A8A8A',
    },

    thirdRank: {
        fontSize: 22,
        color: '#A66A3F',
    },

    imageContainer: {
        width: 65,
        height: 65,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F3F8',
    },

    pokemonImage: {
        width: 60,
        height: 60,
    },

    pokemonInfo: {
        flex: 1,
        marginLeft: 14,
    },

    pokemonName: {
        fontSize: 17,
        fontWeight: '800',
        color: '#222',
        textTransform: 'capitalize',
    },

    pokemonId: {
        marginTop: 3,
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
    },

    scoreContainer: {
        alignItems: 'flex-end',
        marginLeft: 8,
    },

    scoreLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#999',
        textTransform: 'uppercase',
    },

    score: {
        marginTop: 2,
        fontSize: 22,
        fontWeight: '900',
        color: '#222',
    },

    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingHorizontal: 30,
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#222',
    },

    emptyText: {
        marginTop: 6,
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});