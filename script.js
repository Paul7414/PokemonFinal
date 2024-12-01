// Funzione per recuperare i dati di un Pokémon dall'API e visualizzarlo
async function fetchData() {
    try {
        const pokemonName = document.getElementById("pokemonName").value.toLowerCase();
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

        if (!response.ok) {
            throw new Error("Non è stato possibile recuperare il Pokémon");
        }

        const data = await response.json();
        const pokemonSprite = data.sprites.front_default;
        const pokemon = {
            name: data.name,
            id: data.id,
            sprite: pokemonSprite,
            details: data
        };

        displayPokemon(pokemon);
    } catch (error) {
        console.error(error);
        alert("Errore nel recupero dei dati. Assicurati che il nome sia corretto.");
    }
}

// Funzione per visualizzare il Pokémon in una card
function displayPokemon(pokemon) {
    const pokemonListContainer = document.getElementById('pokemonList');

    const card = document.createElement('div');
    card.classList.add('card', 'bg-base-100', 'shadow-xl', 'transition-transform', 'transform', 'hover:scale-105', 'w-full');
    card.dataset.pokemonId = pokemon.id;

    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = pokemon.sprite;
    img.alt = pokemon.name;
    img.classList.add('h-48', 'object-contain', 'transition-transform', 'duration-300');
    figure.appendChild(img);

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'space-y-4');
    
    const title = document.createElement('h2');
    title.classList.add('card-title', 'text-center', 'text-xl', 'font-semibold');
    title.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'w-full');
    button.textContent = "Catch!";
    button.onclick = () => catchPokemon(pokemon); // Salva il Pokémon nella collezione

    cardBody.appendChild(title);
    cardBody.appendChild(button);
    card.appendChild(figure);
    card.appendChild(cardBody);

    // Aggiungi l'evento di click sulla card per aprire il modale
    card.onclick = () => openPokemonModal(pokemon);

    pokemonListContainer.appendChild(card);
}

// Funzione per aprire il modale con i dettagli del Pokémon
function openPokemonModal(pokemon) {
    // Ottieni i dettagli dal Pokémon
    const pokemonDetails = pokemon.details;
    const modal = document.getElementById("pokemonModal");

    // Popola il modale con i dettagli del Pokémon
    document.getElementById("modalPokemonName").textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    document.getElementById("modalPokemonImage").src = pokemon.sprite;
    document.getElementById("modalPokemonImage").alt = pokemon.name;
    document.getElementById("modalPokemonTypes").textContent = `Types: ${pokemonDetails.types.map(type => type.type.name).join(', ')}`;
    document.getElementById("modalPokemonAbilities").textContent = `Abilities: ${pokemonDetails.abilities.map(ability => ability.ability.name).join(', ')}`;
    document.getElementById("modalPokemonHeight").textContent = `Height: ${pokemonDetails.height / 10} m`;
    document.getElementById("modalPokemonWeight").textContent = `Weight: ${pokemonDetails.weight / 10} kg`;

    // Mostra il modale
    modal.checked = true;
}

// Funzione per catturare un Pokémon e aggiungerlo alla collezione
function catchPokemon(pokemon) {
    let myPokemon = JSON.parse(localStorage.getItem('myPokemon')) || [];

    // Controlla se il Pokémon è già nella collezione
    if (!myPokemon.find(p => p.id === pokemon.id)) {
        myPokemon.push({
            id: pokemon.id,
            name: pokemon.name,
            image: pokemon.sprite
        });

        localStorage.setItem('myPokemon', JSON.stringify(myPokemon));
        alert(`${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} è stato aggiunto alla tua collezione!`);
    } else {
        alert(`${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} è già nella tua collezione!`);
    }
}

// Funzione per caricare la lista dei Pokémon salvati nella pagina MyPokemon
function loadMyPokemon() {
    const myPokemon = JSON.parse(localStorage.getItem('myPokemon')) || [];
    const pokemonListContainer = document.getElementById('myPokemonList');

    // Se non ci sono Pokémon, mostra un messaggio
    if (myPokemon.length === 0) {
        pokemonListContainer.innerHTML = '<p class="text-center text-xl font-semibold text-gray-500">Non hai ancora catturato nessun Pokémon! Vai alla ricerca di nuovi amici!</p>';
        return;
    }

    pokemonListContainer.innerHTML = '';

    // Aggiungi i Pokémon catturati alla galleria
    myPokemon.forEach(pokemon => {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('card', 'bg-base-100', 'shadow-xl', 'w-full', 'transition-transform', 'transform', 'hover:scale-105');

        pokemonCard.innerHTML = `
            <figure><img src="${pokemon.image}" alt="${pokemon.name}" class="h-48 object-contain transition-transform duration-300" /></figure>
            <div class="card-body">
                <h2 class="card-title text-center">${pokemon.name}</h2>
                <p class="text-center text-gray-600">ID: ${pokemon.id}</p>
                <div class="card-actions justify-center">
                    <button class="btn btn-warning w-full" onclick="removePokemon(${pokemon.id})">Rimuovi</button>
                </div>
            </div>
        `;

        pokemonListContainer.appendChild(pokemonCard);
    });
}

// Funzione per rimuovere un Pokémon dalla collezione
function removePokemon(pokemonId) {
    let myPokemon = JSON.parse(localStorage.getItem('myPokemon')) || [];
    
    // Filtra il Pokémon da rimuovere
    myPokemon = myPokemon.filter(pokemon => pokemon.id !== pokemonId);

    // Salva di nuovo la lista aggiornata
    localStorage.setItem('myPokemon', JSON.stringify(myPokemon));

    // Ricarica la collezione per riflettere la rimozione
    loadMyPokemon();
}

// Carica la collezione di Pokémon sulla pagina MyPokemon quando la pagina è pronta
if (document.getElementById('myPokemonList')) {
    document.addEventListener('DOMContentLoaded', loadMyPokemon);
}

// Gestisci la ricerca sulla pagina principale (index.html)
if (document.getElementById('pokemonName')) {
    document.addEventListener("DOMContentLoaded", async function () {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=150');
        if (!response.ok) {
            throw new Error("Non è stato possibile recuperare la lista dei Pokémon");
        }

        const data = await response.json();
        const pokemonList = data.results;

        for (let pokemon of pokemonList) {
            const pokemonData = await fetch(pokemon.url);
            const pokemonDetails = await pokemonData.json();
            const pokemonSprite = pokemonDetails.sprites.front_default;
            const pokemonObj = {
                name: pokemon.name,
                id: pokemonDetails.id,
                sprite: pokemonSprite,
                details: pokemonDetails
            };
            displayPokemon(pokemonObj);
        }
    });
}
