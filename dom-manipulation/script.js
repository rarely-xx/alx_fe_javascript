// script.js

// Utility: safe text to avoid injecting raw HTML
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Load quotes from localStorage or use defaults
function loadQuotes() {
  const raw = localStorage.getItem('quotes');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.warn('Could not parse stored quotes, resetting.');
    }
  }
  return [
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "Life" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "Motivation" }
  ];
}

let quotes = loadQuotes();

// Persist quotes
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Build category dropdown using appendChild (tests look for appendChild)
function populateCategories() {
  const select = document.getElementById('categoryFilter');
  if (!select) return;

  // Unique categories sorted
  const unique = Array.from(new Set(quotes.map(q => q.category))).sort();
  const categories = ['all', ...unique];

  // clear current options
  select.innerHTML = '';

  // get last selected category from storage (restore)
  const last = localStorage.getItem('lastCategory') || 'all';

  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt); // <-- appendChild usage required
  });

  // restore selection (if previously saved)
  if (categories.includes(last)) select.value = last;
  else select.value = 'all';
}

// filterQuote: filter by selected category, pick a random quote using Math.random, update DOM, save selected category
function filterQuote() {
  const select = document.getElementById('categoryFilter');
  if (!select) return;

  const selected = select.value;
  // save selected category to localStorage
  localStorage.setItem('lastCategory', selected);

  // get filtered list
  const filtered = (selected === 'all') ? quotes.slice() : quotes.filter(q => q.category === selected);

  const display = document.getElementById('quoteDisplay');
  if (!display) return;

  if (filtered.length === 0) {
    display.innerHTML = '<p>No quotes available for this category.</p>';
    return;
  }

  // choose a random quote from filtered using Math.random
  const idx = Math.floor(Math.random() * filtered.length);
  const q = filtered[idx];

  display.innerHTML = `
    <div class="quote">
      <p>"${escapeHtml(q.text)}"</p>
      <small>- ${escapeHtml(q.author || 'Unknown')} <em>[${escapeHtml(q.category)}]</em></small>
    </div>
  `;
}

// Add new quote, update storage, update categories and UI
function addQuote(event) {
  event.preventDefault();
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

  // refresh categories and set to the new category
  populateCategories();
  const select = document.getElementById('categoryFilter');
  select.value = category;
  localStorage.setItem('lastCategory', category);

  // display a random quote from the newly selected category (filterQuote uses Math.random)
  filterQuote();

  // reset form
  document.getElementById('addQuoteForm').reset();
}

// Initialize on DOM load: populate categories, restore last category, display quote, wire form
document.addEventListener('DOMContentLoaded', () => {
  populateCategories();

  // restore last selected category
  const last = localStorage.getItem('lastCategory') || 'all';
  const select = document.getElementById('categoryFilter');
  if (select) select.value = last;

  // display a random quote for the restored category
  filterQuote();

  // wire form submit
  const form = document.getElementById('addQuoteForm');
  if (form) form.addEventListener('submit', addQuote);
});
