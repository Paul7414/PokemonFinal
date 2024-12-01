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
document.addEventListener('DOMContentLoaded', loadMyPokemon);

