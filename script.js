const pokemonList = document.getElementById("pokemonList");
const searchBar = document.getElementById("searchBar");

// Fetch Pokemon data
async function fetchPokemon() {
    try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
        const data = await response.json();
        displayPokemon(data.results);
    } catch (error) {
        console.error("Error fetching Pokemon list:", error);
    }
}

// Display Pokemon in cards
function displayPokemon(pokemonArray) {
    pokemonList.innerHTML = ""; // Clear existing content
    pokemonArray.forEach(async (pokemon) => {
        const res = await fetch(pokemon.url);
        const details = await res.json();

        // Create a Pokemon Card 
        const pokemonCard = document.createElement("div");
        pokemonCard.classList.add("pokemon-card");

        // Populate the card
        pokemonCard.innerHTML = `
        <h3>${details.name}</h3>
        <img src="${details.sprites.front_default}" alt="${details.name}">
        <p>Type: ${details.types.map((type) => type.type.name).join(", ")}</p>
        `;

        // Add the card to the container
        pokemonList.appendChild(pokemonCard);
    });
}

//Search Pokemon
searchBar.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredPokemon = allPokemon.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchTerm)
    );
    displayPokemon(filteredPokemon);
});

fetchPokemon();