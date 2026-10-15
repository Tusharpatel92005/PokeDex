import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Sound from 'react-native-sound';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { getPokemonImage } from '../types/pokemon';

Sound.setCategory('Playback');

const ListenAllVoiceScreen = ({ route, navigation }: any) => {

  const { pokemonId } = route.params;
  const pokemon = useSelector((state: RootState) => state.pokemon.pokemon.find(item => item.id === pokemonId));
  const soundRef = useRef<Sound | null>(null);
  const [playingVoice, setPlayingVoice] = useState<'latest' | 'legacy' | null>(null);
  const [loadingVoice, setLoadingVoice] = useState<'latest' | 'legacy' | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
        soundRef.current = null;
      }
    };
  }, []);

  const stopCurrentSound = () => {
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.release();
      soundRef.current = null;
    }

    setPlayingVoice(null);
    setLoadingVoice(null);
  };

  const playVoice = (type: 'latest' | 'legacy', url?: string) => {
    if (!url) {
      return;
    }

    if (playingVoice === type) {
      stopCurrentSound();
      return;
    }
    stopCurrentSound();
    setLoadingVoice(type);

    const sound = new Sound(url, '', error => {

      if (error) {
        console.log('Failed to load sound:', error);
        setLoadingVoice(null);
        return;
      }

      soundRef.current = sound;
      setLoadingVoice(null);
      setPlayingVoice(type);

      sound.play(success => {
        if (!success) {
          console.log('Playback failed');
        }

        sound.release();
        soundRef.current = null;
        setPlayingVoice(null);
      });
    },
    );
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

  const latestVoice = pokemon.cries?.latest;
  const legacyVoice = pokemon.cries?.legacy;

  const voices = [
    {
      id: 'latest' as const,
      title: 'Latest Cry',
      subtitle: 'Latest Pokemon cry',
      url: latestVoice,
      icon: '🔊',
    },
    {
      id: 'legacy' as const,
      title: 'Legacy Cry',
      subtitle: 'Classic Pokemon cry',
      url: legacyVoice,
      icon: '🎙️',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back.png')} style={styles.backIcon} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Pokemon Voices</Text>
        </View>
      </View>

      <View style={styles.pokemonCard}>
        <View style={styles.pokemonIcon}>
          <Image
            source={{ uri: getPokemonImage(pokemon.id) }}
            style={styles.smallImage}
            resizeMode='contain'
          />
        </View>

        <View style={styles.pokemonInfo}>
          <Text style={styles.pokemonName}>{pokemon.name}</Text>
          <Text style={styles.pokemonId}>#{String(pokemon.id).padStart(3, '0')}</Text>
        </View>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Listen to {pokemon.name}</Text>
        <Text style={styles.description}>Play the available Pokemon cries below.</Text>
      </View>

      <View style={styles.voiceList}>

        {voices.map(voice => {
          const isPlaying = playingVoice === voice.id;
          const isLoading = loadingVoice === voice.id;

          return (
            <View style={[styles.voiceCard, isPlaying && styles.playingCard]}>
              <View style={[styles.voiceIconContainer, isPlaying && styles.playingIconContainer]}>
                <Text style={styles.voiceIcon}>{isPlaying ? '⏸️' : voice.icon}</Text>
              </View>

              <View style={styles.voiceContent}>
                <Text style={styles.voiceTitle}>{voice.title}</Text>
                <Text style={styles.voiceSubtitle}>{isPlaying ? 'Playing now...' : voice.subtitle}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.playButton}
                onPress={() => playVoice(voice.id, voice.url)}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.playButtonText}>{isPlaying ? '■' : '▶'}</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

      </View>

      {voices.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎤</Text>

          <Text style={styles.emptyTitle}>No Voices Available</Text>
          <Text style={styles.emptyText}>
            There are no voice recordings available
            for this Pokemon.
          </Text>
        </View>
      )}

    </View>
  );
};

export default ListenAllVoiceScreen;

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

  pokemonCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
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

  pokemonIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F3F8',
  },

  smallImage: {
    height: 45,
    width: 45
  },

  pokemonEmoji: {
    fontSize: 30,
  },

  pokemonInfo: {
    marginLeft: 15,
  },

  pokemonName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#222',
    textTransform: 'capitalize',
  },

  pokemonId: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },

  titleContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },

  title: {
    fontSize: 23,
    fontWeight: '900',
    color: '#222',
  },

  description: {
    marginTop: 5,
    fontSize: 13,
    color: '#888',
  },

  voiceList: {
    paddingHorizontal: 16,
  },

  voiceCard: {
    minHeight: 88,
    marginBottom: 14,
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

  playingCard: {
    borderWidth: 1,
    borderColor: '#222',
  },

  voiceIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F3F8',
  },

  playingIconContainer: {
    backgroundColor: '#E8F5E9',
  },

  voiceIcon: {
    fontSize: 24,
  },

  voiceContent: {
    flex: 1,
    marginLeft: 14,
  },

  voiceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222',
  },

  voiceSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },

  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D1D1F',
  },

  playButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
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