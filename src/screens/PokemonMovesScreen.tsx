import React, { useMemo, useState } from 'react';

import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { getPokemonImage } from '../types/pokemon';

const PokemonMovesScreen = ({ route, navigation }: any) => {
    const { pokemonId } = route.params;
    const [search, setSearch] = useState('');

    const pokemon = useSelector((state: RootState) =>
        state.pokemon.pokemon.find(item => item.id === pokemonId),
    );

    const filteredMoves = useMemo(() => {
        if (!pokemon) {
            return [];
        }

        const searchText = search.trim().toLowerCase();

        return pokemon.moves
            .map((item, index) => ({
                ...item,
                moveNumber: index + 1,
            }))
            .filter(item =>
                item.move.name.toLowerCase().includes(searchText),
            );
    }, [pokemon, search]);

    if (!pokemon) {
        return (
            <View style={styles.center}>
                <Text style={styles.notFound}>
                    Pokemon not found
                </Text>

                <TouchableOpacity
                    style={styles.backButtonLarge}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>
                        Go Back
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderMove = ({
        item,
    }: {
        item: any;
    }) => {
        return (
            <View style={styles.moveCard}>
                <View style={styles.moveNumber}>
                    <Text style={styles.moveNumberText}>
                        {String(item.moveNumber).padStart(2, '0')}
                    </Text>
                </View>

                <View style={styles.moveContent}>
                    <Text style={styles.moveName}>
                        {item.move.name}
                    </Text>
                </View>

                <Text style={styles.moveArrow}>
                    ›
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <Image
                        source={require('../assets/back.png')}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>
                    Pokemon Moves
                </Text>

                <View style={styles.headerRight} />
            </View>

            <View style={styles.pokemonCard}>
                <View style={styles.smallImageContainer}>
                    <Image
                        source={{ uri: getPokemonImage(pokemon.id) }}
                        style={styles.smallImage}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.pokemonInfo}>
                    <Text style={styles.pokemonId}>
                        #{String(pokemon.id).padStart(3, '0')}
                    </Text>

                    <Text style={styles.pokemonName}>
                        {pokemon.name}
                    </Text>

                    <Text style={styles.movesCount}>
                        {pokemon.moves.length} available moves
                    </Text>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <Image
                    source={require('../assets/search.png')}
                    style={styles.searchIcon}
                />

                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search moves..."
                    placeholderTextColor="#999"
                    style={styles.searchInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                {search.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setSearch('')}
                        style={styles.clearButton}>
                        <Text style={styles.clearText}>
                            ×
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.resultContainer}>
                <Text style={styles.resultText}>
                    {filteredMoves.length}{' '}
                    {filteredMoves.length === 1
                        ? 'Move'
                        : 'Moves'}
                </Text>
            </View>

            <FlatList
                data={filteredMoves}
                keyExtractor={(item, index) =>
                    `${item.move.name}-${index}`
                }
                renderItem={renderMove}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>
                            No Moves Found
                        </Text>

                        <Text style={styles.emptyText}>
                            Try searching with another move name.
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

export default PokemonMovesScreen;

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
        backgroundColor: '#FFFFFF',
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

    pokemonCard: {
        marginHorizontal: 16,
        marginTop: 14,
        padding: 14,
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

    smallImageContainer: {
        width: 85,
        height: 85,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F3F8',
    },

    smallImage: {
        width: 78,
        height: 78,
    },

    pokemonInfo: {
        flex: 1,
        marginLeft: 14,
    },

    pokemonId: {
        fontSize: 12,
        fontWeight: '700',
        color: '#999',
    },

    pokemonName: {
        marginTop: 2,
        fontSize: 23,
        fontWeight: '900',
        color: '#222',
        textTransform: 'capitalize',
    },

    movesCount: {
        marginTop: 5,
        fontSize: 13,
        fontWeight: '600',
        color: '#888',
    },

    searchContainer: {
        height: 52,
        marginHorizontal: 16,
        marginTop: 14,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
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

    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
        tintColor: '#555',
    },

    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 15,
        color: '#222',
    },

    clearButton: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },

    clearText: {
        fontSize: 27,
        fontWeight: '300',
        color: '#777',
    },

    resultContainer: {
        paddingHorizontal: 18,
        paddingVertical: 12,
    },

    resultText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#888',
    },

    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
    },

    moveCard: {
        minHeight: 70,
        marginBottom: 10,
        padding: 12,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.04,
        shadowRadius: 5,
        elevation: 2,
    },

    moveNumber: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F3F8',
    },

    moveNumberText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#777',
    },

    moveContent: {
        flex: 1,
        marginLeft: 14,
    },

    moveName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#333',
        textTransform: 'capitalize',
    },

    moveArrow: {
        marginLeft: 8,
        fontSize: 27,
        fontWeight: '300',
        color: '#AAA',
    },

    emptyContainer: {
        alignItems: 'center',
        paddingTop: 80,
        paddingHorizontal: 30,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#333',
    },

    emptyText: {
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
        color: '#999',
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
