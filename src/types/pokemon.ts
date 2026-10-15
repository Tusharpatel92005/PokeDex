export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonSprites {
  front_default: string | null;
  other?: {
    ['official-artwork']?: {
      front_default: string | null;
    };
  };
}

export interface Pokemon {
  id: number;
  name: string;

  base_experience: number;
  height: number;
  weight: number;
  order: number;
  is_default: boolean;

  abilities: {
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }[];

  forms: {
    name: string;
    url: string;
  }[];

  game_indices: {
    game_index: number;
    version: {
      name: string;
      url: string;
    };
  }[];

  moves: {
    move: {
      name: string;
      url: string;
    };
    version_group_details: any[];
  }[];

  species: {
    name: string;
    url: string;
  };

  stats: {
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }[];

  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];

  sprites: {
    back_default: string | null;
    back_female: string | null;
    back_shiny: string | null;
    back_shiny_female: string | null;

    front_default: string | null;
    front_female: string | null;
    front_shiny: string | null;
    front_shiny_female: string | null;

    other?: {
      'official-artwork'?: {
        front_default: string | null;
        front_shiny?: string | null;
      };
    };

    versions?: any;
  };

  cries: {
    latest: string;
    legacy: string;
  };

  held_items: any[];
  location_area_encounters: string;

  past_abilities: any[];
  past_stats: any[];
  past_types: any[];
}

export interface EvolutionNode {
  species: {
    name: string;
    url: string;
  };

  evolves_to: EvolutionNode[];
}

export interface EvolutionPokemon {
  name: string;
  id: number;
  image: string;
}

export interface PokemonState {
  pokemon: Pokemon[];
  favorites: number[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  offset: number;
  error: string | null;
}

export interface EncounterLocation {
  location_area: {
    name: string;
  };
  version_details: {
    encounter_details: {
      chance: number;
    }[];
  }[];
}

export interface LocationItem {
  locationName: string;
  chance: number;
}

export interface DamageRelations {
  double_damage_from: {
    name: string;
    url: string;
  }[];
  half_damage_from: {
    name: string;
    url: string;
  }[];
  no_damage_from: {
    name: string;
    url: string;
  }[];
}

export interface PokemonTypeResponse {
  damage_relations: DamageRelations;
}

export const pokemonTypes = [
  'all',
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
];

export type Option = {
  id: string;
  text: string;
};

export type Question = {
  id: number;
  question: string;
  options: Option[];
  answer: string;
};

export const getPokemonImage = (id: number) => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
};