let currentPage = 1;
const pokemonsPerPage = 20;
let allPokemons = [];

// Funzione per caricare i Pokémon in ordine casuale
async function loadPokemonGallery(randomize = false) {
    const pokemonGalleryContainer = document.getElementById('pokemonGalleryContainer');

    try {
        // Recupera tutti i Pokémon dalla PokeAPI
        if (randomize || allPokemons.length === 0) {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
            const data = await response.json();
            allPokemons = data.results.sort(() => Math.random() - 0.5); // Ordine casuale
        }

        // Mostra un set casuale di Pokémon dalla lista
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
        // Seleziona un sottoinsieme casuale di Pokémon
        const selectedPokemons = allPokemons.slice(0, pokemonsPerPage);

        // Carica i dettagli dei Pokémon in parallelo
        const pokemonPromises = selectedPokemons.map(pokemon => fetch(pokemon.url).then(res => res.json()));
        const pokemonDetailsArray = await Promise.all(pokemonPromises);

        pokemonDetailsArray.forEach(pokemonDetails => {
            const card = document.createElement('div');
            card.classList.add('card', 'bg-base-100', 'shadow-xl', 'w-full', 'h-80', 'transition-transform', 'transform', 'hover:scale-105');

            const figure = document.createElement('figure');
            const img = document.createElement('img');
            img.src = pokemonDetails.sprites.front_default;
            img.alt = pokemonDetails.name;
            img.classList.add('h-48', 'object-contain', 'mx-auto');
            figure.appendChild(img);

            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body', 'space-y-2');

            const title = document.createElement('h2');
            title.classList.add('card-title', 'text-center');
            title.textContent = pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1);

            const catchButton = document.createElement('button');
            catchButton.classList.add('btn', 'btn-primary', 'w-full');
            catchButton.textContent = 'Catch';
            catchButton.onclick = () => catchPokemon({
                id: pokemonDetails.id,
                name: pokemonDetails.name,
                image: pokemonDetails.sprites.front_default
            });

            // Aggiungi l'evento per aprire il modale quando la card è cliccata
            card.onclick = () => openPokemonModal({
                name: pokemonDetails.name,
                sprite: pokemonDetails.sprites.front_default,
                details: pokemonDetails
            });

            cardBody.appendChild(title);
            cardBody.appendChild(catchButton);
            card.appendChild(figure);
            card.appendChild(cardBody);

            pokemonGalleryContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Errore nel caricamento dei Pokémon:", error);
        pokemonGalleryContainer.innerHTML = '<p class="text-center text-gray-500">Errore nel caricamento dei Pokémon.</p>';
    }
}



// Funzione per aprire il modale con i dettagli del Pokémon
function openPokemonModal(pokemon) {
    // Ottieni i dettagli dal Pokémon
    const pokemonDetails = pokemon.details;

    // Popola il modale con i dettagli del Pokémon
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

// Aggiungi l'evento di click alle card nella galleria
function addCardClickEvent(pokemon, cardElement) {
    cardElement.addEventListener('click', () => {
        openPokemonModal(pokemon);
    });
}


// Funzione per catturare un Pokémon e aggiungerlo alla collezione
function catchPokemon(pokemon) {
    let myPokemon = JSON.parse(localStorage.getItem('myPokemon')) || [];

    // Controlla se il Pokémon è già nella collezione
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

// Funzione per cercare un Pokémon
async function searchPokemon() {
    const pokemonName = document.getElementById('pokemonName').value.toLowerCase().trim();
    const pokemonDetailsContainer = document.getElementById('pokemonDetailsContainer');
    const searchButton = document.getElementById('searchButton');

    // mostra i dettagli del Pokémon ricercato
    pokemonDetailsContainer.classList.remove('hidden');

    try {
        if (!pokemonName) {
            alert('Per favore, inserisci il nome del Pokémon');
            return;
        }

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const data = await response.json();

        document.getElementById('pokemonImage').src = data.sprites.front_default;
        document.getElementById('pokemonNameDetail').textContent = data.name.charAt(0).toUpperCase() + data.name.slice(1);
        document.getElementById('pokemonTypes').textContent = data.types.map(type => type.type.name).join(', ');
        document.getElementById('pokemonAbilities').textContent = data.abilities.map(ability => ability.ability.name).join(', ');
        document.getElementById('pokemonHeight').textContent = `${data.height / 10} m`;
        document.getElementById('pokemonWeight').textContent = `${data.weight / 10} kg`;

        // Visualizza il pulsante per catturare il Pokémon
        document.getElementById('catchButton').onclick = () => catchPokemon({
            id: data.id,
            name: data.name,
            image: data.sprites.front_default
        });

    } catch (error) {
        console.error("Errore nel recupero dei dettagli del Pokémon: ", error);
        alert('Errore nel recupero dei dettagli. Verifica il nome del Pokémon.');
    }
}

// Aggiungi un listener per il bottone clearButton
document.getElementById('clearButton').addEventListener('click', () => {
    // Resetta la barra di ricerca
    document.getElementById('pokemonName').value = '';

    // Nasconde la card dei dettagli del Pokémon
    const pokemonDetailsContainer = document.getElementById('pokemonDetailsContainer');
    pokemonDetailsContainer.classList.add('hidden');

    // Ripulisce i dati della card
    document.getElementById('pokemonImage').src = '';
    document.getElementById('pokemonNameDetail').textContent = '';
    document.getElementById('pokemonTypes').textContent = '';
    document.getElementById('pokemonAbilities').textContent = '';
    document.getElementById('pokemonHeight').textContent = '';
    document.getElementById('pokemonWeight').textContent = '';
});


// Aggiunge funzionalità al pulsante "Randomize"
document.getElementById("randomize").addEventListener('click', () => {
    loadPokemonGallery(true); // Carica un nuovo set casuale di Pokémon
});

// Aggiungi evento al pulsante di ricerca
document.getElementById('searchButton').addEventListener('click', searchPokemon);

// Carica la galleria all'avvio
loadPokemonGallery();

