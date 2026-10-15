import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import pokemonApi from '../apis/pokemonApi';
import { EncounterLocation, LocationItem } from '../types/pokemon';

const EncounterLocationScreen = ({ route, navigation }: any) => {

  const pokemonId = route?.params?.pokemonId;
  const pokemonName = route?.params?.pokemonName;
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pokemonId) {
      fetchEncounterLocations();
    } else {
      setLoading(false);
    }
  }, [pokemonId]);

  const fetchEncounterLocations = async () => {
    try {
      setLoading(true);

      const response = await pokemonApi.get<EncounterLocation[]>(`/pokemon/${pokemonId}/encounters`);
      const locationMap = new Map<string, number>();

      response.data.forEach(location => {
        const locationName = location.location_area.name;

        location.version_details.forEach(version => {
          version.encounter_details.forEach(detail => {

            const currentChance = locationMap.get(locationName);

            if (currentChance === undefined || detail.chance > currentChance) {
              locationMap.set(locationName, detail.chance);
            }
          });
        });
      });

      const formattedLocations: LocationItem[] = Array.from(locationMap.entries()).map(([locationName, chance]) => ({ locationName, chance }));
      setLocations(formattedLocations);
    } catch (err: any) {
      console.log('Encounter Location API ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderLocation = ({ item, index }: { item: LocationItem, index: number; }) => {
    return (
      <View style={styles.locationCard}>
        <View style={styles.numberContainer}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>

        <View style={styles.locationInfo}>
          <Text style={styles.locationName}>{item.locationName}</Text>
          <Text style={styles.locationLabel}>Encounter Location</Text>
        </View>

        <View style={styles.chanceContainer}>
          <Text style={styles.chanceText}>{item.chance}%</Text>
          <Text style={styles.chanceLabel}>Chance</Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>?</Text>
        </View>
        <Text style={styles.emptyTitle}>No Encounter Locations</Text>
        <Text style={styles.emptyText}>{pokemonName ? `${pokemonName} has no available encounter locations.` : 'No encounter locations were found for this Pokemon.'}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Encounter Locations</Text>
        <View style={styles.headerPlaceholder} />
      </View>
      <FlatList
        data={locations}
        keyExtractor={(item, index) => `${item.locationName}-${index}`}
        renderItem={renderLocation}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, locations.length === 0 && styles.emptyListContent]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default EncounterLocationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  header: {
    height: 90,
    paddingTop: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F2F4',
  },

  backIcon: {
    width: 25,
    height: 25,
    tintColor: 'black',
    resizeMode: 'contain',
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#202124',
  },

  headerPlaceholder: {
    width: 42,
  },

  listContent: {
    padding: 16,
    paddingBottom: 30,
  },

  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEDEF',
  },

  numberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEEEEE',
  },

  numberText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },

  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },

  locationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202124',
    textTransform: 'capitalize',
  },

  locationLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#888888',
  },

  chanceContainer: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },

  chanceText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222222',
  },

  chanceLabel: {
    marginTop: 2,
    fontSize: 10,
    color: '#999999',
  },

  emptyListContent: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDEDED',
  },

  emptyIconText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#777777',
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
  },

  emptyText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: '#888888',
    textAlign: 'center',
  },
});