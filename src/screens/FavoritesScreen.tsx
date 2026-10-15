import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import pokemonApi from '../apis/pokemonApi';

import {
  Pokemon,
  PokemonListResponse,
  getPokemonImage,
} from '../types/pokemon';

import { SafeAreaView } from 'react-native-safe-area-context';

const FAVORITES_STORAGE_KEY = 'favoritePokemonIds';
const LIMIT = 20;

const FavoritesScreen = ({ navigation }: any) => {

  const loadingRotation = useRef(new Animated.Value(0),).current;
  const loadingRotate = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [favoritePokemon, setFavoritePokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagesLoaded, setPagesLoaded] = useState(0);

  useEffect(() => {
    if (!loading) {
      loadingRotation.setValue(0);
      return;
    }

    const rotationAnimation = Animated.loop(
      Animated.timing(loadingRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    );

    rotationAnimation.start();

    return () => {
      rotationAnimation.stop();
    };
  }, [loading, loadingRotation]);

  const loadFavoriteIds = useCallback(
    async (): Promise<number[]> => {
      try {
        const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY,);

        if (!storedFavorites) {
          setFavoriteIds([]);
          return [];
        }

        const parsedFavorites = JSON.parse(storedFavorites);

        if (Array.isArray(parsedFavorites) && parsedFavorites.every(id => typeof id === 'number')) {
          setFavoriteIds(parsedFavorites);
          return parsedFavorites;
        }

        setFavoriteIds([]);
        return [];
      } catch (error) {
        console.log('Failed to load favorite IDs:', error);
        setFavoriteIds([]);
        return [];
      }
    },
    [],
  );

  const getRequiredPages = useCallback((ids: number[]) => {
    if (ids.length === 0) {
      return 0;
    }

    const maxId = Math.max(...ids);
    return Math.ceil(maxId / LIMIT);
  },
    [],
  );

  const loadPage = useCallback(async (page: number, favoriteIdsToLoad: number[]): Promise<Pokemon[]> => {
    try {
      const offset = (page - 1) * LIMIT;
      const response = await pokemonApi.get<PokemonListResponse>(`/pokemon?limit=${LIMIT}&offset=${offset}`);
      const matchingPokemon = response.data.results.filter(pokemon => {
        const id = Number(
          pokemon.url
            .split('/')
            .filter(Boolean)
            .pop(),
        );

        return favoriteIdsToLoad.includes(id);
      });

      const details = await Promise.all(matchingPokemon.map(async pokemon => {
        const id = pokemon.url
          .split('/')
          .filter(Boolean)
          .pop();

        if (!id) {
          return null;
        }

        try {
          const detailResponse = await pokemonApi.get<Pokemon>(`/pokemon/${id}`);
          return detailResponse.data;
        } catch (error) {
          console.log(`Failed to load Pokemon ${id}:`, error);
          return null;
        }
      })
      );

      return details.filter((pokemon): pokemon is Pokemon => pokemon !== null);
    } catch (error) {
      console.log(`Failed to load page ${page}:`, error);
      return [];
    }
  }, []);

  const loadFavoritesPokemon = useCallback(async (ids: number[]) => {
    try {
      setLoading(true);
      setFavoritePokemon([]);
      setPagesLoaded(0);

      if (ids.length === 0) {
        return;
      }

      const requiredPages = getRequiredPages(ids);
      let allPokemon: Pokemon[] = [];

      for (let page = 1; page <= requiredPages; page++) {
        const pagePokemon = await loadPage(page, ids);
        allPokemon = [...allPokemon, ...pagePokemon];
        const uniquePokemon = Array.from(new Map(allPokemon.map(pokemon => [pokemon.id, pokemon,]),).values());
        allPokemon = uniquePokemon.sort((a, b) => a.id - b.id);
        setFavoritePokemon(allPokemon);
        setPagesLoaded(page);
      }
    } catch (error) {
      console.log('Favorites loading error:', error);
    } finally {
      setLoading(false);
    }
  },
    [getRequiredPages, loadPage],
  );

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const refreshFavorites = async () => {
        const ids = await loadFavoriteIds();

        if (!isMounted) {
          return;
        }

        await loadFavoritesPokemon(ids);
      };

      refreshFavorites();
      return () => {
        isMounted = false;
      };
    }, [loadFavoriteIds, loadFavoritesPokemon]));

  const handleRemoveFavorite = async (id: number) => {
    try {
      const updatedFavorites = favoriteIds.filter(favoriteId => favoriteId !== id);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
      setFavoriteIds(updatedFavorites);
      setFavoritePokemon(prev => prev.filter(pokemon => pokemon.id !== id));
    } catch (error) {
      console.log('Failed to remove favorite:', error);
    }
  };

  const renderPokemon = ({ item }: { item: Pokemon }) => {
    const types = item.types
      .map(type => type.type.name)
      .join(' / ');

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('PokemonDetails', { pokemonId: item.id })}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getPokemonImage(item.id) }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.topRow}>
            <Text style={styles.id}>#{String(item.id).padStart(3, '0')}</Text>
            <TouchableOpacity
              style={styles.favoriteButton}
              activeOpacity={0.7}
              onPress={event => {
                event.stopPropagation();
                handleRemoveFavorite(item.id);
              }}
            >
              <Image
                source={require('../assets/Favorites.png')}
                style={[styles.favoriteIcon, { tintColor: '#FF3B30' }]}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.typeLabel}>Type</Text>
          <Text style={styles.type}>{types}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.Image
          source={require('../assets/pokeball.png')}
          style={[styles.loadingPokeball, { transform: [{ rotate: loadingRotate }] }]}
          resizeMode="contain"
        />
        <Text style={styles.loadingText}> Loading Favorites...</Text>
      </View>
    );
  }

  if (favoriteIds.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={require('../assets/Favorites.png')}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyTitle}> No Favorites</Text>
        <Text style={styles.emptyText}>You haven't added any Pokemon to your favorites yet.</Text>
        <TouchableOpacity
          style={styles.exploreButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.exploreButtonText}>Explore Pokemon</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Favorites</Text>
        </View>

        <View style={styles.countContainer}>
          <Text style={styles.countText}>{favoriteIds.length}</Text>
        </View>
      </View>

      <View style={styles.pageContainer}>
        <Text style={styles.pageText}>Pages loaded: {pagesLoaded}</Text>
      </View>

      <FlatList
        data={favoritePokemon}
        keyExtractor={item => item.id.toString()}
        renderItem={renderPokemon}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

export default FavoritesScreen;

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
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  countContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
  },

  countText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FF3B30',
  },

  pageContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
  },

  pageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  card: {
    flexDirection: 'row',
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

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#F5F6FA',
  },

  emptyIcon: {
    width: 70,
    height: 70,
    tintColor: '#D0D0D0',
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1D1D1F',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#888',
    textAlign: 'center',
    marginBottom: 25,
  },

  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 15,
    backgroundColor: '#1D1D1F',
  },

  exploreButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});