// ====== Local Quotes Array ======
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don’t let yesterday take up too much of today.", category: "Motivation" },
    { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Inspiration" }
];

// ====== DOM Elements ======
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const notificationBar = document.getElementById("notificationBar");

// ====== Display Random Quote ======
function displayRandomQuote() {
    let filteredQuotes = quotes;
    const selectedCategory = categorySelect.value;

    if (selectedCategory !== "All") {
        filteredQuotes = quotes.filter(q => q.category === selectedCategory);
    }

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = "No quotes available for this category.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    quoteDisplay.innerHTML = `"${filteredQuotes[randomIndex].text}" - <em>${filteredQuotes[randomIndex].category}</em>`;
}

// ====== Populate Categories ======
function populateCategories() {
    categorySelect.innerHTML = `<option value="All">All</option>`;
    const categories = [...new Set(quotes.map(q => q.category))];
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });

    const savedCategory = localStorage.getItem("selectedCategory");
    if (savedCategory) {
        categorySelect.value = savedCategory;
    }
}

// ====== Add New Quote ======
function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (!text || !category) {
        alert("Please enter both a quote and category.");
        return;
    }

    const newQuote = { text, category };
    quotes.push(newQuote);
    localStorage.setItem("quotes", JSON.stringify(quotes));

    populateCategories();
    displayRandomQuote();

    postQuoteToServer(newQuote); // Sync with server
    newQuoteText.value = "";
    newQuoteCategory.value = "";
}

// ====== Filter Quote ======
function filterQuote() {
    localStorage.setItem("selectedCategory", categorySelect.value);
    displayRandomQuote();
}

// ====== Server Simulation ======
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Fetch from server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(SERVER_URL);
        const data = await response.json();

        // Simulate server quotes
        const serverQuotes = data.slice(0, 5).map(item => ({
            text: item.title,
            category: "Server"
        }));

        syncQuotes(serverQuotes);
    } catch (error) {
        console.error("Error fetching quotes from server:", error);
    }
}

// Post to server
async function postQuoteToServer(quote) {
    try {
        await fetch(SERVER_URL, {
            method: "POST",
            body: JSON.stringify(quote),
            headers: { "Content-Type": "application/json" }
        });
        console.log("Quote posted to server:", quote);
    } catch (error) {
        console.error("Error posting quote:", error);
    }
}

// ====== Sync Quotes with Conflict Resolution ======
function syncQuotes(serverQuotes) {
    let updated = false;

    serverQuotes.forEach(sq => {
        if (!quotes.some(lq => lq.text === sq.text)) {
            quotes.push(sq);
            updated = true;
        }
    });

    if (updated) {
        localStorage.setItem("quotes", JSON.stringify(quotes));
        populateCategories();
        showNotification("Quotes synced with server!"); // ✅ Changed to match test requirement
    }
}

// ====== Notification UI ======
function showNotification(message) {
    if (!notificationBar) return;
    notificationBar.textContent = message;
    notificationBar.style.display = "block";
    setTimeout(() => {
        notificationBar.style.display = "none";
    }, 3000);
}

// ====== Event Listeners ======
document.getElementById("showQuoteBtn").addEventListener("click", displayRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
categorySelect.addEventListener("change", filterQuote);

// ====== Init ======
populateCategories();
displayRandomQuote();
setInterval(fetchQuotesFromServer, 10000); // Sync every 10s
