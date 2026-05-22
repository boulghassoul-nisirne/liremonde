const API_URL = "http://localhost:3000/books";

let allBooks = [];
let currentFilter = "Tout";
let currentSearch = "";

/* =========================
   INITIALISATION
========================= */

document.addEventListener("DOMContentLoaded", () => {
  fetchBooks();
});

/* =========================
   FETCH BOOKS
========================= */

async function fetchBooks() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Erreur API");
    }

    allBooks = await response.json();

    renderUI();

  } catch (error) {
    console.error(error);
    alert("Impossible de charger les livres");
  }
}

/* =========================
   RENDER UI
========================= */

function renderUI() {
  renderFilters();
  renderHomeGrid();
  renderWishlist();
  renderAdminTable();
}

/* =========================
   FILTERS
========================= */

function renderFilters() {

  const genres = [
    "Tout",
    ...new Set(allBooks.map(book => book.genre))
  ];

  const container = document.getElementById("genreFilters");

  container.innerHTML = "";

  genres.forEach(genre => {

    const button = document.createElement("button");

    button.textContent = genre;

    button.className =
      currentFilter === genre
        ? "px-4 py-1 rounded-full bg-blue-600 text-white"
        : "px-4 py-1 rounded-full bg-gray-200 text-gray-700";

    button.onclick = () => applyFilter(genre);

    container.appendChild(button);

  });

}

function applyFilter(genre) {
  currentFilter = genre;
  renderHomeGrid();
}

/* =========================
   SEARCH
========================= */

function handleSearch(value) {
  currentSearch = value;
  renderHomeGrid();
}

/* =========================
   HOME GRID
========================= */

function renderHomeGrid() {

  const grid = document.getElementById("booksGrid");

  grid.innerHTML = "";

  const filteredBooks = allBooks.filter(book => {

    const matchGenre =
      currentFilter === "Tout" ||
      book.genre === currentFilter;

    const matchSearch =
      book.titre.toLowerCase().includes(currentSearch.toLowerCase()) ||
      book.auteur.toLowerCase().includes(currentSearch.toLowerCase());

    return matchGenre && matchSearch;

  });

  filteredBooks.forEach(book => {

    const card = document.createElement("div");

    card.className =
      "book-card bg-white rounded-xl shadow-sm border overflow-hidden";

    card.innerHTML = `
      <img
        src="${book.couverture}"
        class="w-full h-56 object-cover"
      >

      <div class="p-5">

        <span class="text-xs font-bold text-blue-500 uppercase">
          ${book.genre}
        </span>

        <h3 class="text-lg font-bold mt-1">
          ${book.titre}
        </h3>

        <p class="text-sm text-gray-600 mb-4">
          ${book.auteur}
        </p>

        <button
          class="w-full py-2 bg-blue-600 text-white rounded-lg">
          Voir détails
        </button>

      </div>
    `;

    card.querySelector("button")
      .addEventListener("click", () => {
        viewDetails(book.id);
      });

    grid.appendChild(card);

  });

}

/* =========================
   DETAILS
========================= */

function viewDetails(id) {

  const book = allBooks.find(book => book.id == id);

  if (!book) return;

  document.getElementById("mCover").src = book.couverture;
  document.getElementById("mGenre").textContent = book.genre;
  document.getElementById("mTitre").textContent = book.titre;
  document.getElementById("mAuteur").textContent = book.auteur;
  document.getElementById("mDesc").textContent = book.description;

  document
    .getElementById("modalDetails")
    .classList.remove("hidden");

}

/* =========================
   WISHLIST
========================= */

function renderWishlist() {

  const grid = document.getElementById("wishlistGrid");

  const empty = document.getElementById("emptyWishlist");

  const wishlist = allBooks.filter(book => book.aLire);

  grid.innerHTML = "";

  if (wishlist.length === 0) {

    empty.classList.remove("hidden");

    return;
  }

  empty.classList.add("hidden");

  wishlist.forEach(book => {

    const card = document.createElement("div");

    card.className =
      "bg-white p-4 rounded-xl shadow flex items-center gap-4";

    card.innerHTML = `
      <img
        src="${book.couverture}"
        class="w-16 h-20 object-cover rounded"
      >

      <div class="flex-grow">
        <h4 class="font-bold">${book.titre}</h4>
        <p class="text-sm text-gray-500">${book.auteur}</p>
      </div>

      <button class="text-red-500">
        <i class="fas fa-trash"></i>
      </button>
    `;

    card.querySelector("button")
      .addEventListener("click", () => {
        toggleWishlist(book.id, false);
      });

    grid.appendChild(card);

  });

}

async function toggleWishlist(id, status) {

  try {

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        aLire: status
      })
    });

    if (response.ok) {
      fetchBooks();
    }

  } catch (error) {

    console.error(error);

  }

}

/* =========================
   ADMIN TABLE
========================= */

function renderAdminTable() {

  const tbody = document.getElementById("adminTableBody");

  tbody.innerHTML = "";

  allBooks.forEach(book => {

    const tr = document.createElement("tr");

    tr.className = "border-b";

    tr.innerHTML = `
      <td class="p-4">#${book.id}</td>

      <td class="p-4">
        <img
          src="${book.couverture}"
          class="w-12 h-16 object-cover rounded"
        >
      </td>

      <td class="p-4">
        <div class="font-bold">${book.titre}</div>
        <div class="text-sm text-gray-500">${book.auteur}</div>
      </td>

      <td class="p-4">${book.genre}</td>

      <td class="p-4 flex gap-3">

        <button class="editBtn text-blue-500">
          <i class="fas fa-edit"></i>
        </button>

        <button class="deleteBtn text-red-500">
          <i class="fas fa-trash"></i>
        </button>

      </td>
    `;

    tr.querySelector(".editBtn")
      .addEventListener("click", () => {
        editBook(book.id);
      });

    tr.querySelector(".deleteBtn")
      .addEventListener("click", () => {
        deleteBook(book.id);
      });

    tbody.appendChild(tr);

  });

}

/* =========================
   OPEN MODAL
========================= */

function openBookModal(id = null) {

  const modal = document.getElementById("modalForm");

  const form = document.getElementById("bookForm");

  form.reset();

  document.getElementById("bookId").value = "";

  document.getElementById("formTitle").textContent =
    "Ajouter un livre";

  if (id) {

    const book = allBooks.find(book => book.id == id);

    document.getElementById("bookId").value = book.id;
    document.getElementById("fTitre").value = book.titre;
    document.getElementById("fAuteur").value = book.auteur;
    document.getElementById("fGenre").value = book.genre;
    document.getElementById("fDesc").value = book.description;
    document.getElementById("fCover").value = book.couverture;
    document.getElementById("fALire").checked = book.aLire;

    document.getElementById("formTitle").textContent =
      "Modifier le livre";
  }

  modal.classList.remove("hidden");

}

/* =========================
   ADD / UPDATE
========================= */

async function handleFormSubmit(event) {

  event.preventDefault();

  const id = document.getElementById("bookId").value;

  const data = {
    titre: document.getElementById("fTitre").value,
    auteur: document.getElementById("fAuteur").value,
    genre: document.getElementById("fGenre").value,
    description: document.getElementById("fDesc").value,
    couverture: document.getElementById("fCover").value,
    aLire: document.getElementById("fALire").checked
  };

  try {

    const url = id
      ? `${API_URL}/${id}`
      : API_URL;

    const method = id
      ? "PUT"
      : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {

      closeModal("modalForm");

      fetchBooks();

    }

  } catch (error) {

    console.error(error);

  }

}

/* =========================
   DELETE
========================= */

async function deleteBook(id) {

  const confirmDelete =
    confirm("Supprimer ce livre ?");

  if (!confirmDelete) return;

  try {

    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      fetchBooks();
    }

  } catch (error) {

    console.error(error);

  }

}

/* =========================
   EDIT
========================= */

function editBook(id) {
  openBookModal(id);
}

/* =========================
   TABS
========================= */

function switchTab(tab) {

  document.querySelectorAll("section")
    .forEach(section => {
      section.classList.add("hidden");
    });

  document
    .getElementById(`sec-${tab}`)
    .classList.remove("hidden");

}

/* =========================
   CLOSE MODAL
========================= */

function closeModal(modalId) {

  document
    .getElementById(modalId)
    .classList.add("hidden");

}