// =========================
// QUOTE GENERATOR WITH SERVER SYNC
// =========================

// Local data
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don't let yesterday take up too much of today.", category: "Motivation" },
    { text: "Creativity is intelligence having fun.", category: "Inspiration" }
];

let categoryFilter = document.getElementById("categoryFilter");
let quoteDisplay = document.getElementById("quoteDisplay");
let serverURL = "https://jsonplaceholder.typicode.com/posts"; // Mock API for simulation

// =========================
// POPULATE CATEGORIES
// =========================
function populateCategories() {
    let categories = ["All", ...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = "";
    categories.forEach(cat => {
        let option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });

    // Restore last selected filter
    let savedCategory = localStorage.getItem("selectedCategory");
    if (savedCategory && categories.includes(savedCategory)) {
        categoryFilter.value = savedCategory;
    }
}

// =========================
// FILTER QUOTES
// =========================
function filterQuotes() {
    let selectedCategory = categoryFilter.value;
    localStorage.setItem("selectedCategory", selectedCategory);

    let filtered = (selectedCategory === "All")
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

    displayRandomQuote(filtered);
}

// =========================
// DISPLAY RANDOM QUOTE
// =========================
function displayRandomQuote(filteredList = quotes) {
    if (filteredList.length === 0) {
        quoteDisplay.innerHTML = "No quotes in this category.";
        return;
    }
    let randomIndex = Math.floor(Math.random() * filteredList.length);
    quoteDisplay.innerHTML = `"${filteredList[randomIndex].text}" — ${filteredList[randomIndex].category}`;
}

// =========================
// ADD QUOTE
// =========================
function addQuote(text, category) {
    quotes.push({ text, category });
    localStorage.setItem("quotes", JSON.stringify(quotes));
    populateCategories();
    filterQuotes();
    syncWithServer(); // Push new quote to server
}

// =========================
// SERVER SYNC
// =========================
async function syncWithServer() {
    try {
        // Fetch from server
        let response = await fetch(serverURL);
        let serverData = await response.json();

        // Convert mock data into quotes format
        let serverQuotes = serverData.slice(0, 5).map(post => ({
            text: post.title,
            category: "Server"
        }));

        // Conflict resolution: Server overwrites local duplicates
        let mergedQuotes = [...serverQuotes, ...quotes.filter(lq => 
            !serverQuotes.some(sq => sq.text === lq.text)
        )];

        quotes = mergedQuotes;
        localStorage.setItem("quotes", JSON.stringify(quotes));
        populateCategories();
        filterQuotes();

        console.log("Sync complete. Quotes updated from server.");
    } catch (err) {
        console.error("Error syncing with server:", err);
    }
}

// =========================
// INIT
// =========================
window.onload = () => {
    populateCategories();
    filterQuotes();
    displayRandomQuote();

    // Periodic server sync every 30 seconds
    setInterval(syncWithServer, 30000);
};
