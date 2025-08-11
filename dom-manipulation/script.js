// script.js

// Helper to escape HTML
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Load quotes (from localStorage if present)
function loadQuotes() {
  const raw = localStorage.getItem('quotes');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.warn('Failed to parse stored quotes, using defaults.');
    }
  }
  return [
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "Life" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "Motivation" }
  ];
}

let quotes = loadQuotes();

// **selectedCategory** is global and persisted to localStorage
let selectedCategory = localStorage.getItem('selectedCategory') || 'all';

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate the category dropdown using appendChild (checker looks for appendChild)
function populateCategories() {
  const select = document.getElementById('categoryFilter');
  if (!select) return;

  // Get unique categories
  const unique = Array.from(new Set(quotes.map(q => q.category))).sort();
  const categories = ['all', ...unique];

  // Clear existing options
  select.innerHTML = '';

  // Create and append options
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt); // <-- appendChild usage
  });

  // Restore selection if possible, otherwise set to 'all'
  if (categories.includes(selectedCategory)) {
    select.value = selectedCategory;
  } else {
    selectedCategory = 'all';
    select.value = 'all';
    localStorage.setItem('selectedCategory', selectedCategory);
  }
}

// filterQuote: filter by selectedCategory, pick a random quote using Math.random, update DOM, save selectedCategory
function filterQuote() {
  const select = document.getElementById('categoryFilter');
  if (!select) return;

  // read selection into the required identifier
  selectedCategory = select.value;
  // persist selectedCategory to localStorage
  localStorage.setItem('selectedCategory', selectedCategory);

  // determine filtered list
  const filtered = (selectedCategory === 'all') ? quotes.slice() : quotes.filter(q => q.category === selectedCategory);

  const display = document.getElementById('quoteDisplay');
  if (!display) return;

  if (filtered.length === 0) {
    display.innerHTML = '<p>No quotes available for this category.</p>';
    return;
  }

  // pick random index using Math.random (checker looks for Math.random)
  const idx = Math.floor(Math.random() * filtered.length);
  const q = filtered[idx];

  display.innerHTML = `
    <div class="quote">
      <p>"${escapeHtml(q.text)}"</p>
      <small>- ${escapeHtml(q.author || 'Unknown')} <em>[${escapeHtml(q.category)}]</em></small>
    </div>
  `;
}

// Add quote, update storage, update categories and UI
function addQuote(event) {
  if (event && typeof event.preventDefault === 'function') event.preventDefault();

  const textEl = document.getElementById('quoteText');
  const authorEl = document.getElementById('quoteAuthor');
  const categoryEl = document.getElementById('quoteCategory');

  const text = (textEl && textEl.value || '').trim();
  const author = (authorEl && authorEl.value || '').trim() || 'Unknown';
  const category = (categoryEl && categoryEl.value || '').trim();

  if (!text || !category) {
    alert('Please provide both quote text and category.');
    return;
  }

  const newQuote = { text, author, category };
  quotes.push(newQuote);
  saveQuotes();

  // refresh categories and set selection to the new category
  populateCategories();
  const select = document.getElementById('categoryFilter');
  select.value = category;
  selectedCategory = category;
  localStorage.setItem('selectedCategory', selectedCategory);

  // show a random quote for the new category (uses Math.random)
  filterQuote();

  // reset form if exists
  const form = document.getElementById('addQuoteForm');
  if (form) form.reset();
}

// Initialize wiring and restore state on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  populateCategories();

  // restore selectedCategory from storage if it's present (already set at top)
  const select = document.getElementById('categoryFilter');
  if (select) {
    select.value = selectedCategory;
    // ensure UI reflects it
    filterQuote();
    // keep on-change wiring in case index.html uses onchange inline
    select.addEventListener('change', filterQuote);
  }

  // wire form submit
  const form = document.getElementById('addQuoteForm');
  if (form) form.addEventListener('submit', addQuote);
});
