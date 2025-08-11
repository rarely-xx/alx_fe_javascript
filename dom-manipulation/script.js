let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", author: "Will Rogers", category: "Inspiration" }
];

// Restore last selected category
let lastCategory = localStorage.getItem("lastCategory") || "all";

document.getElementById("showQuoteBtn").addEventListener("click", displayRandomQuote);
document.getElementById("addQuoteForm").addEventListener("submit", addQuote);
document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

// Load categories on page load
populateCategories();
filterQuotes();

// ✅ Display random quote
function displayRandomQuote() {
  let filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "No quotes in this category.";
    return;
  }
  let randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  let quote = filteredQuotes[randomIndex];
  document.getElementById("quoteDisplay").innerHTML = `"${quote.text}" - ${quote.author} <em>[${quote.category}]</em>`;
}

// ✅ Add new quote
function addQuote(event) {
  event.preventDefault();
  const text = document.getElementById("quoteText").value.trim();
  const author = document.getElementById("quoteAuthor").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (text && author && category) {
    quotes.push({ text, author, category });
    saveQuotes();
    populateCategories();
    filterQuotes();
    document.getElementById("addQuoteForm").reset();
    alert("Quote added successfully!");
  }
}

// ✅ Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ✅ Populate category dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const uniqueCategories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = uniqueCategories.map(cat => 
    `<option value="${cat}" ${cat === lastCategory ? "selected" : ""}>${cat}</option>`
  ).join("");
}

// ✅ Filter quotes
function filterQuotes() {
  lastCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastCategory", lastCategory);
  displayRandomQuote();
}

// Helper: get filtered quotes array
function getFilteredQuotes() {
  if (lastCategory === "all") return quotes;
  return quotes.filter(q => q.category === lastCategory);
}

// ✅ Export quotes to JSON
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ✅ Import quotes from JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch {
      alert("Error reading file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}
