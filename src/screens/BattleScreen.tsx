import React, { useMemo, useRef, useState } from 'react';

import {
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootState } from '../redux/store';
import { getPokemonImage } from '../types/pokemon';

const BattleScreen = ({ route, navigation }: any) => {
    const MAX_HP = 200;

    const [pokemon1HP, setPokemon1HP] = useState(MAX_HP);
    const [pokemon2HP, setPokemon2HP] = useState(MAX_HP);

    const [damage, setDamage] = useState<number | null>(null);
    const [attacker, setAttacker] = useState<string | null>(null);

    const [battleStarted, setBattleStarted] = useState(false);
    const [battleOver, setBattleOver] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const [pokemon1UsedMoves, setPokemon1UsedMoves] = useState<number[]>([]);
    const [pokemon2UsedMoves, setPokemon2UsedMoves] = useState<number[]>([]);

    const pokemon1AttackPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const pokemon2AttackPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

    const pokemon1Shake = useRef(new Animated.Value(0)).current;
    const pokemon2Shake = useRef(new Animated.Value(0)).current;

    const { pokemon1Id, pokemon2Id } = route.params;

    const pokemonList = useSelector((state: RootState) => state.pokemon.pokemon);

    const pokemon1 = useMemo(() =>
        pokemonList.find(pokemon => pokemon.id === pokemon1Id),
        [pokemonList, pokemon1Id]
    );

    const pokemon2 = useMemo(() =>
        pokemonList.find(pokemon => pokemon.id === pokemon2Id),
        [pokemonList, pokemon2Id]
    );

    if (!pokemon1 || !pokemon2) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Pokemon not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const pokemon1Moves = pokemon1.moves?.slice(0, 3) ?? [];
    const pokemon2Moves = pokemon2.moves?.slice(0, 3) ?? [];

    const getAttack = (pokemon: typeof pokemon1) => {
        const attackStat = pokemon.stats?.find(stat => stat.stat.name === 'attack');
        return attackStat?.base_stat ?? 0;
    };

    const pokemon1Attack = getAttack(pokemon1);
    const pokemon2Attack = getAttack(pokemon2);

    const calculateDamage = (attack: number) => {
        const minDamage = Math.ceil(attack * 0.5);
        const maxDamage = Math.floor(attack);

        if (maxDamage <= 0) {
            return 0;
        }

        return (
            Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage
        );
    };

    const runShakeAnimation = (shakeValue: Animated.Value) => {
        return Animated.sequence([
            Animated.timing(shakeValue, {
                toValue: 1,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeValue, {
                toValue: -1,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeValue, {
                toValue: 1,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeValue, {
                toValue: -1,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeValue, {
                toValue: 0,
                duration: 50,
                useNativeDriver: true,
            }),
        ]);
    };

    const getShakeTransform = (shakeValue: Animated.Value) => {
        return {
            transform: [
                {
                    translateX: shakeValue.interpolate({
                        inputRange: [-1, 1],
                        outputRange: [-10, 10],
                    }),
                },
            ],
        };
    };

    const handleStartBattle = () => {
        setBattleStarted(true);
        setBattleOver(false);
        setWinner(null);
        setDamage(null);
        setAttacker(null);
        setPokemon1HP(MAX_HP);
        setPokemon2HP(MAX_HP);
        setPokemon1UsedMoves([]);
        setPokemon2UsedMoves([]);
    };

    const handlePokemon1Move = (moveIndex: number) => {
        if (
            !battleStarted ||
            battleOver ||
            isAnimating ||
            pokemon2HP <= 0 ||
            pokemon1UsedMoves.includes(moveIndex)
        ) {
            return;
        }

        const currentDamage = calculateDamage(pokemon1Attack);
        const newHP = Math.max(pokemon2HP - currentDamage, 0);

        setIsAnimating(true);
        setAttacker(pokemon1.name);

        const updatedUsedMoves = [...pokemon1UsedMoves, moveIndex];

        if (updatedUsedMoves.length >= pokemon1Moves.length) {
            setPokemon1UsedMoves([]);
        } else {
            setPokemon1UsedMoves(updatedUsedMoves);
        }

        Animated.sequence([
            Animated.timing(pokemon1AttackPosition, {
                toValue: {
                    x: -220,
                    y: 180,
                },
                duration: 550,
                useNativeDriver: true,
            }),

            Animated.parallel([
                Animated.timing(pokemon1AttackPosition, {
                    toValue: {
                        x: -205,
                        y: 170,
                    },
                    duration: 80,
                    useNativeDriver: true,
                }),

                runShakeAnimation(pokemon2Shake),
            ]),
        ]).start(() => {
            setDamage(currentDamage);
            setPokemon2HP(newHP);

            Animated.timing(pokemon1AttackPosition, {
                toValue: {
                    x: 0,
                    y: 0,
                },
                duration: 350,
                useNativeDriver: true,
            }).start(() => {
                setDamage(null);
                setAttacker(null);
                setIsAnimating(false);

                if (newHP === 0) {
                    setBattleOver(true);
                    setWinner(pokemon1.name);
                }
            });
        });
    };

    const handlePokemon2Move = (moveIndex: number) => {
        if (
            !battleStarted ||
            battleOver ||
            isAnimating ||
            pokemon1HP <= 0 ||
            pokemon2UsedMoves.includes(moveIndex)
        ) {
            return;
        }

        const currentDamage = calculateDamage(pokemon2Attack);
        const newHP = Math.max(pokemon1HP - currentDamage, 0);

        setIsAnimating(true);
        setAttacker(pokemon2.name);

        const updatedUsedMoves = [...pokemon2UsedMoves, moveIndex];

        if (updatedUsedMoves.length >= pokemon2Moves.length) {
            setPokemon2UsedMoves([]);
        } else {
            setPokemon2UsedMoves(updatedUsedMoves);
        }

        Animated.sequence([
            Animated.timing(pokemon2AttackPosition, {
                toValue: {
                    x: 220,
                    y: -170,
                },
                duration: 550,
                useNativeDriver: true,
            }),

            Animated.parallel([
                Animated.timing(pokemon2AttackPosition, {
                    toValue: {
                        x: 205,
                        y: -160,
                    },
                    duration: 80,
                    useNativeDriver: true,
                }),

                runShakeAnimation(pokemon1Shake),
            ]),
        ]).start(() => {
            setDamage(currentDamage);
            setPokemon1HP(newHP);

            Animated.timing(pokemon2AttackPosition, {
                toValue: {
                    x: 0,
                    y: 0,
                },
                duration: 350,
                useNativeDriver: true,
            }).start(() => {
                setDamage(null);
                setAttacker(null);
                setIsAnimating(false);

                if (newHP === 0) {
                    setBattleOver(true);
                    setWinner(pokemon2.name);
                }
            });
        });
    };

    const handleRetry = () => {
        pokemon1AttackPosition.setValue({ x: 0, y: 0 });
        pokemon2AttackPosition.setValue({ x: 0, y: 0 });

        pokemon1Shake.setValue(0);
        pokemon2Shake.setValue(0);

        setPokemon1HP(MAX_HP);
        setPokemon2HP(MAX_HP);

        setDamage(null);
        setAttacker(null);

        setBattleStarted(false);
        setBattleOver(false);
        setWinner(null);
        setIsAnimating(false);

        setPokemon1UsedMoves([]);
        setPokemon2UsedMoves([]);
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
                <Text style={styles.headerTitle}>Pokemon Battle</Text>
                <View style={styles.headerRight} />
            </View>

            <View style={styles.battleArena}>
                <View style={styles.pokemon1Container}>
                    <Text style={styles.pokemonName}>{pokemon1.name.toUpperCase()}</Text>
                    <View style={styles.hpContainer}>
                        <View style={styles.hpHeader}>
                            <Text style={styles.hpLabel}>HP</Text>
                            <Text style={styles.hpText}>{pokemon1HP} / {MAX_HP}</Text>
                        </View>
                        <View style={styles.hpBarBackground}>
                            <View style={[styles.hpBar, { width: `${Math.max((pokemon1HP / MAX_HP) * 100, 0)}%` }]} />
                        </View>
                    </View>
                    <View style={styles.movesContainer}>
                        <Text style={styles.movesTitle}>Choose Move</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.movesScrollContent}
                        >
                            {pokemon1Moves.map((move, index) => {

                                const isUsed = pokemon1UsedMoves.includes(index);
                                return (
                                    <TouchableOpacity
                                        key={`${move.move.name}-${index}`}
                                        style={[styles.moveItem, isUsed && styles.disabledMove]}
                                        activeOpacity={0.7}
                                        disabled={!battleStarted || battleOver || isAnimating || isUsed}
                                        onPress={() => handlePokemon1Move(index)}
                                    >
                                        <Text style={styles.moveName}>{move.move.name}</Text>
                                    </TouchableOpacity>
                                );
                            }
                            )}
                        </ScrollView>
                    </View>
                    <Animated.View style={[{
                        transform: [
                            ...getShakeTransform(pokemon1Shake).transform,
                            { translateX: pokemon1AttackPosition.x },
                            { translateY: pokemon1AttackPosition.y }]
                    }]}
                    >
                        <Image source={{ uri: getPokemonImage(pokemon1.id) }} style={styles.pokemonImage} />
                    </Animated.View>
                </View>

                <View style={styles.battleCenter}>

                    {!battleStarted && !battleOver && (
                        <View style={styles.startContainer}>
                            <View style={styles.vsContainer}>
                                <Text style={styles.vsText}>VS</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.startButton}
                                activeOpacity={0.8}
                                onPress={handleStartBattle}
                            >
                                <Text style={styles.startButtonText}>Start Battle</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {battleStarted && !battleOver && damage !== null && (
                        <View style={styles.damageContainer}>
                            <Text style={styles.damageNumber}>-{damage}</Text>
                            <Text style={styles.damageLabel}>{attacker}</Text>
                        </View>
                    )}

                    {battleOver && (
                        <View style={styles.resultContainer}>
                            <Text style={styles.resultTitle}>Battle Over!</Text>
                            <Text style={styles.resultText}>{winner?.toUpperCase()} WINS!</Text>
                            <TouchableOpacity
                                style={styles.retryButton}
                                activeOpacity={0.8}
                                onPress={handleRetry}
                            >
                                <Text style={styles.retryButtonText}>Retry Battle</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.pokemon2Container}>
                    <Animated.View style={[{
                        transform: [
                            ...getShakeTransform(pokemon2Shake).transform,
                            { translateX: pokemon2AttackPosition.x },
                            { translateY: pokemon2AttackPosition.y }],
                    }]}
                    >
                        <Image source={{ uri: getPokemonImage(pokemon2.id) }} style={styles.pokemonImage} />
                    </Animated.View>
                    <Text style={styles.pokemonName}>{pokemon2.name.toUpperCase()}</Text>
                    <View style={styles.hpContainer}>
                        <View style={styles.hpHeader}>
                            <Text style={styles.hpLabel}>HP</Text>
                            <Text style={styles.hpText}>{pokemon2HP} / {MAX_HP}</Text>
                        </View>

                        <View style={styles.hpBarBackground}>
                            <View style={[styles.hpBar, { width: `${Math.max((pokemon2HP / MAX_HP) * 100, 0)}%` }]} />
                        </View>
                    </View>

                    <View style={styles.movesContainer}>
                        <Text style={styles.movesTitle}>Choose Move</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.movesScrollContent}
                        >
                            {pokemon2Moves.map((move, index) => {

                                const isUsed = pokemon2UsedMoves.includes(index);
                                return (
                                    <TouchableOpacity
                                        key={`${move.move.name}-${index}`}
                                        style={[styles.moveItem, isUsed && styles.disabledMove]}
                                        activeOpacity={0.7}
                                        disabled={!battleStarted || battleOver || isAnimating || isUsed}
                                        onPress={() => handlePokemon2Move(index)}
                                    >
                                        <Text style={styles.moveName}>{move.move.name}</Text>
                                    </TouchableOpacity>
                                );
                            }
                            )}
                        </ScrollView>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FB',
    },

    header: {
        height: 90,
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

    battleArena: {
        flex: 1,
        position: 'relative',
        padding: 20,
    },

    pokemon1Container: {
        position: 'absolute',
        right: 20,
        width: 170,
        alignItems: 'center',
        padding: 10,
    },

    pokemon2Container: {
        position: 'absolute',
        bottom: 0,
        left: 20,
        width: 170,
        alignItems: 'center',
        padding: 10,
    },

    pokemonName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#222',
        textAlign: 'center',
    },

    pokemonImage: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },

    hpContainer: {
        width: '100%',
        marginTop: 8,
    },

    hpHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },

    hpLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: '#555',
    },

    hpText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#555',
    },

    hpBarBackground: {
        width: '100%',
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 10,
        overflow: 'hidden',
    },

    hpBar: {
        height: '100%',
        backgroundColor: '#E53935',
        borderRadius: 10,
    },

    movesContainer: {
        width: '100%',
        marginTop: 10,
    },

    movesTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: '#555',
        marginBottom: 5,
    },

    movesScrollContent: {
        paddingRight: 5,
    },

    moveItem: {
        width: 95,
        minHeight: 45,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F1F1',
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 5,
        marginRight: 6,
        borderWidth: 2,
        borderColor: 'red',
    },

    disabledMove: {
        opacity: 0.35,
    },

    moveName: {
        fontSize: 12,
        fontWeight: '900',
        color: 'black',
        textAlign: 'center',
    },

    battleCenter: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -90 }, { translateY: -60 }],
        width: 180,
        alignItems: 'center',
        justifyContent: 'center',
    },

    startContainer: {
        alignItems: 'center',
    },

    vsContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        marginBottom: 12,
        marginRight: -35,
        marginTop: 13,
    },

    vsText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
    },

    startButton: {
        backgroundColor: '#222',
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: 12,
        marginRight: -35,
    },

    startButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '900',
    },

    damageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    damageNumber: {
        fontSize: 28,
        fontWeight: '900',
        color: '#E53935',
    },

    damageLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#555',
        marginTop: 2,
    },

    resultContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 180,
        marginTop: 25,
    },

    resultTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#222',
        marginBottom: 5,
    },

    resultText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#E53935',
        marginBottom: 12,
        textAlign: 'center',
    },

    retryButton: {
        backgroundColor: '#222',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
    },

    retryButtonText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '900',
    },

    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    errorText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#777',
    },
});

export default BattleScreen;