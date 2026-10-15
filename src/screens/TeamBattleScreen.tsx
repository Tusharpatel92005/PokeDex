import React, { useMemo, useRef, useState } from 'react';

import {
    Animated,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { getPokemonImage } from '../types/pokemon';

const MAX_HP = 200;

const TeamBattleScreen = ({ navigation }: any) => {

    const pokemonList = useSelector((state: RootState) => state.pokemon.pokemon,);

    const [team1Selected, setTeam1Selected] = useState<number | null>(null);
    const [team2Selected, setTeam2Selected] = useState<number | null>(null);

    const [battleStarted, setBattleStarted] = useState(false);
    const [battleOver, setBattleOver] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);

    const [team1HP, setTeam1HP] = useState<number[]>([MAX_HP, MAX_HP, MAX_HP]);
    const [team2HP, setTeam2HP] = useState<number[]>([MAX_HP, MAX_HP, MAX_HP]);

    const [team1Defeated, setTeam1Defeated] = useState<boolean[]>([false, false, false]);
    const [team2Defeated, setTeam2Defeated] = useState<boolean[]>([false, false, false]);

    const [team1UsedMoves, setTeam1UsedMoves] = useState<number[][]>([[], [], []]);
    const [team2UsedMoves, setTeam2UsedMoves] = useState<number[][]>([[], [], []]);

    const [damage, setDamage] = useState<number | null>(null);
    const [attacker, setAttacker] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const pokemon1AttackPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 }),).current;
    const pokemon2AttackPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 }),).current;

    const pokemon1Shake = useRef(new Animated.Value(0)).current;
    const pokemon2Shake = useRef(new Animated.Value(0)).current;

    const [battleRound, setBattleRound] = useState(0);

    const teams = useMemo(() => {
        if (pokemonList.length < 6) {
            return {
                team1: pokemonList.slice(0, 3),
                team2: pokemonList.slice(3, 6),
            };
        }

        const shuffledPokemon = [...pokemonList].sort(() => Math.random() - 0.5);

        return {
            team1: shuffledPokemon.slice(0, 3),
            team2: shuffledPokemon.slice(3, 6),
        };
    }, [pokemonList, battleRound]);

    const { team1, team2 } = teams;

    const selectedTeam1Pokemon = team1Selected !== null ? team1[team1Selected] : null;
    const selectedTeam2Pokemon = team2Selected !== null ? team2[team2Selected] : null;

    const getMoves = (pokemon: any) => {
        return pokemon?.moves?.slice(0, 3) ?? [];
    };

    const getAttack = (pokemon: any) => {
        const attackStat = pokemon?.stats?.find((stat: any) => stat.stat.name === 'attack');
        return attackStat?.base_stat ?? 0;
    };

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

    const resetBattleValues = () => {
        setTeam1HP([MAX_HP, MAX_HP, MAX_HP]);
        setTeam2HP([MAX_HP, MAX_HP, MAX_HP]);

        setTeam1Defeated([false, false, false]);
        setTeam2Defeated([false, false, false]);

        setTeam1UsedMoves([[], [], []]);
        setTeam2UsedMoves([[], [], []]);

        setDamage(null);
        setAttacker(null);
        setBattleOver(false);
        setWinner(null);
        setIsAnimating(false);

        pokemon1AttackPosition.setValue({ x: 0, y: 0 });
        pokemon2AttackPosition.setValue({ x: 0, y: 0 });

        pokemon1Shake.setValue(0);
        pokemon2Shake.setValue(0);
    };

    const startBattle = () => {
        if (team1.length !== 3 || team2.length !== 3) {
            return;
        }

        resetBattleValues();
        setTeam1Selected(0);
        setTeam2Selected(0);
        setBattleStarted(true);
    };

    const handleRetry = () => {
        resetBattleValues();
        setTeam1Selected(0);
        setTeam2Selected(0);
        setBattleStarted(true);
    };

    const handleNewBattle = () => {
        resetBattleValues();
        setTeam1Selected(null);
        setTeam2Selected(null);
        setBattleStarted(false);
        setBattleRound(prev => prev + 1);
    };

    const handleTeam1Selection = (index: number) => {
        if (isAnimating || team1Defeated[index]) {
            return;
        }
        setTeam1Selected(index);
    };

    const handleTeam2Selection = (index: number) => {
        if (isAnimating || team2Defeated[index]) {
            return;
        }
        setTeam2Selected(index);
    };

    const handlePokemon1Move = (moveIndex: number) => {
        if (
            !battleStarted ||
            battleOver ||
            isAnimating ||
            team1Selected === null ||
            team2Selected === null ||
            team1Defeated[team1Selected] ||
            team2Defeated[team2Selected]
        ) {
            return;
        }

        const selectedIndex = team1Selected;
        const targetIndex = team2Selected;

        const pokemon = team1[selectedIndex];
        const currentUsedMoves = team1UsedMoves[selectedIndex] ?? [];

        if (currentUsedMoves.includes(moveIndex)) {
            return;
        }

        const currentDamage = calculateDamage(getAttack(pokemon));
        const newHP = Math.max(team2HP[targetIndex] - currentDamage, 0);
        const updatedUsedMoves = [...currentUsedMoves, moveIndex];

        setIsAnimating(true);
        setAttacker(pokemon.name);
        setDamage(null);

        setTeam1UsedMoves(prev => {
            const updated = [...prev];

            if (updatedUsedMoves.length >= getMoves(pokemon).length) {
                updated[selectedIndex] = [];
            } else {
                updated[selectedIndex] = updatedUsedMoves;
            }

            return updated;
        });

        Animated.sequence([
            Animated.timing(pokemon1AttackPosition, {
                toValue: {
                    x: -220,
                    y: 290,
                },
                duration: 550,
                useNativeDriver: true,
            }),

            Animated.parallel([
                Animated.timing(pokemon1AttackPosition, {
                    toValue: {
                        x: -205,
                        y: 280,
                    },
                    duration: 80,
                    useNativeDriver: true,
                }),

                runShakeAnimation(pokemon2Shake),
            ]),
        ]).start(() => {
            setDamage(currentDamage);

            setTeam2HP(prev => {
                const updated = [...prev];
                updated[targetIndex] = newHP;
                return updated;
            });

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
                    setTeam2Defeated(prev => {
                        const updated = [...prev];
                        updated[targetIndex] = true;
                        return updated;
                    });

                    const allDefeated = team2Defeated.map((value, index) => index === targetIndex ? true : value).every(Boolean);

                    if (allDefeated) {
                        setBattleOver(true);
                        setWinner('TEAM 1');
                    } else {
                        setTeam2Selected(prev => {
                            if (prev !== null && !team2Defeated[prev]) {
                                return prev;
                            }

                            const nextAlive = team2.findIndex((_, index) =>
                                index !== targetIndex &&
                                !team2Defeated[index],
                            );

                            return nextAlive >= 0 ? nextAlive : null;
                        });
                    }
                }
            });
        });
    };

    const handlePokemon2Move = (moveIndex: number) => {
        if (
            !battleStarted ||
            battleOver ||
            isAnimating ||
            team1Selected === null ||
            team2Selected === null ||
            team1Defeated[team1Selected] ||
            team2Defeated[team2Selected]
        ) {
            return;
        }

        const selectedIndex = team2Selected;
        const targetIndex = team1Selected;

        const pokemon = team2[selectedIndex];
        const currentUsedMoves = team2UsedMoves[selectedIndex] ?? [];

        if (currentUsedMoves.includes(moveIndex)) {
            return;
        }

        const currentDamage = calculateDamage(getAttack(pokemon));

        const newHP = Math.max(team1HP[targetIndex] - currentDamage, 0);
        const updatedUsedMoves = [...currentUsedMoves, moveIndex];

        setIsAnimating(true);
        setAttacker(pokemon.name);
        setDamage(null);

        setTeam2UsedMoves(prev => {
            const updated = [...prev];

            if (updatedUsedMoves.length >= getMoves(pokemon).length) {
                updated[selectedIndex] = [];
            } else {
                updated[selectedIndex] = updatedUsedMoves;
            }

            return updated;
        });

        Animated.sequence([
            Animated.timing(pokemon2AttackPosition, {
                toValue: {
                    x: 220,
                    y: -290,
                },
                duration: 550,
                useNativeDriver: true,
            }),

            Animated.parallel([
                Animated.timing(pokemon2AttackPosition, {
                    toValue: {
                        x: 205,
                        y: -280,
                    },
                    duration: 80,
                    useNativeDriver: true,
                }),

                runShakeAnimation(pokemon1Shake),
            ]),
        ]).start(() => {
            setDamage(currentDamage);

            setTeam1HP(prev => {
                const updated = [...prev];
                updated[targetIndex] = newHP;
                return updated;
            });

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
                    setTeam1Defeated(prev => {
                        const updated = [...prev];
                        updated[targetIndex] = true;
                        return updated;
                    });

                    const allDefeated = team1Defeated.map((value, index) => index === targetIndex ? true : value).every(Boolean);

                    if (allDefeated) {
                        setBattleOver(true);
                        setWinner('TEAM 2');
                    } else {
                        setTeam1Selected(prev => {
                            if (prev !== null && !team1Defeated[prev]) {
                                return prev;
                            }

                            const nextAlive = team1.findIndex((_, index) =>
                                index !== targetIndex &&
                                !team1Defeated[index],
                            );

                            return nextAlive >= 0 ? nextAlive : null;
                        });
                    }
                }
            });
        });
    };

    if (pokemonList.length < 6) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>NOT ENOUGH POKEMON</Text>
                    <Text style={styles.errorText}>At least 6 POKEMON are required for a team battle.</Text>
                    <TouchableOpacity
                        style={styles.backButtonLarge}
                        activeOpacity={0.8}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>GO BACK</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    activeOpacity={0.7}
                    onPress={() => navigation.goBack()}
                >
                    <Image
                        source={require('../assets/back.png')}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>TEAM BATTLE</Text>
                    <Text style={styles.headerSubtitle}>{battleStarted ? 'BATTLE ARENA' : 'SELECT YOUR POKEMON'}</Text>
                </View>
                <View style={styles.headerRightSpace} />
            </View>

            <View style={styles.battleArea}>
                {!battleStarted && (
                    <View style={styles.vsBadge}>
                        <Text style={styles.vsText}>VS</Text>
                    </View>
                )}

                <View style={battleStarted && styles.team1Battle}>
                    {battleStarted && selectedTeam1Pokemon ? (
                        <View style={styles.battlePokemonArea}>
                            <View style={styles.battlePokemonInfo}>
                                <Text style={styles.battlePokemonName}>{selectedTeam1Pokemon.name.toUpperCase()}</Text>
                                <View style={styles.hpContainer}>
                                    <View style={styles.hpTopRow}>
                                        <Text style={styles.hpLabel}>HP</Text>
                                        <Text style={styles.hpValue}>{team1HP[team1Selected ?? 0]}</Text>
                                    </View>
                                    <View style={styles.hpBarBackground}>
                                        <View style={[styles.hpBar, { width: `${Math.max(((team1HP[team1Selected ?? 0] ?? 0) / MAX_HP) * 100, 0)}%` }]} />
                                    </View>
                                </View>

                                <View style={styles.movesContainer}>
                                    <Text style={styles.movesTitle}>MOVES</Text>

                                    {getMoves(selectedTeam1Pokemon).map(
                                        (move: any, index: number) => {
                                            const isUsed = team1UsedMoves[team1Selected ?? 0]?.includes(index);

                                            return (
                                                <TouchableOpacity
                                                    key={`${move.move?.name ?? move.name}-${index}`}
                                                    activeOpacity={0.7}
                                                    disabled={battleOver || isAnimating || isUsed || team2Selected === null}
                                                    onPress={() => handlePokemon1Move(index)}
                                                    style={[styles.moveRow, isUsed && styles.disabledMove]}
                                                >
                                                    <Text style={styles.moveNumber}>{index + 1}</Text>
                                                    <Text style={styles.moveName}>{move.move?.name}</Text>
                                                </TouchableOpacity>
                                            );
                                        },
                                    )}
                                </View>
                            </View>

                            <View
                                style={styles.battlePokemonImageContainer}
                            >
                                <Animated.View
                                    style={{
                                        transform: [
                                            ...getShakeTransform(pokemon1Shake)
                                                .transform,
                                            {
                                                translateX:
                                                    pokemon1AttackPosition.x,
                                            },
                                            {
                                                translateY:
                                                    pokemon1AttackPosition.y,
                                            },
                                        ],
                                    }}
                                >
                                    <Image
                                        source={{ uri: getPokemonImage(selectedTeam1Pokemon.id) }}
                                        style={styles.battlePokemonImage}
                                    />
                                </Animated.View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.selectionPokemonArea}>
                            {selectedTeam1Pokemon ? (
                                <>
                                    <Text style={[styles.pokemonName, styles.team1SelectionName]}>{selectedTeam1Pokemon.name.toUpperCase()}</Text>
                                    <Image
                                        source={{ uri: getPokemonImage(selectedTeam1Pokemon.id) }}
                                        style={[styles.pokemonImage, styles.team1SelectionImage]}
                                    />
                                </>
                            ) : (
                                <Text style={[styles.selectText, styles.team1SelectText]}>SELECT POKEMON</Text>
                            )}
                        </View>
                    )}

                    <View
                        style={[
                            styles.pokeballRow,
                            battleStarted &&
                            styles.battlePokeballRow,
                            styles.team1PokeballRow,
                        ]}
                    >
                        {team1.map((pokemon, index) => {
                            const isSelected = team1Selected === index;
                            const isDefeated = team1Defeated[index];

                            return (
                                <TouchableOpacity
                                    key={pokemon.id}
                                    activeOpacity={0.7}
                                    disabled={isAnimating || isDefeated}
                                    onPress={() => handleTeam1Selection(index)}
                                    style={[
                                        styles.pokeballButton,
                                        isSelected &&
                                        styles.pokeballButtonSelected,
                                        isDefeated &&
                                        styles.disabledPokeball,
                                    ]}
                                >
                                    <Image
                                        source={require('../assets/pokeball.png')}
                                        style={[styles.pokeball, isSelected && styles.pokeballSelected]}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={[styles.team2, battleStarted && styles.team2Battle]}>
                    {battleStarted && selectedTeam2Pokemon ? (
                        <View style={styles.battlePokemonArea}>
                            <View style={styles.battlePokemonImageContainer}>
                                <Animated.View
                                    style={{
                                        transform: [
                                            ...getShakeTransform(pokemon2Shake)
                                                .transform,
                                            {
                                                translateX:
                                                    pokemon2AttackPosition.x,
                                            },
                                            {
                                                translateY:
                                                    pokemon2AttackPosition.y,
                                            },
                                        ],
                                    }}
                                >
                                    <Image
                                        source={{ uri: getPokemonImage(selectedTeam2Pokemon.id) }}
                                        style={styles.battlePokemonImage}
                                    />
                                </Animated.View>
                            </View>

                            <View style={styles.battlePokemonInfo}>
                                <Text style={[styles.battlePokemonName, styles.team2PokemonName]}>{selectedTeam2Pokemon.name.toUpperCase()}</Text>
                                <View style={styles.hpContainer}>
                                    <View style={styles.hpTopRow}>
                                        <Text style={styles.hpLabel}>HP</Text>
                                        <Text style={styles.hpValue}>{team2HP[team2Selected ?? 0]}</Text>
                                    </View>
                                    <View style={styles.hpBarBackground}>
                                        <View style={[styles.hpBar, { width: `${Math.max(((team2HP[team2Selected ?? 0] ?? 0) / MAX_HP) * 100, 0)}%` }]} />
                                    </View>
                                </View>

                                <View style={styles.movesContainer}>
                                    <Text style={styles.movesTitle}>MOVES</Text>
                                    {getMoves(selectedTeam2Pokemon).map((move: any, index: number) => {
                                        const isUsed = team2UsedMoves[team2Selected ?? 0]?.includes(index);
                                        return (
                                            <TouchableOpacity
                                                key={`${move.move?.name}-${index}`}
                                                activeOpacity={0.7}
                                                disabled={battleOver || isAnimating || isUsed || team1Selected === null}
                                                onPress={() => handlePokemon2Move(index)}
                                                style={[styles.moveRow, isUsed && styles.disabledMove]}
                                            >
                                                <Text style={styles.moveNumber}>{index + 1}</Text>
                                                <Text style={styles.moveName} >{move.move?.name}</Text>
                                            </TouchableOpacity>
                                        );
                                    },
                                    )}
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.selectionPokemonArea}>
                            {selectedTeam2Pokemon ? (
                                <>
                                    <Image
                                        source={{ uri: getPokemonImage(selectedTeam2Pokemon.id) }}
                                        style={[styles.pokemonImage, styles.team2SelectionImage]}
                                    />
                                    <Text style={[styles.pokemonName, styles.team2Name, styles.team2SelectionName]}>{selectedTeam2Pokemon.name.toUpperCase()}</Text>
                                </>
                            ) : (
                                <Text style={[styles.selectText, styles.team2SelectText]}>SELECT POKEMON</Text>
                            )}
                        </View>
                    )}

                    <View style={[styles.pokeballRow, battleStarted && styles.battlePokeballRow, styles.team2PokeballRow]}>
                        {team2.map((pokemon, index) => {
                            const isSelected = team2Selected === index;
                            const isDefeated = team2Defeated[index];

                            return (
                                <TouchableOpacity
                                    key={pokemon.id}
                                    activeOpacity={0.7}
                                    disabled={isAnimating || isDefeated}
                                    onPress={() => handleTeam2Selection(index)}
                                    style={[styles.pokeballButton, isSelected && styles.pokeballButtonSelected, isDefeated && styles.disabledPokeball]}
                                >
                                    <Image
                                        source={require('../assets/pokeball.png')}
                                        style={[styles.pokeball, isSelected && styles.pokeballSelected]}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {battleStarted && damage !== null && (
                    <View style={styles.damageContainer}>
                        <Text style={styles.damageNumber}>-{damage}</Text>
                        <Text style={styles.damageLabel}>{attacker}</Text>
                    </View>
                )}

                {battleStarted && battleOver && winner && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultTitle}>BATTLE OVER!</Text>
                        <Text style={styles.resultText}>{winner} WINS!</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            activeOpacity={0.8}
                            onPress={handleRetry}
                        >
                            <Text style={styles.retryButtonText}>RETRY BATTLE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.newBattleButton}
                            activeOpacity={0.8}
                            onPress={handleNewBattle}
                        >
                            <Text style={styles.newBattleButtonText}>NEW BATTLE</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {!battleStarted && (
                <View style={styles.bottomSection}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        disabled={team1Selected === null || team2Selected === null}
                        onPress={startBattle}
                        style={[styles.startButton, (team1Selected === null || team2Selected === null) && styles.startButtonDisabled]}
                    >
                        <Text style={styles.startButtonText}>START BATTLE</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },

    header: {
        height: 90,
        paddingTop: 45,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#ECEEF2',
    },

    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    backIcon: {
        width: 23,
        height: 23,
        resizeMode: 'contain',
    },

    headerTitleContainer: {
        alignItems: 'center',
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#17191E',
    },

    headerSubtitle: {
        marginTop: 3,
        fontSize: 8,
        fontWeight: '800',
        color: '#999DA6',
    },

    headerRightSpace: {
        width: 40,
    },

    battleArea: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
    },

    vsBadge: {
        position: 'absolute',
        width: 54,
        height: 54,
        borderRadius: 27,
        left: '50%',
        top: '50%',
        marginLeft: -27,
        marginTop: -27,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#20232A',
        borderWidth: 4,
        borderColor: '#F7F8FA',
        zIndex: 20,
    },

    vsText: {
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 1,
        color: '#FFFFFF',
    },

    team1Battle: {
        top: 14,
    },

    team2: {
        position: 'absolute',
        bottom: 18,
        left: 16,
        width: '57%',
        alignItems: 'stretch',
    },

    team2Battle: {
        bottom: 14,
    },

    selectionPokemonArea: {
        height: 155,
        alignItems: 'center',
        justifyContent: 'center',
    },

    pokemonImage: {
        width: 145,
        height: 145,
        resizeMode: 'contain',
        marginBottom: 20,
    },

    pokemonName: {
        fontSize: 15,
        fontWeight: '900',
        textAlign: 'center',
        color: '#20232A',
        marginTop: 50,
        width: '100%',
    },

    team1SelectionName: {
        marginLeft: -220,
    },

    team1SelectionImage: {
        marginLeft: -200,
    },

    team2Name: {
        marginTop: -10,
    },

    team2SelectionImage: {
        marginLeft: 310,
    },

    team2SelectionName: {
        marginRight: -310,
    },

    selectText: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
        color: '#B0B3BA',
    },

    team1SelectText: {
        marginLeft: -200,
    },

    team2SelectText: {
        marginRight: -300,
    },

    pokeballRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },

    team1PokeballRow: {
        marginRight: 200,
    },

    team2PokeballRow: {
        marginLeft: 270,
    },

    battlePokeballRow: {
        marginTop: 4,
    },

    pokeballButton: {
        width: 52,
        height: 52,
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },

    pokeballButtonSelected: {
        transform: [{ scale: 1.12 }],
    },

    disabledPokeball: {
        opacity: 0.25,
    },

    pokeball: {
        width: 43,
        height: 43,
        resizeMode: 'contain',
        opacity: 0.35,
        marginTop: 30,
    },

    pokeballSelected: {
        opacity: 1,
    },

    battlePokemonArea: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    battlePokemonImageContainer: {
        width: 150,
        height: 150,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginRight: 25,
        marginTop: 25,
    },

    battlePokemonImage: {
        width: 175,
        height: 175,
        resizeMode: 'contain',
    },

    battlePokemonInfo: {
        paddingHorizontal: 3,
        height: 150,
        width: 150,
        marginLeft: 15,
        marginTop: 20,
    },

    battlePokemonName: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 0.7,
        color: '#20232A',
        marginBottom: 8,
    },

    team2PokemonName: {
        textAlign: 'right',
    },

    hpContainer: {
        width: '100%',
        marginBottom: 10,
    },

    hpTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },

    hpLabel: {
        fontSize: 7,
        fontWeight: '900',
        letterSpacing: 0.8,
        color: '#888D97',
    },

    hpValue: {
        fontSize: 8,
        fontWeight: '900',
        color: '#20232A',
    },

    hpBarBackground: {
        width: '100%',
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: '#E2E4E8',
    },

    hpBar: {
        height: 8,
        borderRadius: 3,
        backgroundColor: 'red',
    },

    movesContainer: {
        width: '100%',
    },

    movesTitle: {
        marginBottom: 5,
        fontSize: 7,
        fontWeight: '900',
        letterSpacing: 1,
        color: '#999DA6',
    },

    moveRow: {
        minHeight: 24,
        marginBottom: 4,
        paddingHorizontal: 5,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
    },

    disabledMove: {
        opacity: 0.35,
    },

    moveNumber: {
        width: 14,
        fontSize: 7,
        fontWeight: '900',
        color: '#A0A4AC',
    },

    moveName: {
        flex: 1,
        fontSize: 7,
        fontWeight: '800',
        color: '#3B3F47',
    },

    bottomSection: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#ECEEF2',
    },

    startButton: {
        height: 48,
        marginTop: 5,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#20232A',
    },

    startButtonDisabled: {
        opacity: 0.3,
    },

    startButtonText: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.2,
        color: '#FFFFFF',
    },

    damageContainer: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 120,
        marginLeft: -60,
        marginTop: -50,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 30,
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
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 200,
        marginLeft: -100,
        marginTop: -75,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 40,
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
        backgroundColor: '#20232A',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
    },

    retryButtonText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.8,
    },

    newBattleButton: {
        marginTop: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#20232A',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
    },

    newBattleButtonText: {
        color: '#20232A',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.8,
    },

    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },

    errorTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#20232A',
    },

    errorText: {
        marginTop: 8,
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '600',
        textAlign: 'center',
        color: '#858A95',
    },

    backButtonLarge: {
        marginTop: 20,
        paddingHorizontal: 22,
        paddingVertical: 11,
        borderRadius: 11,
        backgroundColor: '#20232A',
    },

    backButtonText: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.6,
        color: '#FFFFFF',
    },
});

export default TeamBattleScreen;
