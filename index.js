let currentPage = 1;
const pokemonsPerPage = 20;
let allPokemons = [];

// Funzione per caricare i Pokémon in ordine casuale
async function loadPokemonGallery(randomize = false) {
    const pokemonGalleryContainer = document.getElementById('pokemonGalleryContainer');

    try {
        if (randomize || allPokemons.length === 0) {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
            const data = await response.json();
            allPokemons = data.results.sort(() => Math.random() - 0.5); // Ordine casuale
        }

        loadRandomPokemons();

    } catch (error) {
        console.error("Errore nel recupero dei Pokémon: ", error);
    }
}

// Funzione per caricare Pokémon casuali nella galleria
async function loadRandomPokemons() {
    const pokemonGalleryContainer = document.getElementById('pokemonGalleryContainer');
    pokemonGalleryContainer.innerHTML = ''; // Pulisce il contenitore

    try {
        const selectedPokemons = allPokemons.slice((currentPage - 1) * pokemonsPerPage, currentPage * pokemonsPerPage);

        // Carica i dettagli dei Pokémon in parallelo
        const pokemonPromises = selectedPokemons.map(pokemon => fetch(pokemon.url).then(res => res.json()));
        const pokemonDetailsArray = await Promise.all(pokemonPromises);

        pokemonDetailsArray.forEach(pokemonDetails => {
            const card = createPokemonCard(pokemonDetails);
            pokemonGalleryContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Errore nel caricamento dei Pokémon:", error);
        pokemonGalleryContainer.innerHTML = '<p class="text-center text-gray-500">Errore nel caricamento dei Pokémon.</p>';
    }
}

// Funzione per creare una card Pokémon
function createPokemonCard(pokemonDetails) {
    const card = document.createElement('div');
    card.classList.add('card', 'bg-base-100', 'shadow-xl', 'w-full', 'h-80', 'transition-transform', 'transform', 'hover:scale-105');

    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = pokemonDetails.sprites.front_default;
    img.alt = pokemonDetails.name;
    img.classList.add('h-48', 'object-contain');
    figure.appendChild(img);

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'text-center');

    const title = document.createElement('h2');
    title.classList.add('card-title');
    title.textContent = pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1);

    const catchButton = document.createElement('button');
    catchButton.classList.add('btn', 'btn-primary', 'w-full', 'mt-4');
    catchButton.textContent = 'Catch';
    catchButton.onclick = (e) => {
        e.stopPropagation(); // Impedisce l'apertura del modale al cliccare su "Catch"
        catchPokemon({
            id: pokemonDetails.id,
            name: pokemonDetails.name,
            image: pokemonDetails.sprites.front_default
        });
    };

    cardBody.appendChild(title);
    cardBody.appendChild(catchButton);
    card.appendChild(figure);
    card.appendChild(cardBody);

    // Aggiungi l'evento di click per aprire il modale
    card.onclick = () => openPokemonModal({
        name: pokemonDetails.name,
        sprite: pokemonDetails.sprites.front_default,
        details: pokemonDetails
    });

    return card;
}

// Funzione per aprire il modale con i dettagli del Pokémon
function openPokemonModal(pokemon) {
    const pokemonDetails = pokemon.details;

    document.getElementById('modalPokemonName').textContent =
        pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    document.getElementById('modalPokemonImage').src = pokemon.sprite;
    document.getElementById('modalPokemonImage').alt = pokemon.name;

    document.getElementById('modalPokemonTypes').textContent =
        `Tipo: ${pokemonDetails.types.map(type => type.type.name).join(', ')}`;

    document.getElementById('modalPokemonAbilities').textContent =
        `Abilità: ${pokemonDetails.abilities.map(ability => ability.ability.name).join(', ')}`;

    document.getElementById('modalPokemonHeight').textContent =
        `Altezza: ${(pokemonDetails.height / 10).toFixed(1)} m`;

    document.getElementById('modalPokemonWeight').textContent =
        `Peso: ${(pokemonDetails.weight / 10).toFixed(1)} kg`;

    // Popola le statistiche
    const statsContainer = document.getElementById('modalPokemonStats');
    statsContainer.innerHTML = ''; // Pulisce le statistiche precedenti
    pokemonDetails.stats.forEach(stat => {
        const statElement = document.createElement('div');
        statElement.textContent = `${stat.stat.name}: ${stat.base_stat}`;
        statsContainer.appendChild(statElement);
    });

    // Mostra il modale
    document.getElementById('my_modal_5').showModal();
}

// Funzione per catturare un Pokémon e aggiungerlo alla collezione
function catchPokemon(pokemon) {
    let myPokemon = JSON.parse(localStorage.getItem('myPokemon')) || [];

    if (!myPokemon.find(p => p.id === pokemon.id)) {
        myPokemon.push({
            id: pokemon.id,
            name: pokemon.name,
            image: pokemon.image
        });

        localStorage.setItem('myPokemon', JSON.stringify(myPokemon));
        alert(`${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} è stato aggiunto alla tua collezione!`);
    } else {
        alert(`${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} è già nella tua collezione!`);
    }
}

// Funzione per popolare l'elenco dei tipi
async function loadPokemonTypes() {
    const typeFilter = document.getElementById('typeFilter');
    try {
        const response = await fetch('https://pokeapi.co/api/v2/type');
        const data = await response.json();

        data.results.forEach(type => {
            const option = document.createElement('option');
            option.value = type.name;
            option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
            typeFilter.appendChild(option);
        });
    } catch (error) {
        console.error("Errore nel recupero dei tipi:", error);
    }
}

// Funzione per filtrare Pokémon per tipo
async function filterPokemonByType() {
    const typeFilter = document.getElementById('typeFilter');
    const selectedType = typeFilter.value;
    const filteredPokemonContainer = document.getElementById('filteredPokemonContainer');

    if (!selectedType) {
        filteredPokemonContainer.innerHTML = '<p class="text-center text-gray-500">Seleziona un tipo per iniziare il filtro.</p>';
        return;
    }

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
        const data = await response.json();

        filteredPokemonContainer.innerHTML = '';
        const pokemonPromises = data.pokemon.slice(0, 20).map(p => fetch(p.pokemon.url).then(res => res.json()));
        const pokemonDetailsArray = await Promise.all(pokemonPromises);

        pokemonDetailsArray.forEach(pokemonDetails => {
            const card = createPokemonCard(pokemonDetails);
            filteredPokemonContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Errore nel filtraggio:", error);
        filteredPokemonContainer.innerHTML = '<p class="text-center text-gray-500">Errore nel caricamento dei Pokémon filtrati.</p>';
    }
}

// Funzione per cercare un Pokémon
async function searchPokemon() {
    const pokemonName = document.getElementById('pokemonName').value.toLowerCase().trim();
    const pokemonDetailsContainer = document.getElementById('pokemonDetailsContainer');

    if (!pokemonName) {
        alert('Per favore, inserisci il nome del Pokémon');
        return;
    }

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const data = await response.json();

        const card = createPokemonCard(data);
        pokemonDetailsContainer.innerHTML = '';
        pokemonDetailsContainer.appendChild(card);
        pokemonDetailsContainer.classList.remove('hidden');
    } catch (error) {
        console.error("Errore nel recupero dei dettagli del Pokémon:", error);
        alert('Errore nel recupero dei dettagli. Verifica il nome del Pokémon.');
    }
}

// Funzione per resettare la barra di ricerca
document.getElementById('clearButton').addEventListener('click', () => {
    document.getElementById('pokemonName').value = '';
    const pokemonDetailsContainer = document.getElementById('pokemonDetailsContainer');
    pokemonDetailsContainer.classList.add('hidden');
    pokemonDetailsContainer.innerHTML = '';
});

// Funzione per la paginazione (randomizzare)
document.getElementById("randomize").addEventListener('click', () => {
    currentPage = Math.floor(Math.random() * 50) + 1; // Imposta una pagina casuale tra 1 e 50
    loadRandomPokemons();
});

// **Funzionalità "Torna Su"**
window.onscroll = function() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        scrollToTopBtn.style.display = "block"; // Mostra il pulsante
    } else {
        scrollToTopBtn.style.display = "none"; // Nasconde il pulsante
    }
};

document.getElementById('scrollToTopBtn').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'  // Scrolling con effetto morbido
    });
});

// Aggiungi eventi iniziali
document.addEventListener('DOMContentLoaded', () => {
    loadPokemonTypes();
    loadPokemonGallery();

    const typeFilter = document.getElementById('typeFilter');
    typeFilter.addEventListener('change', filterPokemonByType);

    const searchButton = document.getElementById('searchButton');
    searchButton.addEventListener('click', searchPokemon);
});
