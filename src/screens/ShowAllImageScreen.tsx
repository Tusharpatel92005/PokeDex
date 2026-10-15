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

const ShowAllImageScreen = ({ route, navigation }: any) => {

  const { pokemonId } = route.params;
  const pokemon = useSelector((state: RootState) => state.pokemon.pokemon.find(item => item.id === pokemonId));

  const images = useMemo(() => {
    if (!pokemon?.sprites) {
      return [];
    }

    const sprites: any = pokemon.sprites;

    const imageList = [
      {
        title: 'Front Default',
        url: sprites.front_default,
      },
      {
        title: 'Front Shiny',
        url: sprites.front_shiny,
      },
      {
        title: 'Back Default',
        url: sprites.back_default,
      },
      {
        title: 'Back Shiny',
        url: sprites.back_shiny,
      },
      {
        title: 'Official Artwork',
        url: sprites.other?.['official-artwork']?.front_default,
      },
      {
        title: 'Official Artwork Shiny',
        url: sprites.other?.['official-artwork']?.front_shiny,
      },
      {
        title: 'Home',
        url: sprites.other?.home?.front_default,
      },
      {
        title: 'Home Shiny',
        url: sprites.other?.home?.front_shiny,
      },
      {
        title: 'Home Female',
        url: sprites.other?.home?.front_female,
      },
    ];

    return imageList.filter(item => item.url);
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

  const renderImage = ({ item }: any) => {
    return (
      <View style={styles.imageCard}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.url }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.imageTitle}>{item.title}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back.png')} style={styles.backIcon} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>All Images</Text>
        </View>
      </View>

      <View style={styles.pokemonInfo}>
        <Text style={styles.pokemonName}>{pokemon.name}</Text>
        <Text style={styles.pokemonId}>#{String(pokemon.id).padStart(3, '0')}</Text>
      </View>

      {images.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🖼️</Text>
          <Text style={styles.emptyTitle}>No Images Available</Text>
          <Text style={styles.emptyText}>
            There are no additional images available
            for this Pokemon.
          </Text>
        </View>
      ) : (
        <FlatList
          data={images}
          renderItem={renderImage}
          keyExtractor={(item, index) => `${item.title}-${index}`}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
        />
      )}
    </View>
  );
};

export default ShowAllImageScreen;

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

  backArrow: {
    fontSize: 36,
    fontWeight: '300',
    color: '#222',
    lineHeight: 40,
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

  pokemonInfo: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },

  pokemonName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1D1D1F',
    textTransform: 'capitalize',
  },

  pokemonId: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },

  list: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },

  row: {
    justifyContent: 'space-between',
  },

  imageCard: {
    width: '48%',
    marginBottom: 16,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  imageContainer: {
    height: 155,
    borderRadius: 16,
    backgroundColor: '#F1F3F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  imageTitle: {
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
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