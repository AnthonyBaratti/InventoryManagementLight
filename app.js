/*
 *  Anthony Baratti
 *  11/23/2025
 *  InventoryManagementLight
 *  app.js
 * 
 *  Holds the application logic, sends and receives data from user via UI/index.html
 *  via event listeners and CRUD operations
 * 
 *  Practice Inventory Management with local storage
 *  simple CRUD UI for HTML/CSS Web app
 *  Possibly convert it to react later
 */


/*
 *  Helper function: shortcut for document.querySelector()
 *  Uses $("#id") instead of document.querySelector("#id")
 */
const $ = (sel) => document.querySelector(sel);

/*
 * All references to HTML elements interacted with.
 * IDs from index.html
 */
const addForm = $("#addForm");
const nameInput = $("#nameInput");
const qtyInput = $("#qtyInput");
const listElem = $("#list");
const emptyState = $("#emptyState");
const searchInput = $("#searchInput");
const clearAllBtn = $("#clearAllBtn");
const countElem = $("#count");

/*
 * Load existing items from local storage if any
 * if no data exists, load an empty array
 * Use let to declare variable instead of var, safer to make changes.
 */
let items = loadItems();

let filterText = "";

//Render once at startup
render();

/*
 * Event: Search input changes (fires every keystroke)
 * Updates filterText, then re-renders to show only matching items.
 */
searchInput.addEventListener("input", (e) => {
    filterText = e.target.value.toLowerCase();
    render();
})

// Event: form submit ("Add Item")
addForm.addEventListener("submit", (e) => {
    // Forms normally refresh the page---stop that.
    e.preventDefault();

    //Read inputs
    const name = nameInput.value.trim();
    const qty = Number(qtyInput.value) //convert string to number

    //Don't allow empty names
    if (!name) return;

    //Create object
    const newItem = {
        id: crypto.randomUUID(),                // unique ID for buttons/events
        name,                                   // item name
        qty: Number.isFinite(qty) ? qty : 0,    //safe number check
    };

    //Put new items at the top
    items.unshift(newItem);

    //Persist changes, reset form, and redraw UI
    saveItems();
    addForm.reset();
    qtyInput.value = 1;
    render();
});

// Event: Clear all items
clearAllBtn.addEventListener("click", () => {
    if (!items.length) return; // if items is empty, nothing to clear

    const ok = confirm("Clear all items?"); //safety net/warning for UI

    if (!ok) return; //break if not confirmed

    //if confirmed, clear items, update items, and render UI
    items = []; 
    saveItems();
    render();
});

/*
 * Render function:
 * rebuilds the visible list and counters from state
 */

function render() {
    //Filter items based on search text
    const filtered = items.filter(i =>
        i.name.toLowerCase().includes(filterText)
    );

    //Convert filtered items -> HTML strings -> HTML block
    listElem.innerHTML = filtered.map(renderItem).join("");

    //show empty message if nothing matches
    emptyState.style.display = filtered.length ? "none" : "block";

    //Update footer count
    countElem.textContent = `${filtered.length} item(s)`;

    //Afer HTML is injected, create button handlers
    filtered.forEach((item) => {
        $(`#inc-${item.id}`).addEventListener("click", () => updateQty(item.id, +1));
        $(`#dec-${item.id}`).addEventListener("click", () => updateQty(item.id, -1));
        $(`#del-${item.id}`).addEventListener("click", () => deleteItem(item.id));
    });
}


// Creates HTML for single <li> row
function renderItem(item) {
  return `
    <li class="item">
      <span class="name">${escapeHtml(item.name)}</span>
      <span class="badge">${item.qty}</span>

      <button id="dec-${item.id}" class="icon-btn" title="Decrease">−</button>
      <button id="inc-${item.id}" class="icon-btn" title="Increase">+</button>
      <button id="del-${item.id}" class="icon-btn danger" title="Delete">🗑</button>
    </li>
  `;
}

//Update qty by +1 or -1
function updateQty(id, delta) {
    const idx = items.findIndex(i => i.id === id); //Use === for numeric and type match
    if (idx === -1) return;

    //Keep qty from going negative
    items[idx].qty = Math.max(0, items[idx].qty + delta);

    saveItems();
    render();
}

//Remove item by ID
function deleteItem(id) {
    items = items.filter(i => i.id !== id);
    saveItems();
    render();
}

//Read from localStorage and return an array
function loadItems() {
    try {
        return JSON.parse(localStorage.getItem("inventory-items")) ?? [];
    }
    catch {
        return [];
    }
}

//Save current items to localStorage
function saveItems() {
    localStorage.setItem("inventory-items", JSON.stringify(items));
}

//Protect against HTML injection in field name
function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({
        "&" : "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",

    }[c]));
}