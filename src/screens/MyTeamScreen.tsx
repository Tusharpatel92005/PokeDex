import React, {useEffect, useMemo, useState, useRef} from 'react';

import {
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  ScrollViewInstance,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {Pokemon, getPokemonImage} from '../types/pokemon';
import {SafeAreaView} from 'react-native-safe-area-context';

type TypeRelation = {
  name: string;
  url: string;
};

type PokemonTypeResponse = {
  damage_relations: {
    double_damage_from: TypeRelation[];
    double_damage_to: TypeRelation[];
  };
};

const MyTeamScreen = () => {

  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const pokemonList = useSelector(
    (state: RootState) => state.pokemon.pokemon,
  );

  const [selectedPokemonIds, setSelectedPokemonIds] = useState<number[]>([]);
  const [isTeamCreated, setIsTeamCreated] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [loadingAnalyzer, setLoadingAnalyzer] = useState(false);

  const selectedPokemon = useMemo(() => {
    return selectedPokemonIds
      .map(id => pokemonList.find(pokemon => pokemon.id === id))
      .filter(Boolean) as Pokemon[];
  }, [selectedPokemonIds, pokemonList]);

  const teamStats = useMemo(() => {
    if (selectedPokemon.length === 0) {
      return {
        hp: 0,
        attack: 0,
        defense: 0,
        speed: 0,
        total: 0,
      };
    }

    let hp = 0;
    let attack = 0;
    let defense = 0;
    let speed = 0;
    let total = 0;

    selectedPokemon.forEach(pokemon => {
      pokemon.stats.forEach(stat => {
        total += stat.base_stat;

        if (stat.stat.name === 'hp') {
          hp += stat.base_stat;
        }

        if (stat.stat.name === 'attack') {
          attack += stat.base_stat;
        }

        if (stat.stat.name === 'defense') {
          defense += stat.base_stat;
        }

        if (stat.stat.name === 'speed') {
          speed += stat.base_stat;
        }
      });
    });

    return {
      hp,
      attack,
      defense,
      speed,
      total,
    };
  }, [selectedPokemon]);

  const fetchTeamAnalysis = async () => {
    if (selectedPokemon.length === 0) {
      setStrengths([]);
      setWeaknesses([]);
      return;
    }

    try {
      setLoadingAnalyzer(true);

      const typeUrls = new Set<string>();

      selectedPokemon.forEach(pokemon => {
        pokemon.types.forEach(item => {
          typeUrls.add(item.type.url);
        });
      });

      const responses = await Promise.all(
        Array.from(typeUrls).map(async url => {
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error('Failed to fetch Pokemon type data');
          }

          return response.json() as Promise<PokemonTypeResponse>;
        }),
      );

      const strengthSet = new Set<string>();
      const weaknessSet = new Set<string>();

      responses.forEach(typeData => {
        typeData.damage_relations.double_damage_to.forEach(type => {
          strengthSet.add(type.name);
        });

        typeData.damage_relations.double_damage_from.forEach(type => {
          weaknessSet.add(type.name);
        });
      });

      setStrengths(Array.from(strengthSet));
      setWeaknesses(Array.from(weaknessSet));
    } catch (error) {
      console.log('Error fetching team analysis:', error);
      setStrengths([]);
      setWeaknesses([]);
    } finally {
      setLoadingAnalyzer(false);
    }
  };

  useEffect(() => {
    if (showAnalyzer) {
      fetchTeamAnalysis();
    }
  }, [showAnalyzer]);

  const analyzerScore = useMemo(() => {
    if (selectedPokemon.length === 0) {
      return 0;
    }

    const statScore = Math.min(
      30,
      Math.round((teamStats.total / 3600) * 30),
    );

    const strengthScore = Math.min(35, strengths.length * 5);

    const weaknessScore = Math.max(
      0,
      35 - weaknesses.length * 3,
    );

    return Math.min(
      100,
      Math.max(
        0,
        statScore + strengthScore + weaknessScore,
      ),
    );
  }, [
    selectedPokemon.length,
    teamStats.total,
    strengths,
    weaknesses,
  ]);

  const handlePokemonPress = (id: number) => {
    if (isTeamCreated && !isUpdating) {
      return;
    }

    if (selectedPokemonIds.includes(id)) {
      setSelectedPokemonIds(prev =>
        prev.filter(pokemonId => pokemonId !== id),
      );
      return;
    }

    if (selectedPokemonIds.length >= 6) {
      Alert.alert(
        'Team Full',
        'You can select maximum 6 Pokemon.',
      );
      return;
    }

    setSelectedPokemonIds(prev => [...prev, id]);
  };

  const handleCreateTeam = () => {
    if (selectedPokemonIds.length !== 6) {
      Alert.alert(
        'Incomplete Team',
        'Please select 6 Pokemon to create your team.',
      );
      return;
    }
  
    setIsTeamCreated(true);
    setIsUpdating(false);
  
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    }, 100);
  
    Alert.alert(
      'Team Created',
      'Your Pokemon team has been created successfully!',
    );
  };

  const handleUpdateTeam = () => {
    setIsUpdating(true);
    setShowAnalyzer(false);
  };

  const handleSaveUpdate = () => {
    if (selectedPokemonIds.length !== 6) {
      Alert.alert(
        'Incomplete Team',
        'Your team must contain 6 Pokemon.',
      );
      return;
    }

    setIsUpdating(false);

    Alert.alert(
      'Team Updated',
      'Your Pokemon team has been updated successfully!',
    );
  };

  const handleDeleteTeam = () => {
    Alert.alert(
      'Delete Team',
      'Are you sure you want to delete your team?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSelectedPokemonIds([]);
            setIsTeamCreated(false);
            setIsUpdating(false);
            setShowAnalyzer(false);
            setStrengths([]);
            setWeaknesses([]);
          },
        },
      ],
    );
  };

  const handleClearTeam = () => {
    if (isTeamCreated && !isUpdating) {
      return;
    }

    setSelectedPokemonIds([]);
  };

  const renderSelectedPokemon = (
    pokemon: Pokemon,
    index: number,
  ) => {
    return (
      <View style={styles.teamPokemon} key={pokemon.id}>
        <View style={styles.teamNumber}>
          <Text style={styles.teamNumberText}>
            {index + 1}
          </Text>
        </View>

        {isUpdating && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handlePokemonPress(pokemon.id)}>
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        )}

        <Image
          source={{
            uri: getPokemonImage(pokemon.id),
          }}
          style={styles.teamImage}
        />

        <Text
          style={styles.teamName}
          numberOfLines={1}>
          {pokemon.name}
        </Text>
      </View>
    );
  };

  const renderPokemon = ({item}: {item: Pokemon}) => {
    const selected = selectedPokemonIds.includes(item.id);
    const disabled = isTeamCreated && !isUpdating;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handlePokemonPress(item.id)}
        disabled={disabled}
        style={[
          styles.pokemonCard,
          selected && styles.selectedCard,
          disabled && styles.disabledCard,
        ]}>
        {selected && (
          <View style={styles.checkCircle}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        )}

        <Image
          source={{
            uri: getPokemonImage(item.id),
          }}
          style={styles.pokemonImage}
        />

        <Text style={styles.pokemonId}>
          #{String(item.id).padStart(3, '0')}
        </Text>

        <Text
          style={styles.pokemonName}
          numberOfLines={1}>
          {item.name}
        </Text>

        <View style={styles.typesContainer}>
          {item.types.map(type => (
            <View
              key={`${item.id}-${type.type.name}`}
              style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {type.type.name}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>My Team</Text>
          <Text style={styles.subtitle}>
            {isTeamCreated
              ? isUpdating
                ? 'Update your Pokemon team'
                : 'Your Pokemon team'
              : 'Select up to 6 Pokemon'}
          </Text>
        </View>

        <View style={styles.countBox}>
          <Text style={styles.countText}>
            {selectedPokemonIds.length}/6
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Your Team
              </Text>

              {isTeamCreated && !isUpdating && (
                <Text style={styles.createdText}>
                  Team locked
                </Text>
              )}
            </View>

            {(selectedPokemon.length > 0 &&
              !isTeamCreated) ||
            isUpdating ? (
              <TouchableOpacity onPress={handleClearTeam}>
                <Text style={styles.clearText}>
                  Clear
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {selectedPokemon.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.teamList}>
              {selectedPokemon.map(renderSelectedPokemon)}
            </ScrollView>
          ) : (
            <View style={styles.emptyTeam}>
              <Text style={styles.emptyText}>
                No Pokemon selected
              </Text>

              <Text style={styles.emptySubText}>
                Select Pokemon from below to build your team
              </Text>
            </View>
          )}
        </View>

        {isTeamCreated && !isUpdating && (
          <TouchableOpacity
            style={styles.analyzerButton}
            activeOpacity={0.85}
            onPress={() => setShowAnalyzer(true)}>
            <View>
              <Text style={styles.analyzerTitle}>
                Team Analyzer
              </Text>

              <Text style={styles.analyzerSubtitle}>
                Check your team's strengths and weaknesses
              </Text>
            </View>

            <Text style={styles.analyzerArrow}>›</Text>
          </TouchableOpacity>
        )}

        <View style={styles.statsSection}>
          <View style={styles.statsHeader}>
            <Text style={styles.sectionTitle}>
              Team Stats
            </Text>

            {isTeamCreated && (
              <Text style={styles.savedText}>
                Saved
              </Text>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {teamStats.hp}
              </Text>
              <Text style={styles.statLabel}>HP</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {teamStats.attack}
              </Text>
              <Text style={styles.statLabel}>Attack</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {teamStats.defense}
              </Text>
              <Text style={styles.statLabel}>Defense</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {teamStats.speed}
              </Text>
              <Text style={styles.statLabel}>Speed</Text>
            </View>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>
              Total Team Stats
            </Text>

            <Text style={styles.totalValue}>
              {teamStats.total}
            </Text>
          </View>
        </View>

        <View style={styles.pokemonSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Choose Pokemon
              </Text>

              <Text style={styles.sectionSubTitle}>
                {isTeamCreated && !isUpdating
                  ? 'Press Update Team to edit'
                  : 'Tap to add or remove'}
              </Text>
            </View>

            <Text style={styles.selectedCount}>
              {selectedPokemonIds.length}/6
            </Text>
          </View>

          <FlatList
            data={pokemonList}
            renderItem={renderPokemon}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.grid}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        {!isTeamCreated ? (
          <TouchableOpacity
            style={[
              styles.mainButton,
              selectedPokemonIds.length !== 6 &&
                styles.disabledButton,
            ]}
            onPress={handleCreateTeam}
            disabled={selectedPokemonIds.length !== 6}
            activeOpacity={0.8}>
            <Text style={styles.mainButtonText}>
              {selectedPokemonIds.length === 6
                ? 'Create My Team'
                : `Select ${
                    6 - selectedPokemonIds.length
                  } More`}
            </Text>
          </TouchableOpacity>
        ) : isUpdating ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsUpdating(false);
              }}
              activeOpacity={0.8}>
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.updateButton,
                selectedPokemonIds.length !== 6 &&
                  styles.disabledButton,
              ]}
              onPress={handleSaveUpdate}
              disabled={selectedPokemonIds.length !== 6}
              activeOpacity={0.8}>
              <Text style={styles.mainButtonText}>
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdateTeam}
              activeOpacity={0.8}>
              <Text style={styles.mainButtonText}>
                Update Team
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteTeam}
              activeOpacity={0.8}>
              <Text style={styles.deleteButtonText}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        visible={showAnalyzer}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAnalyzer(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.analyzerModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Team Analyzer
                </Text>

                <Text style={styles.modalSubtitle}>
                  Your team's battle overview
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAnalyzer(false)}>
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>

            {loadingAnalyzer ? (
              <View style={styles.loadingAnalyzer}>
                <ActivityIndicator
                  size="small"
                  color="#6C63FF"
                />

                <Text style={styles.loadingText}>
                  Analyzing team...
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreLabel}>
                    Overall Score
                  </Text>

                  <Text style={styles.scoreValue}>
                    {analyzerScore}
                    <Text style={styles.scoreOutOf}>
                      {' '}
                      / 100
                    </Text>
                  </Text>
                </View>

                <View style={styles.analysisCard}>
                  <Text style={styles.analysisTitle}>
                    Strengths
                  </Text>

                  {strengths.length > 0 ? (
                    <View style={styles.analysisTypes}>
                      {strengths.map(type => (
                        <View
                          key={type}
                          style={styles.strengthBadge}>
                          <Text style={styles.strengthText}>
                            {type}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noDataText}>
                      No strengths found
                    </Text>
                  )}
                </View>

                <View style={styles.analysisCard}>
                  <Text style={styles.analysisTitle}>
                    Weaknesses
                  </Text>

                  {weaknesses.length > 0 ? (
                    <View style={styles.analysisTypes}>
                      {weaknesses.map(type => (
                        <View
                          key={type}
                          style={styles.weaknessBadge}>
                          <Text style={styles.weaknessText}>
                            {type}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noDataText}>
                      No weaknesses found
                    </Text>
                  )}
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowAnalyzer(false)}
              activeOpacity={0.8}>
              <Text style={styles.doneButtonText}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },

  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  subtitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 3,
  },

  countBox: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },

  countText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  content: {
    padding: 16,
    paddingBottom: 115,
  },

  section: {
    marginBottom: 15,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222222',
  },

  sectionSubTitle: {
    fontSize: 11,
    color: '#999999',
    marginTop: 3,
  },

  createdText: {
    color: '#35A66A',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },

  clearText: {
    color: '#E85D5D',
    fontSize: 13,
    fontWeight: '700',
  },

  teamList: {
    paddingVertical: 3,
  },

  teamPokemon: {
    width: 100,
    height: 125,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginRight: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    position: 'relative',
  },

  teamNumber: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: '#EEEEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  teamNumberText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6C63FF',
  },

  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFE7E7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  removeButtonText: {
    color: '#E85D5D',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
  },

  teamImage: {
    width: 65,
    height: 65,
  },

  teamName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333333',
    textTransform: 'capitalize',
    maxWidth: 85,
  },

  emptyTeam: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },

  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555555',
  },

  emptySubText: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
    textAlign: 'center',
  },

  analyzerButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    paddingHorizontal: 17,
    paddingVertical: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  analyzerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  analyzerSubtitle: {
    color: '#E7E5FF',
    fontSize: 10,
    marginTop: 3,
  },

  analyzerArrow: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '300',
  },

  statsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },

  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  savedText: {
    color: '#35A66A',
    fontSize: 11,
    fontWeight: '700',
  },

  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },

  statBox: {
    flex: 1,
    backgroundColor: '#F6F6FC',
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: 'center',
  },

  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6C63FF',
  },

  statLabel: {
    fontSize: 9,
    color: '#888888',
    marginTop: 3,
    fontWeight: '600',
  },

  totalBox: {
    marginTop: 10,
    backgroundColor: '#6C63FF',
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  totalValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  pokemonSection: {
    marginBottom: 10,
  },

  selectedCount: {
    color: '#6C63FF',
    fontSize: 13,
    fontWeight: '800',
  },

  grid: {
    paddingTop: 2,
  },

  columnWrapper: {
    justifyContent: 'space-between',
  },

  pokemonCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },

  selectedCard: {
    borderColor: '#6C63FF',
    backgroundColor: '#F5F3FF',
  },

  disabledCard: {
    opacity: 0.75,
  },

  checkCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  checkText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  pokemonImage: {
    width: 105,
    height: 105,
  },

  pokemonId: {
    color: '#AAAAAA',
    fontSize: 9,
    marginTop: 3,
  },

  pokemonName: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'capitalize',
    marginTop: 3,
    maxWidth: 130,
  },

  typesContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 7,
  },

  typeBadge: {
    backgroundColor: '#F0F0F3',
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  typeText: {
    color: '#777777',
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },

  mainButton: {
    height: 50,
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  updateButton: {
    height: 50,
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  disabledButton: {
    backgroundColor: '#BFC0CA',
  },

  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },

  cancelButton: {
    height: 50,
    flex: 0.8,
    backgroundColor: '#F0F0F3',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: '#555555',
    fontSize: 14,
    fontWeight: '700',
  },

  deleteButton: {
    height: 50,
    width: 105,
    backgroundColor: '#FFE8E8',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteButtonText: {
    color: '#E85D5D',
    fontSize: 13,
    fontWeight: '800',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  analyzerModal: {
    backgroundColor: '#F6F7FB',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222222',
  },

  modalSubtitle: {
    fontSize: 11,
    color: '#888888',
    marginTop: 3,
  },

  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    fontSize: 24,
    color: '#555555',
    lineHeight: 27,
  },

  scoreBox: {
    backgroundColor: '#6C63FF',
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 15,
  },

  scoreLabel: {
    color: '#E7E5FF',
    fontSize: 12,
    fontWeight: '600',
  },

  scoreValue: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    marginTop: 2,
  },

  scoreOutOf: {
    fontSize: 16,
    fontWeight: '700',
  },

  analysisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },

  analysisTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 10,
  },

  analysisTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  strengthBadge: {
    backgroundColor: '#E6F8ED',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  strengthText: {
    color: '#269255',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  weaknessBadge: {
    backgroundColor: '#FFE8E8',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  weaknessText: {
    color: '#D65353',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  noDataText: {
    color: '#999999',
    fontSize: 11,
  },

  loadingAnalyzer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  loadingText: {
    marginTop: 8,
    color: '#888888',
    fontSize: 12,
  },

  doneButton: {
    height: 50,
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },

  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default MyTeamScreen;