const storageKey = "bookRecords";

const menuView = document.getElementById("menu-view");
const formView = document.getElementById("form-view");
const listView = document.getElementById("list-view");
const yearlyView = document.getElementById("yearly-view");

const openFormButton = document.getElementById("open-form-button");
const openListButton = document.getElementById("open-list-button");
const openYearlyButton = document.getElementById("open-yearly-button");
const backFromFormButton = document.getElementById("back-from-form");
const backFromListButton = document.getElementById("back-from-list");
const backFromYearlyButton = document.getElementById("back-from-yearly");
const goToListFromFormButton = document.getElementById("go-to-list-from-form");
const goToFormFromListButton = document.getElementById("go-to-form-from-list");
const goToListFromYearlyButton = document.getElementById("go-to-list-from-yearly");

const bookForm = document.getElementById("book-form");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const statusInput = document.getElementById("status");
const categoryInput = document.getElementById("category");
const ratingInput = document.getElementById("rating");
const finishedDateInput = document.getElementById("finished-date");
const reviewInput = document.getElementById("review");
const notesInput = document.getElementById("notes");
const formMessage = document.getElementById("form-message");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-button");
const formTitle = document.getElementById("form-title");
const formSubtitle = document.getElementById("form-subtitle");

const categoryFilter = document.getElementById("category-filter");
const bookList = document.getElementById("book-list");
const listSummary = document.getElementById("list-summary");
const statsGrid = document.getElementById("stats-grid");

const yearFilter = document.getElementById("year-filter");
const yearlySummary = document.getElementById("yearly-summary");
const yearlyList = document.getElementById("yearly-list");

let books = loadBooks();
let currentView = "menu";
let editingBookId = null;
let currentCategoryFilter = "全部";
let selectedYear = String(new Date().getFullYear());

showView("menu");
renderAll();
toggleFinishedDateField();

openFormButton.addEventListener("click", function () {
  resetForm();
  showView("form");
});

openListButton.addEventListener("click", function () {
  showView("list");
});

openYearlyButton.addEventListener("click", function () {
  showView("yearly");
});

backFromFormButton.addEventListener("click", function () {
  resetForm();
  showView("menu");
});

backFromListButton.addEventListener("click", function () {
  showView("menu");
});

backFromYearlyButton.addEventListener("click", function () {
  showView("menu");
});

goToListFromFormButton.addEventListener("click", function () {
  showView("list");
});

goToFormFromListButton.addEventListener("click", function () {
  resetForm();
  showView("form");
});

goToListFromYearlyButton.addEventListener("click", function () {
  showView("list");
});

bookForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const status = statusInput.value;
  const category = categoryInput.value;
  const rating = Number(ratingInput.value);
  const finishedDate = status === "读完" ? finishedDateInput.value : "";
  const review = reviewInput.value.trim();
  const notes = notesInput.value.trim();

  if (!title || !author || !review) {
    formMessage.textContent = "请先把书名、作者和简短书评填写完整。";
    return;
  }

  const bookData = {
    id: editingBookId || Date.now(),
    title: title,
    author: author,
    status: status,
    category: category,
    review: review,
    notes: notes,
    rating: rating,
    finishedDate: finishedDate
  };

  if (editingBookId) {
    books = books.map(function (book) {
      return book.id === editingBookId ? bookData : book;
    });
    formMessage.textContent = "这本书的内容已经更新完成。";
  } else {
    books.push(bookData);
    formMessage.textContent = "这本书已经加入你的书单啦。";
  }

  saveBooks();
  resetForm(false);
  renderAll();
  showView("form");
});

bookList.addEventListener("click", function (event) {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const bookId = Number(button.dataset.id);

  if (button.classList.contains("edit-button")) {
    startEdit(bookId);
    return;
  }

  if (button.classList.contains("delete-button")) {
    books = books.filter(function (book) {
      return book.id !== bookId;
    });

    if (editingBookId === bookId) {
      resetForm();
    }

    saveBooks();
    renderAll();
    formMessage.textContent = "这本书已经从书单中删除。";
  }
});

cancelButton.addEventListener("click", function () {
  resetForm();
  formMessage.textContent = "已经退出编辑模式。";
});

statusInput.addEventListener("change", function () {
  toggleFinishedDateField();
});

categoryFilter.addEventListener("change", function () {
  currentCategoryFilter = categoryFilter.value;
  renderBookList();
});

yearFilter.addEventListener("change", function () {
  selectedYear = yearFilter.value;
  renderYearlyView();
});

function loadBooks() {
  const savedBooks = localStorage.getItem(storageKey);

  if (!savedBooks) {
    return [];
  }

  try {
    const parsedBooks = JSON.parse(savedBooks);
    if (!Array.isArray(parsedBooks)) {
      return [];
    }

    return parsedBooks.map(function (book, index) {
      return {
        id: book.id || Date.now() + index,
        title: book.title || "",
        author: book.author || "",
        status: book.status || "想读",
        category: book.category || "其他",
        review: book.review || "",
        notes: book.notes || "",
        rating: Number(book.rating) || 0,
        finishedDate: book.finishedDate || ""
      };
    });
  } catch (error) {
    return [];
  }
}

function saveBooks() {
  localStorage.setItem(storageKey, JSON.stringify(books));
}

function showView(viewName) {
  currentView = viewName;
  menuView.classList.toggle("hidden", viewName !== "menu");
  formView.classList.toggle("hidden", viewName !== "form");
  listView.classList.toggle("hidden", viewName !== "list");
  yearlyView.classList.toggle("hidden", viewName !== "yearly");
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function renderAll() {
  renderStats();
  renderBookList();
  renderYearOptions();
  renderYearlyView();
}

function renderStats() {
  const stats = getStats();
  const currentYear = String(new Date().getFullYear());

  statsGrid.innerHTML = `
    <article class="stat-item">
      <p class="stat-label">总记录数</p>
      <p class="stat-value">${stats.total}</p>
    </article>
    <article class="stat-item">
      <p class="stat-label">已读完</p>
      <p class="stat-value">${stats.finished}</p>
    </article>
    <article class="stat-item">
      <p class="stat-label">想读</p>
      <p class="stat-value">${stats.wantRead}</p>
    </article>
    <article class="stat-item">
      <p class="stat-label">平均评分</p>
      <p class="stat-value">${stats.averageRating}</p>
    </article>
    <article class="stat-item">
      <p class="stat-label">${currentYear} 年读完</p>
      <p class="stat-value">${stats.currentYearFinished}</p>
    </article>
    <article class="stat-item">
      <p class="stat-label">热门分类</p>
      <p class="stat-value">${escapeHtml(stats.topCategory)}</p>
    </article>
  `;

  listSummary.innerHTML = `
    <article class="summary-item">
      <p class="summary-label">共记录</p>
      <p class="summary-value">${stats.total} 本</p>
    </article>
    <article class="summary-item">
      <p class="summary-label">正在读</p>
      <p class="summary-value">${stats.reading} 本</p>
    </article>
    <article class="summary-item">
      <p class="summary-label">平均评分</p>
      <p class="summary-value">${stats.averageRating}</p>
    </article>
  `;
}

function getStats() {
  const currentYear = String(new Date().getFullYear());
  const ratedBooks = books.filter(function (book) {
    return book.rating > 0;
  });
  const categoryCount = {};

  books.forEach(function (book) {
    categoryCount[book.category] = (categoryCount[book.category] || 0) + 1;
  });

  const topCategory = Object.keys(categoryCount).length === 0
    ? "暂无"
    : Object.keys(categoryCount).sort(function (a, b) {
        return categoryCount[b] - categoryCount[a];
      })[0];

  const averageRating = ratedBooks.length === 0
    ? "暂无"
    : (ratedBooks.reduce(function (sum, book) {
        return sum + book.rating;
      }, 0) / ratedBooks.length).toFixed(1) + " / 5";

  const currentYearFinished = books.filter(function (book) {
    return book.status === "读完" && book.finishedDate && book.finishedDate.slice(0, 4) === currentYear;
  }).length;

  return {
    total: books.length,
    wantRead: books.filter(function (book) { return book.status === "想读"; }).length,
    reading: books.filter(function (book) { return book.status === "在读"; }).length,
    finished: books.filter(function (book) { return book.status === "读完"; }).length,
    averageRating: averageRating,
    currentYearFinished: currentYearFinished,
    topCategory: topCategory
  };
}

function renderBookList() {
  const visibleBooks = books.filter(function (book) {
    return currentCategoryFilter === "全部" || book.category === currentCategoryFilter;
  });

  if (visibleBooks.length === 0 && books.length === 0) {
    bookList.innerHTML = `
      <div class="empty-state">
        你的梦境书房还是空的。<br>
        从目录进入“添加一本书”，开始记录第一本吧。
      </div>
    `;
    return;
  }

  if (visibleBooks.length === 0) {
    bookList.innerHTML = `
      <div class="empty-state">
        这个分类下暂时还没有书。<br>
        试试切换分类，或者再添加一本新书吧。
      </div>
    `;
    return;
  }

  const bookCards = visibleBooks.map(function (book) {
    return `
      <article class="book-item">
        <div class="book-item-header">
          <div>
            <h3>${escapeHtml(book.title)}</h3>
            <p class="book-author">作者：${escapeHtml(book.author)}</p>
          </div>
        </div>
        <div class="book-meta">
          <span class="status-badge status-${escapeHtml(book.status)}">${escapeHtml(book.status)}</span>
          <span class="category-badge">分类：${escapeHtml(book.category)}</span>
          <span class="rating-badge">评分：${renderStars(book.rating)}</span>
        </div>
        <p class="book-date">${getFinishedDateText(book)}</p>
        <p class="book-review">短评：${escapeHtml(book.review)}</p>
        <p class="book-notes">${escapeHtml(book.notes || "还没有写下详细笔记。")}</p>
        <div class="card-actions">
          <button class="edit-button" data-id="${book.id}">编辑</button>
          <button class="delete-button" data-id="${book.id}">删除这本书</button>
        </div>
      </article>
    `;
  });

  bookList.innerHTML = bookCards.join("");
}

function renderYearOptions() {
  const years = getAvailableYears();
  const currentYear = String(new Date().getFullYear());

  if (years.length === 0) {
    selectedYear = currentYear;
    yearFilter.innerHTML = `<option value="${currentYear}">${currentYear}</option>`;
    return;
  }

  if (!years.includes(selectedYear)) {
    selectedYear = years[0];
  }

  yearFilter.innerHTML = years.map(function (year) {
    const selected = year === selectedYear ? " selected" : "";
    return `<option value="${year}"${selected}>${year}</option>`;
  }).join("");
}

function getAvailableYears() {
  const yearSet = books
    .filter(function (book) {
      return book.status === "读完" && book.finishedDate;
    })
    .map(function (book) {
      return book.finishedDate.slice(0, 4);
    });

  if (yearSet.length === 0) {
    return [];
  }

  return Array.from(new Set(yearSet)).sort(function (a, b) {
    return Number(b) - Number(a);
  });
}

function renderYearlyView() {
  const yearlyBooks = books.filter(function (book) {
    return book.status === "读完" && book.finishedDate && book.finishedDate.slice(0, 4) === selectedYear;
  });

  const ratedYearlyBooks = yearlyBooks.filter(function (book) {
    return book.rating > 0;
  });

  const averageRating = ratedYearlyBooks.length === 0
    ? "暂无"
    : (ratedYearlyBooks.reduce(function (sum, book) {
        return sum + book.rating;
      }, 0) / ratedYearlyBooks.length).toFixed(1) + " / 5";

  yearlySummary.innerHTML = `
    <article class="summary-item">
      <p class="summary-label">${selectedYear} 年读完</p>
      <p class="summary-value">${yearlyBooks.length} 本</p>
    </article>
    <article class="summary-item">
      <p class="summary-label">${selectedYear} 年平均评分</p>
      <p class="summary-value">${averageRating}</p>
    </article>
  `;

  if (yearlyBooks.length === 0) {
    yearlyList.innerHTML = `
      <div class="empty-state">
        ${selectedYear} 年还没有读完记录。<br>
        等你读完一本书，这里就会亮起来。
      </div>
    `;
    return;
  }

  yearlyList.innerHTML = yearlyBooks.map(function (book) {
    return `
      <article class="book-item">
        <div class="book-item-header">
          <div>
            <h3>${escapeHtml(book.title)}</h3>
            <p class="book-author">作者：${escapeHtml(book.author)}</p>
          </div>
        </div>
        <div class="book-meta">
          <span class="category-badge">分类：${escapeHtml(book.category)}</span>
          <span class="rating-badge">评分：${renderStars(book.rating)}</span>
        </div>
        <p class="book-date">读完日期：${escapeHtml(book.finishedDate)}</p>
        <p class="book-review">短评：${escapeHtml(book.review)}</p>
      </article>
    `;
  }).join("");
}

function startEdit(bookId) {
  const targetBook = books.find(function (book) {
    return book.id === bookId;
  });

  if (!targetBook) {
    return;
  }

  editingBookId = bookId;
  titleInput.value = targetBook.title;
  authorInput.value = targetBook.author;
  statusInput.value = targetBook.status;
  categoryInput.value = targetBook.category;
  ratingInput.value = String(targetBook.rating);
  finishedDateInput.value = targetBook.finishedDate;
  reviewInput.value = targetBook.review;
  notesInput.value = targetBook.notes;
  submitButton.textContent = "保存修改";
  cancelButton.classList.remove("hidden");
  formTitle.textContent = "编辑这本书";
  formSubtitle.textContent = "你可以补充评分、笔记，或者更新读完日期。";
  formMessage.textContent = "正在编辑这本书。";
  toggleFinishedDateField();
  showView("form");
}

function resetForm(clearMessage) {
  editingBookId = null;
  bookForm.reset();
  statusInput.value = "想读";
  categoryInput.value = "小说";
  ratingInput.value = "0";
  finishedDateInput.value = "";
  submitButton.textContent = "添加到书单";
  cancelButton.classList.add("hidden");
  formTitle.textContent = "添加一本书";
  formSubtitle.textContent = "把刚遇见的新书轻轻放进你的书房。";
  toggleFinishedDateField();

  if (clearMessage !== false) {
    formMessage.textContent = "";
  }
}

function toggleFinishedDateField() {
  finishedDateInput.disabled = statusInput.value !== "读完";

  if (statusInput.value !== "读完") {
    finishedDateInput.value = "";
  }
}

function getFinishedDateText(book) {
  if (book.status === "读完" && book.finishedDate) {
    return "读完日期：" + escapeHtml(book.finishedDate);
  }

  return "读完日期：暂未记录";
}

function renderStars(rating) {
  if (!rating) {
    return "未评分";
  }

  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
