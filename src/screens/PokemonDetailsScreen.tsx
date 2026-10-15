import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import type {RootState} from '../redux/store';
import {getPokemonImage, PokemonTypeResponse} from '../types/pokemon';

const PokemonDetailsScreen = ({route, navigation}: any) => {

  const {pokemonId} = route.params;
  const pokemon = useSelector((state: RootState) =>
    state.pokemon.pokemon.find(item => item.id === pokemonId),
  );

  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [loadingWeaknesses, setLoadingWeaknesses] = useState(true);

  useEffect(() => {
    const fetchWeaknesses = async () => {
      if (!pokemon) {
        return;
      }

      try {
        setLoadingWeaknesses(true);
        const responses = await Promise.all(
          pokemon.types.map(async item => {
            const response = await fetch(item.type.url);
            if (!response.ok) {
              throw new Error(`Failed to fetch ${item.type.name}`);
            }
            return response.json() as Promise<PokemonTypeResponse>;
          }),
        );

        const weaknessSet = new Set<string>();

        responses.forEach(typeData => {
          typeData.damage_relations.double_damage_from.forEach(type => {
            weaknessSet.add(type.name);
          });
        });

        setWeaknesses(Array.from(weaknessSet));
      } catch (error) {
        console.log('Error fetching weaknesses:', error);
        setWeaknesses([]);
      } finally {
        setLoadingWeaknesses(false);
      }
    };

    fetchWeaknesses();
  }, [pokemon]);

  if (!pokemon) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>Pokemon not found</Text>

        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  let totalStats = 0;

  pokemon.stats.forEach(stat => {
    totalStats += stat.base_stat;
  });

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

        <Text style={styles.headerTitle}>Pokemon Details</Text>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{uri: getPokemonImage(pokemon.id)}}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.id}>
          #{String(pokemon.id).padStart(3, '0')}
        </Text>

        <Text style={styles.name}>{pokemon.name}</Text>

        <View style={styles.typesContainer}>
          {pokemon.types.map(item => (
            <View key={item.slot} style={styles.typeBadge}>
              <Text style={styles.typeText}>{item.type.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Weaknesses</Text>

          {loadingWeaknesses ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#333" />
              <Text style={styles.loadingText}>
                Loading weaknesses...
              </Text>
            </View>
          ) : weaknesses.length > 0 ? (
            <View style={styles.weaknessContainer}>
              {weaknesses.map(type => (
                <View key={type} style={styles.weaknessBadge}>
                  <Text style={styles.weaknessName}>{type}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noWeaknessText}>
              No weaknesses found.
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.infoGrid}>
            <InfoItem
              title="Height"
              value={`${pokemon.height} m`}
            />

            <InfoItem
              title="Weight"
              value={`${pokemon.weight} kg`}
            />

            <InfoItem
              title="Base XP"
              value={String(pokemon.base_experience)}
            />

            <InfoItem
              title="Order"
              value={String(pokemon.order)}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Abilities</Text>

          {pokemon.abilities.map((item, index) => (
            <View key={item.slot} style={styles.abilityRow}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>

              <View style={styles.abilityInfo}>
                <Text style={styles.abilityName}>
                  {item.ability.name}
                </Text>

                <Text style={styles.abilityType}>
                  {item.is_hidden
                    ? 'Hidden Ability'
                    : 'Normal Ability'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.navigationCard}
          onPress={() =>
            navigation.navigate('ShowAllImage', {
              pokemonId: pokemon.id,
            })
          }>
          <View style={styles.navigationIconContainer}>
            <Text style={styles.navigationIcon}>🖼️</Text>
          </View>

          <View style={styles.navigationContent}>
            <Text style={styles.navigationTitle}>
              Show All Images
            </Text>

            <Text style={styles.navigationSubtitle}>
              View all images of {pokemon.name}
            </Text>
          </View>

          <View style={styles.navigationRight}>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.navigationCard}
          onPress={() =>
            navigation.navigate('ShowAllGIF', {
              pokemonId: pokemon.id,
            })
          }>
          <View style={styles.navigationIconContainer}>
            <Text style={styles.navigationIcon}>🎲</Text>
          </View>

          <View style={styles.navigationContent}>
            <Text style={styles.navigationTitle}>
              Show All GIFs
            </Text>

            <Text style={styles.navigationSubtitle}>
              View all GIFs of {pokemon.name}
            </Text>
          </View>

          <View style={styles.navigationRight}>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.navigationCard}
          onPress={() =>
            navigation.navigate('ListenAllVoice', {
              pokemonId: pokemon.id,
            })
          }>
          <View style={styles.navigationIconContainer}>
            <Text style={styles.navigationIcon}>🎤</Text>
          </View>

          <View style={styles.navigationContent}>
            <Text style={styles.navigationTitle}>
              Listen All Voices
            </Text>

            <Text style={styles.navigationSubtitle}>
              Listen all voices of {pokemon.name}
            </Text>
          </View>

          <View style={styles.navigationRight}>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.navigationCard}
          onPress={() =>
            navigation.navigate('EvolutionChain', {
              pokemonId: pokemon.id,
            })
          }>
          <View style={styles.navigationIconContainer}>
            <Text style={styles.navigationIcon}>🌱</Text>
          </View>

          <View style={styles.navigationContent}>
            <Text style={styles.navigationTitle}>
              Show Evolution Chain
            </Text>

            <Text style={styles.navigationSubtitle}>
              Show Evolution Chain of {pokemon.name}
            </Text>
          </View>

          <View style={styles.navigationRight}>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.navigationCard}
          onPress={() =>
            navigation.navigate('BaseStats', {
              pokemonId: pokemon.id,
            })
          }>
          <View style={styles.navigationIconContainer}>
            <Text style={styles.navigationIcon}>📊</Text>
          </View>

          <View style={styles.navigationContent}>
            <Text style={styles.navigationTitle}>Base Stats</Text>

            <Text style={styles.navigationSubtitle}>
              View all {pokemon.stats.length} base stats
            </Text>
          </View>

          <View style={styles.navigationRight}>
            <Text style={styles.totalStats}>{totalStats}</Text>

            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.navigationCard}
          onPress={() =>
            navigation.navigate('PokemonMoves', {
              pokemonId: pokemon.id,
            })
          }>
          <View style={styles.navigationIconContainer}>
            <Text style={styles.navigationIcon}>⚔️</Text>
          </View>

          <View style={styles.navigationContent}>
            <Text style={styles.navigationTitle}>Moves</Text>

            <Text style={styles.navigationSubtitle}>
              View all available moves
            </Text>
          </View>

          <View style={styles.navigationRight}>
            <Text style={styles.totalStats}>
              {pokemon.moves.length}
            </Text>

            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.navigationCard}
          onPress={() =>
            navigation.navigate('EncounterLocation', {
              pokemonId: pokemon.id,
            })
          }>
          <View style={styles.navigationIconContainer}>
            <Text style={styles.navigationIcon}>📍</Text>
          </View>

          <View style={styles.navigationContent}>
            <Text style={styles.navigationTitle}>
              Show Encounter Locations
            </Text>

            <Text style={styles.navigationSubtitle}>
              Show Encounter Locations of {pokemon.name}
            </Text>
          </View>

          <View style={styles.navigationRight}>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const InfoItem = ({
  title,
  value,
}: {
  title: string;
  value: string;
}) => {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

export default PokemonDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  header: {
    height: 90,
    paddingTop: 35,
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

  content: {
    paddingTop: 10,
    paddingBottom: 40,
  },

  imageContainer: {
    height: 280,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  image: {
    width: 250,
    height: 250,
  },

  id: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
  },

  name: {
    marginTop: 3,
    textAlign: 'center',
    fontSize: 34,
    fontWeight: '900',
    color: '#1D1D1F',
    textTransform: 'capitalize',
  },

  typesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  typeBadge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
  },

  typeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
    textTransform: 'capitalize',
  },

  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
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

  sectionTitle: {
    marginBottom: 15,
    fontSize: 19,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  weaknessContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  weaknessBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFF1F1',
    borderWidth: 1,
    borderColor: '#FFD4D4',
  },

  weaknessName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D32F2F',
    textTransform: 'capitalize',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },

  loadingText: {
    marginLeft: 10,
    fontSize: 13,
    color: '#999',
  },

  noWeaknessText: {
    fontSize: 14,
    color: '#999',
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  infoItem: {
    width: '48%',
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F5F6FA',
  },

  infoTitle: {
    fontSize: 12,
    color: '#999',
  },

  infoValue: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: '800',
    color: '#333',
  },

  abilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  numberCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#F1F3F8',
  },

  numberText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#555',
  },

  abilityInfo: {
    flex: 1,
  },

  abilityName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textTransform: 'capitalize',
  },

  abilityType: {
    marginTop: 3,
    fontSize: 12,
    color: '#999',
  },

  navigationCard: {
    marginHorizontal: 16,
    marginTop: 16,
    minHeight: 82,
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

  navigationIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F3F8',
  },

  navigationIcon: {
    fontSize: 24,
  },

  navigationContent: {
    flex: 1,
    marginLeft: 14,
  },

  navigationTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#222',
  },

  navigationSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },

  navigationRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  totalStats: {
    fontSize: 14,
    fontWeight: '800',
    color: '#666',
  },

  arrow: {
    marginLeft: 10,
    fontSize: 28,
    fontWeight: '300',
    color: '#999',
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
    backgroundColor: '#333',
  },

  goBackButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});