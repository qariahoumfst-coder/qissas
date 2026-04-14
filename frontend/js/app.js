/* ═══════════════════════════════
   app.js — Homepage logic
═══════════════════════════════ */

// ── State ──
let currentCat = 'all';
let currentSearch = '';

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  loadCategories();
  renderStories();
  bindSearch();
});

// ── Burger menu ──
function initNav() {
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', () => menu.classList.toggle('open'));
  }
}

// ── Categories ──
function loadCategories() {
  const row = document.getElementById('categoriesRow');
  if (!row) return;
  const cats = DataStore.getCategories();
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn';
    btn.dataset.cat = cat;
    btn.textContent = catEmoji(cat) + ' ' + cat;
    row.appendChild(btn);
  });
  row.addEventListener('click', e => {
    if (e.target.classList.contains('cat-btn')) {
      row.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCat = e.target.dataset.cat;
      currentSearch = '';
      document.getElementById('searchInput').value = '';
      renderStories();
    }
  });
}

// ── Search ──
function bindSearch() {
  const input = document.getElementById('searchInput');
  const btn   = document.getElementById('searchBtn');
  if (!input) return;

  const doSearch = () => {
    currentSearch = input.value.trim();
    currentCat = 'all';
    document.querySelectorAll('.cat-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === 'all');
    });
    renderStories();
  };

  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  // Live search with debounce
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(doSearch, 350);
  });
}

// ── Render ──
function renderStories() {
  const grid      = document.getElementById('storiesGrid');
  const empty     = document.getElementById('emptyState');
  const titleEl   = document.getElementById('storiesTitle');
  const countEl   = document.getElementById('storiesCount');
  if (!grid) return;

  let stories = currentSearch
    ? DataStore.search(currentSearch)
    : DataStore.getByCategory(currentCat);

  // Update title
  if (currentSearch) {
    titleEl.textContent = `نتائج البحث عن "${currentSearch}"`;
  } else if (currentCat === 'all') {
    titleEl.textContent = 'أحدث القصص';
  } else {
    titleEl.textContent = 'قصص ' + currentCat;
  }

  countEl.textContent = stories.length + ' قصة';

  if (stories.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = stories.map((s, i) => buildCard(s, i)).join('');
}

function buildCard(s, i) {
  const delay = Math.min(i * 80, 400);
  const colorBar = barClass(s.category);
  const catBadge = catClass(s.category);
  const excerpt  = s.excerpt || s.content.slice(0, 120) + '...';
  const words    = s.words || countWords(s.content);

  return `
    <article class="story-card" style="animation-delay:${delay}ms">
      <div class="card-color-bar ${colorBar}"></div>
      <div class="card-body">
        <span class="card-cat ${catBadge}">${catEmoji(s.category)} ${s.category}</span>
        <h2 class="card-title">${escHtml(s.title)}</h2>
        <p class="card-excerpt">${escHtml(excerpt)}</p>
      </div>
      <div class="card-footer">
        <span class="card-date">📅 ${formatDate(s.date)} &nbsp;·&nbsp; 📝 ${words} كلمة</span>
        <div class="card-actions">
          <button class="card-btn card-btn-read" onclick="readStory('${s.id}')">اقرأ</button>
          <button class="card-btn card-btn-edit" onclick="editStory('${s.id}')">✏️</button>
          <button class="card-btn card-btn-del"  onclick="deleteStory('${s.id}', this)">🗑️</button>
        </div>
      </div>
    </article>
  `;
}

// ── Actions ──
function readStory(id) {
  window.location.href = 'pages/read.html?id=' + id;
}
function editStory(id) {
  window.location.href = 'pages/add.html?id=' + id;
}
function deleteStory(id, btn) {
  if (!confirm('هل أنت متأكد أنك تريد حذف هذه القصة؟')) return;
  DataStore.delete(id);
  const card = btn.closest('.story-card');
  card.style.transition = 'all 0.4s ease';
  card.style.opacity = '0';
  card.style.transform = 'scale(0.9)';
  setTimeout(() => { renderStories(); }, 400);
  showToast('تم حذف القصة بنجاح', 'success');
}

// ── Utils ──
function catEmoji(cat) {
  const map = {
    'إسلامية': '🕌',
    'تاريخية': '🏛️',
    'رومانسية': '❤️',
    'مغامرات': '⚔️',
    'خيال علمي': '🚀',
    'أطفال': '🌟',
    'رعب': '👻',
    'اجتماعية': '🤝',
    'أخرى': '📌'
  };
  return map[cat] || '📖';
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function showToast(msg, type = '') {
  let toast = document.getElementById('__toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = '__toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'toast ' + type;
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); }, 3000);
}
