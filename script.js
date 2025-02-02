// Global variables
let allPokemon = [];
let ownedPokemon = JSON.parse(localStorage.getItem("ownedPokemon")) || [];
const pokemonList = document.getElementById("pokemonList");
const searchBar = document.getElementById("searchBar");

// Fetch Pokémon data
async function fetchPokemonList() {
    try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
        const data = await response.json();

        // Fetch detailed data for each Pokémon
        allPokemon = await Promise.all(
            data.results.map(async (pokemon) => {
                const res = await fetch(pokemon.url);
                return res.json();
            })
        );

        displayPokemon(allPokemon); // Display all Pokémon initially
    } catch (error) {
        console.error("Error fetching Pokémon list:", error);
    }
}

// Fetch type relationship data
async function fetchDataType(typeName) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
        const data = await response.json();
        return {
            strengths: data.damage_relations.double_damage_to.map((type) => type.name),
            weaknesses: data.damage_relations.double_damage_from.map((type) => type.name),
            immunities: data.damage_relations.no_damage_from.map((type) => type.name),
        };
    } catch (error) {
        console.error(`Error fetching type data for ${typeName}:`, error);
        return { strengths: [], weaknesses: [], immunities: [] };
    }
}

// Display Pokémon cards
function displayPokemon(pokemonArray) {
    pokemonList.innerHTML = ""; // Clear existing content

    pokemonArray.forEach((pokemon) => {
        const pokemonCard = document.createElement("div");
        pokemonCard.classList.add("pokemon-card");

        // Add event listener to view details
        pokemonCard.addEventListener("click", () => {
            viewPokemonDetails(pokemon);
        });

        // Create the card HTML
        pokemonCard.innerHTML = `
            <h3>${pokemon.name}</h3>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p>Type: ${pokemon.types.map((type) => type.type.name).join(", ")}</p>
            <button class="own-button ${
                ownedPokemon.includes(pokemon.name) ? "owned" : ""
            }">${ownedPokemon.includes(pokemon.name) ? "Owned" : "Mark as Owned"}</button>
        `;

        // Add ownership functionality
        const ownButton = pokemonCard.querySelector(".own-button");
        ownButton.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent triggering card click
            toggleOwnership(pokemon);
        });

        pokemonList.appendChild(pokemonCard);
    });
}

// View Pokémon details
async function viewPokemonDetails(pokemon) {
    const modal = document.createElement("div");
    modal.classList.add("pokemon-modal");

    // Fetch type relationship data for each type
    const typeData = await Promise.all(
        pokemon.types.map(async (typeInfo) => {
            return {
                type: typeInfo.type.name,
                relationships: await fetchDataType(typeInfo.type.name),
            };
        })
    );

    // Generate type relationship content
    const typeContent = typeData
        .map(
            (type) => `
        <div>
            <h4>${type.type}</h4>
            <p><strong>Strengths:</strong> ${type.relationships.strengths.join(", ") || "None"}</p>
            <p><strong>Weaknesses:</strong> ${type.relationships.weaknesses.join(", ") || "None"}</p>
            <p><strong>Immunities:</strong> ${type.relationships.immunities.join(", ") || "None"}</p>
        </div>
        `
        )
        .join("");

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2>${pokemon.name}</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p><strong>Type:</strong> ${pokemon.types.map((type) => type.type.name).join(", ")}</p>
            <p><strong>Height:</strong> ${pokemon.height}</p>
            <p><strong>Weight:</strong> ${pokemon.weight}</p>
            <p><strong>Abilities:</strong> ${pokemon.abilities.map((ability) => ability.ability.name).join(", ")}</p>
            <div>
            <h3>Type Relationships:</h3>
            ${typeContent}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close the modal
    const closeButton = modal.querySelector(".close-button");
    closeButton.addEventListener("click", () => {
        modal.remove();
    });
}

// Toggle Pokémon ownership
function toggleOwnership(pokemon) {
    if (ownedPokemon.includes(pokemon.name)) {
        ownedPokemon = ownedPokemon.filter((name) => name !== pokemon.name);
    } else {
        ownedPokemon.push(pokemon.name);
    }
    localStorage.setItem("ownedPokemon", JSON.stringify(ownedPokemon));
    displayPokemon(allPokemon); // Refresh cards to update button states
}

// Search functionality
searchBar.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredPokemon = allPokemon.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchTerm)
    );
    displayPokemon(filteredPokemon);
});

// Fetch and display Pokémon on page load
fetchPokemonList();
