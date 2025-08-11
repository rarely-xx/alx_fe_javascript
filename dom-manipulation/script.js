// Local quotes array
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" }
];

let selectedCategory = localStorage.getItem("selectedCategory") || "";

// DOM elements
const quoteDisplay = document.getElementById("quote-display");
const categorySelect = document.getElementById("category-select");
const notification = document.getElementById("notification");

// Display a random quote
function displayRandomQuote() {
  let filteredQuotes = selectedCategory
    ? quotes.filter(q => q.category === selectedCategory)
    : quotes;

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes found for this category.";
    return;
  }

  let randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.innerHTML = `"${filteredQuotes[randomIndex].text}" - ${filteredQuotes[randomIndex].category}`;
}

// Populate dropdown categories
function populateCategories() {
  let categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = `<option value="">All</option>`;
  categories.forEach(cat => {
    let option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === selectedCategory) option.selected = true;
    categorySelect.appendChild(option);
  });
}

// Filter quotes by selected category
function filterQuote() {
  selectedCategory = categorySelect.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  displayRandomQuote();
}

// Add a new quote
function addQuote(text, category) {
  if (!text || !category) return;
  quotes.push({ text, category });
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
  displayRandomQuote();
}

// Fetch from mock server
async function fetchQuotesFromServer() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await res.json();
  return data.slice(0, 5).map((item, index) => ({
    text: item.title,
    category: index % 2 === 0 ? "Inspiration" : "Life"
  }));
}

// Sync local quotes with server
async function syncQuotes() {
  let serverQuotes = await fetchQuotesFromServer();
  let serverTexts = serverQuotes.map(q => q.text);
  let localTexts = quotes.map(q => q.text);

  let merged = [...quotes];
  serverQuotes.forEach(sq => {
    if (!localTexts.includes(sq.text)) {
      merged.push(sq);
    }
  });

  quotes = merged;
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
  displayRandomQuote();
  showNotification("Quotes synced with server!");
}

// Show notification in UI
function showNotification(message) {
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// Event listeners
document.getElementById("show-quote").addEventListener("click", displayRandomQuote);
document.getElementById("add-quote-form").addEventListener("submit", e => {
  e.preventDefault();
  let text = document.getElementById("new-quote-text").value.trim();
  let category = document.getElementById("new-quote-category").value.trim();
  addQuote(text, category);
  e.target.reset();
});
categorySelect.addEventListener("change", filterQuote);

// Auto sync every 10 seconds
setInterval(syncQuotes, 10000);

// Init
populateCategories();
displayRandomQuote();
