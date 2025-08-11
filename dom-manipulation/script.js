// Quotes array
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don’t let yesterday take up too much of today.", category: "Motivation" },
    { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Resilience" }
];

let selectedCategory = localStorage.getItem('selectedCategory') || 'All';

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const categorySelect = document.getElementById('categorySelect');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');

// Display a random quote
function displayRandomQuote() {
    let filteredQuotes = quotes;
    if (selectedCategory !== 'All') {
        filteredQuotes = quotes.filter(q => q.category === selectedCategory);
    }
    if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        quoteDisplay.textContent = filteredQuotes[randomIndex].text;
    } else {
        quoteDisplay.textContent = "No quotes available for this category.";
    }
}

// Filter quotes by category
function filterQuote(category) {
    selectedCategory = category;
    localStorage.setItem('selectedCategory', selectedCategory);
    displayRandomQuote();
}

// Add a new quote
function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();
    if (text && category) {
        quotes.push({ text, category });
        localStorage.setItem('quotes', JSON.stringify(quotes));
        newQuoteText.value = '';
        newQuoteCategory.value = '';
        displayRandomQuote();
        postQuoteToServer({ text, category });
    }
}

// Notification function
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '10px';
    notification.style.right = '10px';
    notification.style.backgroundColor = '#4caf50';
    notification.style.color = '#fff';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Fetch quotes from server (mock API)
async function fetchQuotesFromServer() {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    const data = await res.json();
    // Convert mock data into our quote format
    return data.map(item => ({
        text: item.title,
        category: "Server"
    }));
}

// Post new quote to server (mock)
async function postQuoteToServer(quote) {
    await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify(quote),
        headers: { 'Content-type': 'application/json; charset=UTF-8' }
    });
}

// Sync quotes with server and handle conflicts
async function syncQuotes() {
    try {
        const serverQuotes = await fetchQuotesFromServer();
        // Conflict resolution: server data takes precedence
        quotes = [...serverQuotes];
        localStorage.setItem('quotes', JSON.stringify(quotes));
        displayRandomQuote();
        showNotification("Quotes synced with server!");
    } catch (err) {
        console.error("Error syncing quotes:", err);
    }
}

// Event listeners
categorySelect.addEventListener('change', (e) => filterQuote(e.target.value));
addQuoteBtn.addEventListener('click', addQuote);

// Restore last selected category
categorySelect.value = selectedCategory;

// Initial display
displayRandomQuote();

// Periodic sync (every 30 seconds)
setInterval(syncQuotes, 30000);
