import React, { useMemo, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootState } from '../redux/store';
import { Pokemon, getPokemonImage } from '../types/pokemon';

const ComparePokemonScreen = ({ navigation }: any) => {

    const pokemonList = useSelector((state: RootState) => state.pokemon.pokemon);
    const [pokemon1Id, setPokemon1Id] = useState<number | null>(null);
    const [pokemon2Id, setPokemon2Id] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    const pokemon1 = useMemo(() => pokemonList.find(pokemon => pokemon.id === pokemon1Id), [pokemonList, pokemon1Id]);
    const pokemon2 = useMemo(() => pokemonList.find(pokemon => pokemon.id === pokemon2Id), [pokemonList, pokemon2Id]);

    const getTotalStats = (pokemon: Pokemon) => {
        let totalStats = 0;
        pokemon.stats.forEach(stat => { totalStats += stat.base_stat });
        return totalStats;
    };

    const totalStats1 = pokemon1 ? getTotalStats(pokemon1) : 0;
    const totalStats2 = pokemon2 ? getTotalStats(pokemon2) : 0;

    const winner = pokemon1 && pokemon2
        ? totalStats1 > totalStats2
            ? pokemon1
            : totalStats2 > totalStats1
                ? pokemon2
                : null
        : null;

    const isDraw = pokemon1 && pokemon2 && totalStats1 === totalStats2;

    const handleCompare = () => {
        if (!pokemon1Id || !pokemon2Id) {
            Alert.alert('Select Pokemon', 'Please select two Pokemon before comparing.');
            return;
        }

        if (pokemon1Id === pokemon2Id) {
            Alert.alert('Invalid Selection', 'Please select two different Pokemon.');
            return;
        }
        setShowResult(true);
    };

    const handleBattle = () => {
        if (!pokemon1Id || !pokemon2Id) {
            Alert.alert('Select Pokemon', 'Please select two Pokemon before battling.');
            return;
        }

        if (pokemon1Id === pokemon2Id) {
            Alert.alert('Invalid Selection', 'Please select two different Pokemon.');
            return;
        }
        navigation.navigate('Battle', { pokemon1Id, pokemon2Id });
    };

    const selectPokemon1 = (id: number) => {
        setPokemon1Id(id);
        setShowResult(false);
    };

    const selectPokemon2 = (id: number) => {
        setPokemon2Id(id);
        setShowResult(false);
    };

    const renderPokemonSelector = (title: string, selectedId: number | null, onSelect: (id: number) => void) => {
        return (
            <View style={styles.selectorSection}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.pokemonList}>
                    {pokemonList.map(pokemon => {
                        const isSelected = selectedId === pokemon.id;
                        return (
                            <TouchableOpacity
                                key={pokemon.id}
                                style={[styles.pokemonOption, isSelected && styles.selectedPokemonOption]}
                                onPress={() => onSelect(pokemon.id)}>
                                <Image
                                    source={{ uri: getPokemonImage(pokemon.id) }}
                                    style={styles.optionImage}
                                />
                                <Text style={styles.pokemonId}>#{String(pokemon.id).padStart(3, '0')}</Text>
                                <Text style={styles.pokemonName}>{pokemon.name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        );
    };

    const renderPokemonCard = (pokemon: Pokemon, totalStats: number, isWinner: boolean, isLoser: boolean) => {
        return (
            <View style={[styles.resultCard, isWinner && styles.winnerCard, isLoser && styles.loserCard]}>
                {isWinner && (
                    <View style={styles.winnerBadge}>
                        <Text style={styles.winnerBadgeText}>WINNER</Text>
                    </View>
                )}

                {isLoser && (
                    <View style={styles.loserBadge}>
                        <Text style={styles.loserBadgeText}>DEFEATED</Text>
                    </View>
                )}

                <Image
                    source={{ uri: getPokemonImage(pokemon.id) }}
                    style={styles.resultImage}
                />

                <Text style={styles.resultPokemonId}>#{String(pokemon.id).padStart(3, '0')}</Text>
                <Text style={styles.resultName}>{pokemon.name.toUpperCase()}</Text>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>TOTAL STATS</Text>
                    <Text style={styles.totalValue}>{totalStats}</Text>
                </View>
                <View style={styles.statsContainer}>
                    {pokemon.stats.map(stat => (
                        <View
                            key={stat.stat.name}
                            style={styles.statRow}>
                            <Text style={styles.statName}>{stat.stat.name}</Text>
                            <Text style={styles.statValue}>{stat.base_stat}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.heading}>Pokemon Compare</Text>
                    <Text style={styles.subtitle}>Choose two Pokemon and find out who is stronger!</Text>
                </View>

                {renderPokemonSelector('SELECT POKEMON 1', pokemon1Id, selectPokemon1)}
                {renderPokemonSelector('SELECT POKEMON 2', pokemon2Id, selectPokemon2)}

                <TouchableOpacity
                    style={[styles.compareButton, (!pokemon1Id || !pokemon2Id) && styles.disabledButton]}
                    onPress={handleCompare}
                    disabled={!pokemon1Id || !pokemon2Id}>
                    <Text style={styles.compareButtonText}>COMPARE POKEMON</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.battlePokemon, (!pokemon1Id || !pokemon2Id) && styles.disabledButton]}
                    onPress={handleBattle}
                    disabled={!pokemon1Id || !pokemon2Id}
                >
                    <Text style={styles.battlePokemonText}>BATTLE POKEMON</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.battlePokemon, {backgroundColor: 'green'}]}
                    onPress={() => navigation.navigate('TeamBattle')}
                >
                    <Text style={styles.battlePokemonText}>TEAM BATTLE</Text>
                </TouchableOpacity>

                {showResult && pokemon1 && pokemon2 && (
                    <View style={styles.resultSection}>
                        <Text style={styles.resultTitle}>RESULT</Text>
                        {isDraw ? (
                            <View style={styles.drawContainer}>
                                <Text style={styles.drawTitle}> IT'S A DRAW!</Text>
                                <Text style={styles.drawText}>Both Pokemon have the same total stats.</Text>
                            </View>
                        ) : (
                            <View style={styles.winnerContainer}>
                                <Text style={styles.winnerTitle}>{winner?.name.toUpperCase()} WINS!</Text>
                                <Text style={styles.winnerDescription}>Higher total stats means the winner.</Text>
                            </View>
                        )}

                        <View style={styles.resultCards}>
                            {renderPokemonCard(
                                pokemon1,
                                totalStats1,
                                winner?.id === pokemon1.id,
                                winner?.id !== pokemon1.id && !isDraw,
                            )}

                            <View style={styles.vsContainer}>
                                <Text style={styles.vsText}>VS</Text>
                            </View>

                            {renderPokemonCard(
                                pokemon2,
                                totalStats2,
                                winner?.id === pokemon2.id,
                                winner?.id !== pokemon2.id && !isDraw,
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FB',
    },

    content: {
        paddingBottom: 40,
        paddingLeft: 20,
    },

    header: {
        marginBottom: 25,
    },

    heading: {
        fontSize: 30,
        fontWeight: '800',
        color: '#1D1D1F',
    },

    subtitle: {
        fontSize: 14,
        color: '#777',
        marginTop: 8,
    },

    selectorSection: {
        marginBottom: 22,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#333',
        marginBottom: 12,
    },

    pokemonList: {
        paddingVertical: 5,
    },

    pokemonOption: {
        width: 105,
        height: 135,
        backgroundColor: '#FFF',
        borderRadius: 18,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },

    selectedPokemonOption: {
        borderColor: '#6C63FF',
        backgroundColor: '#EFEEFF',
    },

    optionImage: {
        width: 70,
        height: 70,
    },

    pokemonId: {
        fontSize: 11,
        color: '#888',
        marginTop: 2,
    },

    pokemonName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#333',
        marginTop: 3,
        maxWidth: 90,
    },

    compareButton: {
        height: 58,
        borderRadius: 18,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        marginRight: 20,
        elevation: 5,
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    },

    disabledButton: {
        backgroundColor: '#BFC1D1',
    },

    compareButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },

    battlePokemon: {
        height: 58,
        borderRadius: 18,
        backgroundColor: '#F54927',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        marginRight: 20,
        elevation: 5,
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    },

    battlePokemonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },

    resultSection: {
        marginTop: 35,
    },

    resultTitle: {
        fontSize: 22,
        fontWeight: '900',
        textAlign: 'center',
        color: '#222',
        marginBottom: 12,
    },

    winnerContainer: {
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 18,
        borderRadius: 18,
        marginBottom: 20,
    },

    winnerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#6C63FF',
    },

    winnerDescription: {
        color: '#777',
        marginTop: 5,
        fontSize: 13,
    },

    drawContainer: {
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 18,
        marginBottom: 20,
    },



    drawTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#6C63FF',
        marginTop: 5,
    },

    drawText: {
        color: '#777',
        marginTop: 5,
    },

    resultCards: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    resultCard: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 22,
        padding: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E5E5',
    },

    winnerCard: {
        borderColor: '#6C63FF',
        backgroundColor: '#F3F1FF',
    },

    loserCard: {
        opacity: 0.65,
    },

    winnerBadge: {
        backgroundColor: '#6C63FF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        marginBottom: 5,
    },

    winnerBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '900',
    },

    loserBadge: {
        backgroundColor: '#E6E6E6',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        marginBottom: 5,
    },

    loserBadgeText: {
        color: '#777',
        fontSize: 10,
        fontWeight: '900',
    },

    resultImage: {
        width: 110,
        height: 110,
    },

    resultPokemonId: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },

    resultName: {
        fontSize: 16,
        fontWeight: '900',
        color: '#222',
        marginTop: 3,
    },

    totalContainer: {
        alignItems: 'center',
        marginTop: 12,
        paddingVertical: 10,
        width: '100%',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
    },

    totalLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#888',
    },

    totalValue: {
        fontSize: 22,
        fontWeight: '900',
        color: '#6C63FF',
        marginTop: 2,
    },

    statsContainer: {
        width: '100%',
        marginTop: 10,
    },

    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },

    statName: {
        fontSize: 10,
        color: '#777',
    },

    statValue: {
        fontSize: 10,
        fontWeight: '800',
        color: '#333',
    },

    vsContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: -8,
        zIndex: 10,
    },

    vsText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '900',
    },
});

export default ComparePokemonScreen;