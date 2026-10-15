import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import pokemonApi from '../apis/pokemonApi';
import { PokemonListResponse, PokemonState, Pokemon } from '../types/pokemon';

const LIMIT = 50;
export const FAVORITES_KEY = 'favoritePokemonIds';

const initialState: PokemonState = {
  pokemon: [],
  favorites: [],
  loading: false,
  loadingMore: false,
  hasMore: true,
  offset: 0,
  error: null,
};

export const fetchPokemon = createAsyncThunk<Pokemon[], void, { rejectValue: string }>('pokemon/fetchPokemon', async (_, thunkAPI) => {
  try {
    const response = await pokemonApi.get<PokemonListResponse>(`/pokemon?limit=${LIMIT}&offset=0`);
    const pokemonDetails = await Promise.all(response.data.results.map(async pokemon => {
      const id = pokemon.url.split('/').filter(Boolean).pop();
      const detailResponse = await pokemonApi.get<Pokemon>(`/pokemon/${id}`,);
      return detailResponse.data;
    }),
    );
    return pokemonDetails;
  } catch (error: any) {
    console.log('Pokemon API ERROR:', error);
    return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to fetch Pokemon');
  }
}
);

export const fetchMorePokemon = createAsyncThunk<Pokemon[], void, { rejectValue: string, state: { pokemon: PokemonState } }>('pokemon/fetchMorePokemon', async (_, thunkAPI) => {
  try {
    const { offset, hasMore } = thunkAPI.getState().pokemon;
    if (!hasMore) {
      return [];
    }
    const response = await pokemonApi.get<PokemonListResponse>(`/pokemon?limit=${LIMIT}&offset=${offset}`);
    const pokemonDetails = await Promise.all(response.data.results.map(async pokemon => {
      const id = pokemon.url.split('/').filter(Boolean).pop();
      const detailResponse = await pokemonApi.get<Pokemon>(`/pokemon/${id}`);
      return detailResponse.data;
    }),
    );
    return pokemonDetails;
  } catch (error: any) {
    console.log('Pokemon LOAD MORE ERROR:', error);
    return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to load more Pokemon');
  }
}
);

// export const loadFavorites = createAsyncThunk<number[], void, { rejectValue: string }>('pokemon/loadFavorites', async (_, thunkAPI) => {
//   try {
//     const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
//     if (!storedFavorites) {
//       return [];
//     }
//     const parsed = JSON.parse(storedFavorites);
//     if (!Array.isArray(parsed)) {
//       return [];
//     }
//     return parsed.filter((id): id is number => typeof id === 'number');
//   } catch (error: any) {
//     console.log('LOAD FAVORITES ERROR:', error);
//     return thunkAPI.rejectWithValue(error?.message || 'Failed to load favorites');
//   }
// }
// );

// export const toggleFavoritePersisted = createAsyncThunk<number, number, { state: { pokemon: PokemonState }, rejectValue: string; }>('pokemon/toggleFavoritePersisted', async (pokemonId, thunkAPI) => {
//   try {
//     const state = thunkAPI.getState().pokemon;
//     let updatedFavorites: number[];
//     if (state.favorites.includes(pokemonId)) {
//       updatedFavorites = state.favorites.filter(id => id !== pokemonId);
//     } else {
//       updatedFavorites = [...state.favorites, pokemonId];
//     }
//     await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
//     return pokemonId;
//   } catch (error: any) {
//     console.log('TOGGLE FAVORITE ERROR:', error);
//     return thunkAPI.rejectWithValue(error?.message || 'Failed to update favorite');
//   }
// }
// );

// export const removeFavoritePersisted = createAsyncThunk<number, number, { state: { pokemon: PokemonState }, rejectValue: string; }>('pokemon/removeFavoritePersisted', async (pokemonId, thunkAPI) => {
//   try {
//     const state = thunkAPI.getState().pokemon;
//     const updatedFavorites = state.favorites.filter(id => id !== pokemonId);
//     await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
//     return pokemonId;
//   } catch (error: any) {
//     console.log('REMOVE FAVORITE ERROR:', error);
//     return thunkAPI.rejectWithValue(error?.message || 'Failed to remove favorite');
//   }
// }
// );

const pokemonSlice = createSlice({

  name: 'pokemon',
  initialState,
  reducers: {

    addFavorite: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      if (!state.favorites.includes(id)) {
        state.favorites.push(id);
      }
    },

    removeFavorite: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      state.favorites = state.favorites.filter(favoriteId => favoriteId !== id);
    },

    toggleFavorite: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      if (state.favorites.includes(id)) {
        state.favorites = state.favorites.filter(favoriteId => favoriteId !== id);
      } else {
        state.favorites.push(id);
      }

    }
  },

  extraReducers: builder => {
    builder
      .addCase(fetchPokemon.pending, state => {
        state.loading = true;
        state.error = null;
        state.offset = 0;
        state.hasMore = true;
      },
      )

      .addCase(fetchPokemon.fulfilled, (state, action) => {
        state.loading = false;
        state.pokemon = action.payload;
        state.offset = action.payload.length;
        state.hasMore = action.payload.length === LIMIT;
      },
      )

      .addCase(fetchPokemon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      },
      )

      .addCase(fetchMorePokemon.pending, state => {
        state.loadingMore = true;
        state.error = null;
      },
      )

      .addCase(fetchMorePokemon.fulfilled, (state, action) => {
        state.loadingMore = false;
        state.pokemon.push(...action.payload,);
        state.offset += action.payload.length;
        state.hasMore = action.payload.length === LIMIT;
      },
      )

      .addCase(fetchMorePokemon.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.payload || 'Failed to load more Pokemon';
      },
      )

      // .addCase(loadFavorites.fulfilled, (state, action) => {
      //   state.favorites = action.payload;
      // },
      // )

      // .addCase(toggleFavoritePersisted.fulfilled, (state, action) => {
      //   const id = action.payload;
      //   if (state.favorites.includes(id)) {
      //     state.favorites = state.favorites.filter(favoriteId => favoriteId !== id);
      //   } else {
      //     state.favorites.push(id);
      //   }
      // },
      // )

      // .addCase(removeFavoritePersisted.fulfilled, (state, action) => {
      //   const id = action.payload;
      //   state.favorites = state.favorites.filter(favoriteId => favoriteId !== id);
      // },
      // );
  },
});

// export const { addFavorite, removeFavorite, toggleFavorite } = pokemonSlice.actions;
export default pokemonSlice.reducer;