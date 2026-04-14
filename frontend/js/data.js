/* ═══════════════════════════════
   data.js — localStorage engine
═══════════════════════════════ */

const DB_KEY = 'qissas_stories';

const SAMPLE_STORIES = [
  {
    id: '1',
    title: 'صلاح الدين والقدس',
    category: 'تاريخية',
    excerpt: 'حكاية استعادة القدس من يد الصليبيين على يد القائد العظيم صلاح الدين الأيوبي.',
    content: `في عام ألف ومئة وسبعة وثمانين من الميلاد، كانت القدس تئنّ تحت وطأة الحكم الصليبي منذ ما يقارب تسعة عقود. كان أهلها يتطلعون إلى المنقذ الذي يعيد إليهم كرامتهم وإيمانهم.

وفي تلك الحقبة، برز من بلاد الشام قائدٌ فذّ، عُرف بحكمته كما عُرف بشجاعته. كان صلاح الدين الأيوبي يحمل في صدره حلمًا واحدًا لا يفارقه: تحرير مدينة السلام.

جمع صلاح الدين قواته من أقطار المسلمين، ووحّد صفوفهم بعد أن كانت الخلافات تمزّقهم. وفي معركة حطين الفاصلة، انكسرت شوكة الصليبيين، وفتحت أبواب القدس أمام جيش الإيمان.

ودخل صلاح الدين القدس في رجب من ذلك العام، فلم يسفك دماءً، ولم ينتقم من أحد. وقال قولته الخالدة: "لا نقتل الأسرى، ولا نكسر العهود". فكانت تلك الفتح نورًا في تاريخ الحضارة الإنسانية.`,
    date: '2024-03-15',
    words: 180
  },
  {
    id: '2',
    title: 'ليلى وقيس — حكاية الحب الأبدي',
    category: 'رومانسية',
    excerpt: 'قصة الحب الخالد التي تروى على ألسنة الشعراء عبر العصور.',
    content: `في ربوع نجد، حيث تتمايل النخيل تحت سماء زرقاء صافية، وُلدت قصة حبٍّ لم تزل تتردّد أصداؤها في كل قلب عرف معنى الوله.

كان قيسٌ فتىً من أشراف القوم، قوي البنيان، حادّ الذهن، ينظم الشعر كما يتنفس الهواء. وكانت ليلى بنت مهدي كالبدر في تمامه، خجول كالغزال، وحيّة الفكر كالنسيم.

تلاقت عيناهما في المرعى وهما صغيران، فكان ذلك اللقاء كشرارة أشعلت في قلب قيس نارًا لا تُطفأ. وأخذ ينشد بها الأشعار في كل مكان، حتى سُمّي بـ"مجنون ليلى".

غير أن أهل ليلى رأوا في قيس ما لا يُرضيهم، فزوّجوها من رجل آخر. وعاش قيس يجوب الصحراء شاعرًا في حبّه، باكيًا في وجده، حتى قيل إنه فارق الدنيا وقلبه لا يزال يحمل اسمها.

تلك هي الحكاية التي علّمت الناس أن الحب الحقيقي لا يموت، حتى حين يفنى أصحابه.`,
    date: '2024-03-20',
    words: 210
  },
  {
    id: '3',
    title: 'الرجل الذي تعلّم الصبر',
    category: 'إسلامية',
    excerpt: 'قصة إيمانية تُلهمك على الصبر وتذكير الله في أوقات الشدة.',
    content: `كان يوسف رجلًا من أهل الخير، يُقيم الصلاة ويؤدّي الزكاة، ويُعين الجار والمسكين. وكان الناس يحبّونه ويُجلّونه.

ثم توالت عليه المصائب كالأمواج. فقد فاتته صفقة كبيرة أضاع فيها ما جمعه من سنوات. ثم مرض ابنه الأصغر مرضًا أقعده الفراش. ثم احترق دكّانه في ليلة صيفية حارقة.

جلس يوسف وحده في العتمة، وكادت الشكوى تفلت من بين شفتيه. ثم تذكّر قصة أيوب عليه السلام، الذي فقد كل شيء ولم يفقد إيمانه. فرفع يديه إلى السماء وقال: "يا الله، أنت أعلم بما هو خير لي".

وبعد أيام، جاء طبيبٌ من بلدٍ بعيد وشفى ابنه. وجاء تاجرٌ سمع بقصة الحريق وأعانه على إعادة البناء. وجاءت تجارة جديدة خيرٌ من الأولى.

قال يوسف في آخر عمره لأحفاده: "كلما ضاقت الدنيا عليكم، اتّسعت السماء لدعواتكم. فلا تيأسوا".`,
    date: '2024-04-01',
    words: 195
  }
];

const DataStore = {
  getAll() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (!raw) {
        // Seed with sample stories
        localStorage.setItem(DB_KEY, JSON.stringify(SAMPLE_STORIES));
        return SAMPLE_STORIES;
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  getById(id) {
    return this.getAll().find(s => s.id === id) || null;
  },

  save(story) {
    const all = this.getAll();
    if (story.id) {
      // Update existing
      const idx = all.findIndex(s => s.id === story.id);
      if (idx > -1) {
        all[idx] = { ...all[idx], ...story };
      } else {
        all.unshift(story);
      }
    } else {
      story.id = Date.now().toString();
      story.date = new Date().toISOString().split('T')[0];
      all.unshift(story);
    }
    localStorage.setItem(DB_KEY, JSON.stringify(all));
    return story;
  },

  delete(id) {
    const all = this.getAll().filter(s => s.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(all));
  },

  getCategories() {
    const all = this.getAll();
    const cats = [...new Set(all.map(s => s.category).filter(Boolean))];
    return cats;
  },

  search(query) {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAll();
    return this.getAll().filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.excerpt && s.excerpt.toLowerCase().includes(q)) ||
      (s.content && s.content.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q))
    );
  },

  getByCategory(cat) {
    if (cat === 'all') return this.getAll();
    return this.getAll().filter(s => s.category === cat);
  }
};

// Word count helper
function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Format date helper
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Get category class (safe for CSS)
function catClass(cat) {
  return 'cat-' + (cat || 'أخرى').replace(/\s+/g, '-');
}
function barClass(cat) {
  return 'bar-' + (cat || 'أخرى').replace(/\s+/g, '-');
}

// Navigation helper
function goTo(path) {
  window.location.href = path;
}
