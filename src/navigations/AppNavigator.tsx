import React from 'react';
import { Image, StyleSheet } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import PokemonDetailsScreen from '../screens/PokemonDetailsScreen';
import BaseStatsScreen from '../screens/BaseStatsScreen';
import PokemonMovesScreen from '../screens/PokemonMovesScreen';
import MyTeamScreen from '../screens/MyTeamScreen';
import ComparePokemonScreen from '../screens/ComparePokemonScreen';
import ShowAllImageScreen from '../screens/ShowAllImageScreen';
import ShowAllGIFScreen from '../screens/ShowAllGIFScreen';
import ListenAllVoiceScreen from '../screens/ListenAllVoiceScreen';
import EvolutionChainScreen from '../screens/EvolutionChainScreen';
import EncounterLocationScreen from '../screens/EncounterLocationScreen';
import QuizScreen from '../screens/QuizScreen';
import LeaderBoardScreen from '../screens/LeaderBoardScreen';
import BattleScreen from '../screens/BattleScreen';
import TeamBattleScreen from '../screens/TeamBattleScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Image source={require('../assets/home.png')} style={[styles.icon, { opacity: focused ? 1 : 0.5 }]} resizeMode="contain" />
            );
          },
        }}
      />

      <Tab.Screen name="Favorites" component={FavoritesScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Image source={require('../assets/Favorites.png')} style={[styles.icon, { opacity: focused ? 1 : 0.3 }]} resizeMode="contain" />
            );
          },
        }}
      />

    <Tab.Screen name="ComparePokemon" component={ComparePokemonScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Image source={require('../assets/compare.png')} style={[styles.icon, { opacity: focused ? 1 : 0.3, height: 35, width: 35 }]} resizeMode="contain" />
            );
          },
        }}
      />

      <Tab.Screen name="LeaderBoard" component={LeaderBoardScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Image source={require('../assets/leaderBoard.png')} style={[styles.icon, { opacity: focused ? 1 : 0.3 }]} resizeMode="contain" />
            );
          },
        }}
      />

      <Tab.Screen name="Quiz" component={QuizScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Image source={require('../assets/quiz.png')} style={[styles.icon, { opacity: focused ? 1 : 0.3 }]} resizeMode="contain" />
            );
          },
        }}
      />

    <Tab.Screen name="MyTeam" component={MyTeamScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Image source={require('../assets/myteam.png')} style={[styles.icon, { opacity: focused ? 1 : 0.3 }]} resizeMode="contain" />
            );
          },
        }}
      />
    </Tab.Navigator>

    
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen}/>
      <Stack.Screen name="MainTabs" component={TabNavigator}/>
      <Stack.Screen name="PokemonDetails" component={PokemonDetailsScreen}/>
      <Stack.Screen name="BaseStats" component={BaseStatsScreen}/>
      <Stack.Screen name="PokemonMoves" component={PokemonMovesScreen}/>
      <Stack.Screen name="ShowAllImage" component={ShowAllImageScreen}/>
      <Stack.Screen name="ShowAllGIF" component={ShowAllGIFScreen}/>
      <Stack.Screen name="ListenAllVoice" component={ListenAllVoiceScreen}/>
      <Stack.Screen name="EvolutionChain" component={EvolutionChainScreen}/>
      <Stack.Screen name="EncounterLocation" component={EncounterLocationScreen}/>
      <Stack.Screen name="Battle" component={BattleScreen}/>
      <Stack.Screen name="TeamBattle" component={TeamBattleScreen}/>
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
    tintColor: 'black'
  },
});