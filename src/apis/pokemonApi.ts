import axios from 'axios';

const pokemonApi = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default pokemonApi;