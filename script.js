const API_URL = "http://localhost:3000/books";

let allBooks = [];
let currentFilter = "Tout";
let currentSearch = "";

/* INIT */
document.addEventListener("DOMContentLoaded", fetchBooks);

/* FETCH */
async function fetchBooks() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("API Error");

    allBooks = await res.json();
    renderUI();

  } catch (err) {
    console.error(err);
    alert("Impossible de charger les livres");
  }
}

/* RENDER ALL */
function renderUI() {
  renderFilters();
  renderHome();
  renderWishlist();
  renderAdmin();
}

/* FILTERS */
function renderFilters() {
  const genres = ["Tout", ...new Set(allBooks.map(b => b.genre))];
  const container = document.getElementById("genreFilters");

  container.innerHTML = "";

  genres.forEach(genre => {
    const btn = document.createElement("button");

    btn.textContent = genre;
   btn.className = currentFilter === genre
  ? "px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow"
  : "px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition";
   btn.onclick = () => {
  currentFilter = genre;

  renderFilters();
  renderHome();
};

    container.appendChild(btn);
  });
}

/* SEARCH */
function handleSearch(value) {
  currentSearch = value.toLowerCase();
  renderHome();
}
/* HOME */
function renderHome() {
  const grid = document.getElementById("booksGrid");
  grid.innerHTML = "";

  const books = allBooks.filter(b => {
    const matchFilter =
      currentFilter === "Tout" || b.genre === currentFilter;

    const matchSearch =
      b.titre.toLowerCase().includes(currentSearch) ||
      b.auteur.toLowerCase().includes(currentSearch);

    return matchFilter && matchSearch;
  });

  books.forEach(book => {
    const div = document.createElement("div");
    div.className = "book-card bg-white rounded-xl shadow overflow-hidden";

    div.innerHTML = `
      <img src="${book.couverture}" class="w-full h-56 object-cover">
      <div class="p-4">
        <h3 class="font-bold">${book.titre}</h3>
        <p class="text-sm text-gray-600">${book.auteur}</p>
        <button class="mt-3 w-full bg-blue-600 text-white py-2 rounded">
          Voir détails
        </button>
      </div>
    `;

    div.querySelector("button").onclick = () => viewDetails(book.id);

    grid.appendChild(div);
  });
}

/* DETAILS */
function viewDetails(id) {
  const book = allBooks.find(b => b.id == id);
  if (!book) return;

  document.getElementById("mCover").src = book.couverture;
  document.getElementById("mGenre").textContent = book.genre;
  document.getElementById("mTitre").textContent = book.titre;
  document.getElementById("mAuteur").textContent = book.auteur;
  document.getElementById("mDesc").textContent = book.description;

  document.getElementById("modalDetails").classList.remove("hidden");
}

/* WISHLIST */
function renderWishlist() {
  const grid = document.getElementById("wishlistGrid");
  const empty = document.getElementById("emptyWishlist");

  const list = allBooks.filter(b => b.aLire);

  grid.innerHTML = "";

  if (!list.length) {
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

  list.forEach(book => {
    const div = document.createElement("div");
    div.className = "bg-white p-4 rounded-xl shadow flex gap-3 items-center";

    div.innerHTML = `
      <img src="${book.couverture}" class="w-16 h-20 object-cover rounded">
      <div>
        <h4 class="font-bold">${book.titre}</h4>
        <p class="text-sm text-gray-500">${book.auteur}</p>
      </div>
      <button class="text-red-500">🗑</button>
    `;

    div.querySelector("button").onclick =
      () => toggleWishlist(book.id, false);

    grid.appendChild(div);
  });
}

/* TOGGLE WISHLIST */
async function toggleWishlist(id, status) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aLire: status })
    });

    fetchBooks();

  } catch (err) {
    console.error(err);
  }
}

/* ADMIN */
function renderAdmin() {
  const tbody = document.getElementById("adminTableBody");
  tbody.innerHTML = "";

  allBooks.forEach(book => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>#${book.id}</td>
      <td><img src="${book.couverture}" class="w-12 h-16"></td>
      <td>${book.titre}</td>
      <td>${book.genre}</td>
      <td>
        <button class="edit">✏️</button>
        <button class="del">🗑</button>
      </td>
    `;

    tr.querySelector(".edit").onclick = () => editBook(book.id);
    tr.querySelector(".del").onclick = () => deleteBook(book.id);

    tbody.appendChild(tr);
  });
}

/* MODAL */
function openBookModal(id = null) {
  const modal = document.getElementById("modalForm");
  const form = document.getElementById("bookForm");

  form.reset();
  document.getElementById("bookId").value = "";

  if (id) {
    const b = allBooks.find(x => x.id == id);

    document.getElementById("bookId").value = b.id;
    document.getElementById("fTitre").value = b.titre;
    document.getElementById("fAuteur").value = b.auteur;
    document.getElementById("fGenre").value = b.genre;
    document.getElementById("fDesc").value = b.description;
    document.getElementById("fCover").value = b.couverture;
    document.getElementById("fALire").checked = b.aLire;
  }

  modal.classList.remove("hidden");
}

/* ADD / UPDATE */
async function handleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("bookId").value;

  const data = {
    titre: fTitre.value,
    auteur: fAuteur.value,
    genre: fGenre.value,
    description: fDesc.value,
    couverture: fCover.value,
    aLire: fALire.checked
  };

  await fetch(id ? `${API_URL}/${id}` : API_URL, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  closeModal("modalForm");
  fetchBooks();
}

/* DELETE */
async function deleteBook(id) {
  if (!confirm("Supprimer ce livre ?")) return;

  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  fetchBooks();
}

/* TABS */
function switchTab(tab) {

  // hide all sections
  document.querySelectorAll("main section").forEach(s => {
    s.classList.add("hidden");
  });

  // show selected section
  const section = document.getElementById(`sec-${tab}`);
  if (section) section.classList.remove("hidden");

  // remove active from all buttons
  document.querySelectorAll("nav button").forEach(btn => {
    btn.classList.remove("active-tab");
  });

  // add active to clicked button
  const activeBtn = document.getElementById(`tab-${tab}`);
  if (activeBtn) {
    activeBtn.classList.add("active-tab");
  }
}

/* CLOSE MODAL */
function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

/* EDIT */
function editBook(id) {
  openBookModal(id);
}
document.addEventListener("DOMContentLoaded", () => {
  switchTab("home");
});