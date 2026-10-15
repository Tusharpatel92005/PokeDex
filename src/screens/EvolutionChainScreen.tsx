import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import type { EvolutionNode, EvolutionPokemon } from '../types/pokemon';

const EvolutionChainScreen = ({ route, navigation }: any) => {

  const { pokemonId } = route.params;
  const pokemon = useSelector((state: RootState) => state.pokemon.pokemon.find(item => item.id === pokemonId),);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionPokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pokemon) {
      getEvolutionChain();
    } else {
      setLoading(false);
    }
  }, [pokemon]);

  const getEvolutionChain = async () => {
    if (!pokemon) {
      return;
    }

    try {
      setLoading(true);
      const speciesResponse = await fetch(pokemon.species.url);
      const speciesData = await speciesResponse.json();

      if (!speciesData.evolution_chain?.url) {
        setEvolutionChain([]);
        setLoading(false);
        return;
      }

      const evolutionResponse = await fetch(speciesData.evolution_chain.url);
      const evolutionData = await evolutionResponse.json();

      const names: string[] = [];
      let currentNode: EvolutionNode | undefined = evolutionData.chain;

      while (currentNode) {
        if (currentNode.species?.name) {
          names.push(currentNode.species.name);
        }

        if (currentNode.evolves_to?.length > 0) {
          currentNode = currentNode.evolves_to[0];
        } else {
          currentNode = undefined;
        }
      }

      const details: EvolutionPokemon[] = [];

      for (const name of names) {
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
          const data = await response.json();
          details.push({
            name: data.name,
            image: data.sprites?.other?.['official-artwork']?.front_default,
            id: data.id,
          });
        } catch {
          continue;
        }
      }
      setEvolutionChain(details);
    } catch (err) {
      console.log('Evolution Chain Error:', err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#222" />
        <Text style={styles.loadingText}>Loading evolution...</Text>
      </View>
    );
  }

  if (evolutionChain.length === 0) {
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
          <Text style={styles.headerTitle}>Evolution Chain</Text>
        </View>

        <View style={styles.center}>
          <Text style={styles.emptyText}>No evolution available</Text>
        </View>
      </View>
    );
  }

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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Evolution Chain</Text>
          <Text style={styles.headerSubtitle}>Current State:- {pokemon.name}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {evolutionChain.map((item, index) => (
          <View key={`${item.name}-${index}`}>
            {index > 0 && (
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>↓</Text>
              </View>
            )}
            <View style={styles.pokemonCard}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.pokemonName}>{item.name}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default EvolutionChainScreen;

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

  headerSubtitle: {
    marginTop: 2,
    fontSize: 16,
    color: 'black',
    textTransform: 'capitalize',
    fontWeight: 'bold',
  },

  content: {
    padding: 16,
    alignItems: 'center',
    paddingBottom: 30,
  },

  pokemonCard: {
    width: '100%',
    padding: 16,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
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
    width: 180,
    height: 180,
    borderRadius: 20,
    backgroundColor: '#F1F3F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  pokemonName: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '900',
    color: '#222',
    textTransform: 'capitalize',
  },

  arrowContainer: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrow: {
    fontSize: 32,
    fontWeight: '700',
    color: '#777',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#F5F6FA',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#777',
  },

  notFoundText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#777',
  },

  errorText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#222',
  },

  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
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
