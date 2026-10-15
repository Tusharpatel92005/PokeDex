import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  Animated,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';

import {
  fetchPokemon,
  fetchMorePokemon,
  // toggleFavorite,
} from '../redux/pokemonSlice';

import {
  Pokemon,
  getPokemonImage,
  pokemonTypes,
} from '../types/pokemon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const FAVORITES_STORAGE_KEY = 'favoritePokemonIds';

const HomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();

  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<'default' | 'name-asc' | 'name-desc' | 'id-asc' | 'id-desc'>('default');

  const [selectedType, setSelectedType] = useState<string>('all');
  const [surprisePokemon, setSurprisePokemon] = useState<Pokemon | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchHistory, setSearchHistory] = useState<Pokemon[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const loadingRotation = useRef(new Animated.Value(0)).current;
  const surpriseScale = useRef(new Animated.Value(0.5)).current;
  const surpriseOpacity = useRef(new Animated.Value(0)).current;
  const surpriseRotate = useRef(new Animated.Value(0)).current;
  const surpriseImageScale = useRef(new Animated.Value(0.4)).current;
  const surpriseImageY = useRef(new Animated.Value(20)).current;
  const surpriseQuestionScale = useRef(new Animated.Value(0)).current;
  const surpriseQuestionOpacity = useRef(new Animated.Value(0)).current;
  const sparkleScale = useRef(new Animated.Value(0)).current;
  const sparkleOpacity = useRef(new Animated.Value(0)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;

  const { pokemon, loading, loadingMore, hasMore, error } = useSelector((state: RootState) => state.pokemon);

  useEffect(() => {
    dispatch(fetchPokemon());
  }, [dispatch]);

  useFocusEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);

        if (!storedFavorites) {
          return;
        }

        const parsedFavorites = JSON.parse(storedFavorites);
        setFavoriteIds(parsedFavorites);

      } catch (error) {
        console.log('Failed to load favorites:', error);
      }
    };

    loadFavorites();
  },);

  useEffect(() => {
    if (!loading && !loadingMore) {
      loadingRotation.stopAnimation();
      loadingRotation.setValue(0);
      return;
    }

    loadingRotation.setValue(0);

    const animation = Animated.loop(
      Animated.timing(loadingRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [loading, loadingMore, loadingRotation]);

  const loadingRotate = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleLoadMore = () => {
    if (loadingMore || !hasMore || search.trim().length > 0 || surprisePokemon) {
      return;
    }

    dispatch(fetchMorePokemon());
  };

  const filteredPokemon = useMemo(() => {
    if (surprisePokemon) {
      return [surprisePokemon];
    }

    const uniquePokemon = Array.from(
      new Map(pokemon.map(item => [item.id, item])).values(),
    );

    const searchText = search.trim().toLowerCase();

    const result = uniquePokemon.filter(item => {
      const matchesSearch = !searchText || item.name.toLowerCase().includes(searchText) || item.id.toString().includes(searchText);
      const matchesType = selectedType === 'all' || item.types.some(type => type.type.name.toLowerCase() === selectedType);
      return matchesSearch && matchesType;
    });

    switch (sortOption) {
      case 'name-asc':
        return [...result].sort((a, b) => a.name.localeCompare(b.name));

      case 'name-desc':
        return [...result].sort((a, b) => b.name.localeCompare(a.name));

      case 'id-asc':
        return [...result].sort(
          (a, b) => a.id - b.id,
        );

      case 'id-desc':
        return [...result].sort(
          (a, b) => b.id - a.id,
        );

      default:
        return result;
    }
  }, [
    pokemon,
    search,
    sortOption,
    selectedType,
    surprisePokemon,
  ]);

  const handleSearch = (text: string) => {
    setSearch(text);
    setSurprisePokemon(null);

    const searchText = text.trim().toLowerCase();

    if (!searchText) {
      return;
    }

    const matchedPokemon = pokemon.find(
      item =>
        item.name.toLowerCase() === searchText ||
        item.id.toString() === searchText,
    );

    if (matchedPokemon) {
      setSearchHistory(prev => {
        const alreadyExists = prev.some(
          item => item.id === matchedPokemon.id,
        );

        if (alreadyExists) {
          return [
            matchedPokemon,
            ...prev.filter(
              item => item.id !== matchedPokemon.id,
            ),
          ];
        }

        return [matchedPokemon, ...prev];
      });
    }
  };

  const handleHistoryPress = (item: Pokemon) => {
    setSearch(item.name);
    setSurprisePokemon(null);
    setSelectedType('all');
    setSortOption('default');
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  const handleFavorite = async (pokemonId: number) => {
    try {
      const isFavorite = favoriteIds.includes(pokemonId);

      const updatedFavorites = isFavorite ? favoriteIds.filter(id => id !== pokemonId) : [...favoriteIds, pokemonId];
      setFavoriteIds(updatedFavorites);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
    } catch (error) {
      console.log('Failed to update favorite:', error);
    }
  };

  const handleSurpriseMe = () => {
    if (pokemon.length === 0) {
      return;
    }

    const uniquePokemon = Array.from(
      new Map(
        pokemon.map(item => [item.id, item]),
      ).values(),
    );

    if (uniquePokemon.length === 0) {
      return;
    }

    const randomIndex = Math.floor(
      Math.random() * uniquePokemon.length,
    );

    const randomPokemon = uniquePokemon[randomIndex];

    setSearch('');
    setSortOption('default');
    setSelectedType('all');

    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.88,
        friction: 3,
        tension: 150,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1.08,
        friction: 3,
        tension: 150,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    surpriseScale.setValue(0.5);
    surpriseOpacity.setValue(0);
    surpriseRotate.setValue(0);
    surpriseImageScale.setValue(0.4);
    surpriseImageY.setValue(20);
    surpriseQuestionScale.setValue(0);
    surpriseQuestionOpacity.setValue(0);
    sparkleScale.setValue(0);
    sparkleOpacity.setValue(0);
    sparkleRotate.setValue(0);

    setSurprisePokemon(randomPokemon);

    Animated.parallel([
      Animated.spring(surpriseQuestionScale, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(surpriseQuestionOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(surpriseScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(surpriseOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(surpriseQuestionOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(surpriseQuestionScale, {
          toValue: 1.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(surpriseRotate, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
      ]).start(() => {
        surpriseRotate.setValue(0);

        Animated.parallel([
          Animated.spring(surpriseImageScale, {
            toValue: 1,
            friction: 4,
            tension: 120,
            useNativeDriver: true,
          }),
          Animated.spring(surpriseImageY, {
            toValue: 0,
            friction: 4,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.spring(sparkleScale, {
            toValue: 1,
            friction: 3,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleRotate, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]).start(() => {
          Animated.parallel([
            Animated.timing(sparkleOpacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleScale, {
              toValue: 1.5,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start();
        });
      });
    });
  };

  const surpriseRotateY = surpriseRotate.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '180deg'],
  });

  const sparkleRotation = sparkleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setSurprisePokemon(null);
    setFilterModalVisible(false);
  };

  const handleSortSelect = (
    option:
      | 'default'
      | 'name-asc'
      | 'name-desc'
      | 'id-asc'
      | 'id-desc',
  ) => {
    setSortOption(option);
    setSurprisePokemon(null);
    setFilterModalVisible(false);
  };

  const handleClearFilters = () => {
    setSelectedType('all');
    setSortOption('default');
    setFilterModalVisible(false);
  };

  const renderPokemon = ({
    item,
  }: {
    item: Pokemon;
  }) => {
    const types = item.types
      .map(type => type.type.name)
      .join(' / ');

    const isFavorite = favoriteIds.includes(item.id);

    const isSurprise =
      surprisePokemon?.id === item.id;

    const animatedCardStyle = isSurprise
      ? {
        opacity: surpriseOpacity,
        transform: [
          {
            perspective: 1000,
          },
          {
            scale: surpriseScale,
          },
          {
            rotateY: surpriseRotateY,
          },
        ],
      }
      : {};

    return (
      <Animated.View
        style={[
          styles.card,
          animatedCardStyle,
        ]}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.cardTouchable}
          onPress={() =>
            navigation.navigate(
              'PokemonDetails',
              {
                pokemonId: item.id,
              },
            )
          }>
          <View style={styles.imageContainer}>
            <Animated.Image
              source={{
                uri: getPokemonImage(item.id),
              }}
              style={[
                styles.image,
                isSurprise && {
                  transform: [
                    {
                      scale: surpriseImageScale,
                    },
                    {
                      translateY: surpriseImageY,
                    },
                  ],
                },
              ]}
              resizeMode="contain"
            />

            {isSurprise && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.surpriseOverlay,
                  {
                    opacity:
                      surpriseQuestionOpacity,
                    transform: [
                      {
                        scale:
                          surpriseQuestionScale,
                      },
                    ],
                  },
                ]}>
                <Text style={styles.questionMark}>
                  ?
                </Text>
              </Animated.View>
            )}

            {isSurprise && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.sparkleContainer,
                  {
                    opacity: sparkleOpacity,
                    transform: [
                      {
                        scale: sparkleScale,
                      },
                      {
                        rotate: sparkleRotation,
                      },
                    ],
                  },
                ]}>
                <Text
                  style={[
                    styles.sparkle,
                    styles.sparkleTop,
                  ]}>
                  ✦
                </Text>

                <Text
                  style={[
                    styles.sparkle,
                    styles.sparkleRight,
                  ]}>
                  ✨
                </Text>

                <Text
                  style={[
                    styles.sparkle,
                    styles.sparkleBottom,
                  ]}>
                  ✦
                </Text>

                <Text
                  style={[
                    styles.sparkle,
                    styles.sparkleLeft,
                  ]}>
                  ✧
                </Text>
              </Animated.View>
            )}
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.topRow}>
              <Text style={styles.id}>
                #{String(item.id).padStart(3, '0')}
              </Text>

              <TouchableOpacity
                style={styles.favoriteButton}
                activeOpacity={0.7}
                onPress={event => {
                  event.stopPropagation();
                  handleFavorite(item.id);

                  // dispatch(toggleFavorite(item.id));
                }}>
                <Image
                  source={require('../assets/Favorites.png')}
                  style={[
                    styles.favoriteIcon,
                    {
                      tintColor: isFavorite
                        ? '#FF3B30'
                        : '#999',
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.name}>
              {item.name}
            </Text>

            <Text style={styles.typeLabel}>
              Type
            </Text>

            <Text style={styles.type}>
              {types}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHistoryItem = ({
    item,
  }: {
    item: Pokemon;
  }) => {
    return (
      <TouchableOpacity
        style={styles.historyCard}
        onPress={() =>
          handleHistoryPress(item)
        }
        activeOpacity={0.8}>
        <Image
          source={{
            uri: getPokemonImage(item.id),
          }}
          style={styles.historyImage}
          resizeMode="contain"
        />

        <View style={styles.historyInfo}>
          <Text style={styles.historyName}>
            {item.name}
          </Text>

          <Text style={styles.historyId}>
            #{String(item.id).padStart(3, '0')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.Image
          source={require('../assets/pokeball.png')}
          style={[
            styles.loadingPokeball,
            {
              transform: [
                {
                  rotate: loadingRotate,
                },
              ],
            },
          ]}
          resizeMode="contain"
        />

        <Text style={styles.loadingText}>
          Loading Pokemon...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>
          PokeDex
        </Text>

        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.8}
          onPress={() =>
            setFilterModalVisible(true)
          }>
          <Text style={styles.filterButtonIcon}>
            ☷
          </Text>

          <Text style={styles.filterButtonText}>
            Filter
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Image
          source={require('../assets/search.png')}
          style={styles.searchIcon}
        />

        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder="Search Pokemon or ID..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch('')}
            style={styles.clearButton}>
            <Image
              source={require('../assets/cross.png')}
              style={styles.clearText}
            />
          </TouchableOpacity>
        )}
      </View>

      {searchHistory.length > 0 &&
        search.trim().length === 0 && (
          <View style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>
                Recent Searches
              </Text>

              <TouchableOpacity
                onPress={handleClearHistory}>
                <Text
                  style={styles.clearHistoryText}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={searchHistory}
              horizontal
              keyExtractor={item =>
                item.id.toString()
              }
              renderItem={renderHistoryItem}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={
                styles.historyList
              }
            />
          </View>
        )}

      <View style={styles.surpriseContainer}>
        <Animated.View
          style={[
            styles.surpriseButtonWrapper,
            {
              transform: [
                {
                  scale: buttonScale,
                },
              ],
            },
          ]}>
          <TouchableOpacity
            style={styles.surpriseButton}
            onPress={handleSurpriseMe}
            activeOpacity={0.8}>
            <Text style={styles.surpriseIcon}>
              ✨
            </Text>

            <Text style={styles.surpriseText}>
              Surprise Me
            </Text>

            <Text style={styles.surpriseSmallIcon}>
              ✨
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {surprisePokemon && (
          <TouchableOpacity
            style={styles.showAllButton}
            onPress={() =>
              setSurprisePokemon(null)
            }
            activeOpacity={0.7}>
            <Text style={styles.showAllText}>
              Show All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {(search.trim().length > 0 ||
        selectedType !== 'all' ||
        sortOption !== 'default') && (
          <View
            style={styles.activeFilterContainer}>
            <Text style={styles.resultText}>
              {filteredPokemon.length} Pokemon found
            </Text>

            {selectedType !== 'all' && (
              <View
                style={styles.activeFilterBadge}>
                <Text
                  style={
                    styles.activeFilterBadgeText
                  }>
                  {selectedType}
                </Text>
              </View>
            )}
          </View>
        )}

      {filteredPokemon.length === 0 ? (
        <View style={styles.noResultContainer}>
          <Image
            source={require('../assets/search.png')}
            style={styles.noResultIcon}
          />

          <Text style={styles.noResultTitle}>
            No Pokemon Found
          </Text>

          <Text style={styles.noResultText}>
            Try searching with another name, ID or
            type.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPokemon}
          keyExtractor={item =>
            item.id.toString()
          }
          renderItem={renderPokemon}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.listContainer
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <Animated.Image
                  source={require('../assets/pokeball.png')}
                  style={[
                    styles.footerPokeball,
                    {
                      transform: [
                        {
                          rotate:
                            loadingRotate,
                        },
                      ],
                    },
                  ]}
                  resizeMode="contain"
                />

                <Text
                  style={
                    styles.footerLoadingText
                  }>
                  Loading more Pokemon...
                </Text>
              </View>
            ) : undefined
          }
        />
      )}

      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setFilterModalVisible(false)
        }>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Filter & Sort
              </Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() =>
                  setFilterModalVisible(false)
                }>
                <Text
                  style={styles.closeButtonText}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={styles.modalSectionTitle}>
              Sort By
            </Text>

            <View style={styles.sortContainer}>
              {[
                ['default', 'Default'],
                ['name-asc', 'Name A-Z'],
                ['name-desc', 'Name Z-A'],
                ['id-asc', 'ID Low-High'],
                ['id-desc', 'ID High-Low'],
              ].map(([value, label]) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.optionButton,
                    sortOption === value &&
                    styles.selectedOptionButton,
                  ]}
                  onPress={() =>
                    handleSortSelect(
                      value as
                      | 'default'
                      | 'name-asc'
                      | 'name-desc'
                      | 'id-asc'
                      | 'id-desc',
                    )
                  }>
                  <Text
                    style={[
                      styles.optionText,
                      sortOption === value &&
                      styles.selectedOptionText,
                    ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={styles.modalSectionTitle}>
              Pokemon Type
            </Text>

            <FlatList
              data={pokemonTypes}
              numColumns={3}
              keyExtractor={item => item}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.typeList
              }
              renderItem={({ item }) => {
                const isSelected =
                  selectedType === item;

                return (
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      isSelected &&
                      styles.selectedTypeOption,
                    ]}
                    onPress={() =>
                      handleTypeSelect(item)
                    }>
                    <Text
                      style={[
                        styles.typeOptionText,
                        isSelected &&
                        styles.selectedTypeOptionText,
                      ]}>
                      {item === 'all'
                        ? 'All Types'
                        : item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={handleClearFilters}>
              <Text
                style={styles.clearFilterText}>
                Clear Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F6FA',
  },

  loadingPokeball: {
    width: 90,
    height: 90,
    marginBottom: 20,
  },

  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },

  headingRow: {
    paddingHorizontal: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  filterButton: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  filterButtonIcon: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1D1F',
    marginRight: 6,
  },

  filterButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  searchContainer: {
    height: 52,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  searchIcon: {
    height: 20,
    width: 20,
    tintColor: 'black',
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1D1D1F',
  },

  clearButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearText: {
    height: 30,
    width: 30,
    tintColor: 'black',
  },

  historyContainer: {
    marginBottom: 8,
  },

  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  historyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  clearHistoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF3B30',
  },

  historyList: {
    paddingHorizontal: 16,
  },

  historyCard: {
    width: 145,
    height: 65,
    marginRight: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },

  historyImage: {
    width: 52,
    height: 52,
  },

  historyInfo: {
    flex: 1,
    marginLeft: 5,
  },

  historyName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
    textTransform: 'capitalize',
  },

  historyId: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
  },

  surpriseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 10,
  },

  surpriseButtonWrapper: {
    flex: 1,
  },

  surpriseButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1D1D1F',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  surpriseIcon: {
    color: '#FFD700',
    fontSize: 18,
    marginRight: 8,
  },

  surpriseText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  surpriseSmallIcon: {
    fontSize: 14,
    marginLeft: 8,
  },

  showAllButton: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  showAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  surpriseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D1D1F',
    borderRadius: 18,
    zIndex: 5,
  },

  questionMark: {
    fontSize: 75,
    fontWeight: '900',
    color: '#FFD700',
  },

  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  sparkle: {
    position: 'absolute',
    color: '#FFD700',
    fontWeight: '900',
  },

  sparkleTop: {
    fontSize: 28,
    top: 0,
  },

  sparkleRight: {
    fontSize: 20,
    right: 0,
    top: 35,
  },

  sparkleBottom: {
    fontSize: 25,
    bottom: 0,
  },

  sparkleLeft: {
    fontSize: 18,
    left: 0,
    top: 45,
  },

  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
  },

  resultText: {
    fontSize: 13,
    color: '#777',
  },

  activeFilterBadge: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#1D1D1F',
  },

  activeFilterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  footerLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },

  footerPokeball: {
    width: 35,
    height: 35,
    marginBottom: 5,
  },

  footerLoadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#777',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  cardTouchable: {
    flexDirection: 'row',
  },

  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 18,
    backgroundColor: '#F1F3F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: 110,
    height: 110,
  },

  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  id: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },

  favoriteButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  favoriteIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },

  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1D1D1F',
    textTransform: 'capitalize',
    marginTop: 3,
  },

  typeLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 12,
  },

  type: {
    fontSize: 15,
    fontWeight: '700',
    color: '#555',
    textTransform: 'capitalize',
    marginTop: 2,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  noResultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  noResultIcon: {
    marginBottom: 15,
    height: 30,
    width: 30,
    tintColor: 'black',
  },

  noResultTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 6,
  },

  noResultText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F3F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#333',
    lineHeight: 30,
  },

  modalSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 12,
  },

  sortContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 22,
    gap: 8,
  },

  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F5F6FA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  selectedOptionButton: {
    backgroundColor: '#1D1D1F',
    borderColor: '#1D1D1F',
  },

  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },

  selectedOptionText: {
    color: '#FFFFFF',
  },

  typeList: {
    paddingBottom: 10,
  },

  typeOption: {
    width: '31%',
    marginRight: '2%',
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F5F6FA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedTypeOption: {
    backgroundColor: '#1D1D1F',
    borderColor: '#1D1D1F',
  },

  typeOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    textTransform: 'capitalize',
  },

  selectedTypeOptionText: {
    color: '#FFFFFF',
  },

  clearFilterButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F1F3F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  clearFilterText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
  },
});

