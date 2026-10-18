(() => {
    const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const I18N = window.LAST_CELL_LOCALES || {};
    const LOCALE = I18N;
    const LEVELS = window.LAST_CELL_LEVELS || [];
    const LANGUAGES = Object.keys(I18N);
    const CHARS = Object.keys(I18N.ru?._data?.characters || {}).map(id => ({
        id,
        name: Object.fromEntries(LANGUAGES.map(code => [code, I18N[code]._data.characters[id]]))
    }));
    const OBJECT_META = {
        none: { icon: "", blocked: false },
        window: { icon: "🪟", blocked: true },
        fireplace: { icon: "🔥", blocked: true },
        candlestick: { icon: "🕯️", blocked: true },
        table: { icon: "🪑", blocked: true },
        long_table: { icon: "🍽️", blocked: true },
        plant: { icon: "🪴", blocked: true },
        chair: { icon: "🪑", blocked: false },
        bed: { icon: "🛏️", blocked: false },
        carpet: { icon: "🧶", blocked: false },
        bookcase: { icon: "📚", blocked: true },
        wardrobe: { icon: "🗄️", blocked: true }
    };
    const OBJECTS = Object.fromEntries(Object.entries(OBJECT_META).map(([id, meta]) => [id, {
            ...meta,
            name: Object.fromEntries(LANGUAGES.map(code => [code, I18N[code]._data.objects[id]]))
        }]));
    const GOALS = Object.fromEntries(Object.keys(I18N.ru?._data?.goals || {}).map(id => [id,
        Object.fromEntries(LANGUAGES.map(code => [code, I18N[code]._data.goals[id]]))
    ]));
    const THEME_KEY = "last-cell-appearance-v22";
    const APPEARANCE_KEY = THEME_KEY;
    const FLAGS = { ru: "🇷🇺", uk: "🇺🇦", en: "🇬🇧" };
    const NAV_ICONS = {
        home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8v9.2a1 1 0 0 1-1 1h-5.2v-6h-5.6v6H4a1 1 0 0 1-1-1z"/></svg>',
        levels: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>',
        daily: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h5"/></svg>',
        rules: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2z"/><path d="M6 18a2 2 0 0 0 2 2h10M9 8h6M9 12h6"/></svg>',
        how: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.6 2.6 0 1 1 4.5 1.8c-1.1 1.1-2.2 1.4-2.2 3"/><circle cx="12" cy="17.2" r=".7" fill="currentColor" stroke="none"/></svg>',
        sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
        moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.6 8.6 0 1 0 11.5 11.5z"/></svg>'
    };
    const icon = name => NAV_ICONS[name] || "";
    const currentAppearance = () => localStorage.getItem(APPEARANCE_KEY) || "dark";
    function applyAppearance() { document.body.dataset.appearance = currentAppearance(); }
    function toggleAppearance() { const next = currentAppearance() === "dark" ? "light" : "dark"; localStorage.setItem(APPEARANCE_KEY, next); applyAppearance(); updateThemeButton(); }
    function updateThemeButton() {
        const b = $("themeToggle");
        if (!b)
            return;
        const light = currentAppearance() === "light";
        b.innerHTML = icon(light ? "moon" : "sun");
        b.setAttribute("aria-label", light ? t("themeDark") : t("themeLight"));
        b.title = light ? t("themeDark") : t("themeLight");
    }
    function setLanguage(next) {
        if (!I18N[next])
            return;
        lang = next;
        document.documentElement.lang = next === "uk" ? "uk-UA" : next === "en" ? "en" : "ru";
        localStorage.setItem(LANG_KEY, lang);
        const active = document.body.dataset.activeNav || "home";
        document.querySelectorAll(".lang-option").forEach(b => b.classList.toggle("selected", b.dataset.lang === lang));
        if (active === "home")
            renderHome();
        else if (active === "levels")
            renderLevels();
        else if (active === "daily")
            renderDaily();
        else if (active === "play")
            renderPlay();
    }
    const SAVE_KEY = "last-cell-progress-v22";
    const DONE_KEY = "last-cell-done-v22";
    const LANG_KEY = "last-cell-lang";
    const DAILY_CACHE_KEY = "last-cell-daily-v25";
    let lang = localStorage.getItem(LANG_KEY) || ((navigator.language || "ru").toLowerCase().startsWith("uk") ? "uk" : (navigator.language || "ru").toLowerCase().startsWith("en") ? "en" : "ru");
    let state = { level: LEVELS[0] || null, cells: [], cellMap: new Map(), roomMap: new Map(), objectMap: new Map(), solutionAt: new Map(), playerPositions: {}, notes: {}, clueDismissed: {}, selectedCharacter: null, selectedAccused: null, mode: "place", focus: null, seconds: 360, timer: null, finalized: false, placementSolved: false, lastSavedAt: Date.now() };
    document.documentElement.lang = lang === "uk" ? "uk-UA" : lang === "en" ? "en" : "ru";
    const t = k => LOCALE[lang]?.[k] ?? LOCALE.ru?.[k] ?? k;
    const txt = x => typeof x === "string" ? x : (x?.[lang] ?? x?.ru ?? "");
    const $ = id => document.getElementById(id);
    const esc = s => String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
    const CHAR_MAP = new Map(CHARS.map(x => [x.id, x]));
    const findChar = id => CHAR_MAP.get(id);
    const BLOCKED_OBJECTS = new Set(["window", "fireplace", "candlestick", "table", "long_table", "plant", "bookcase", "wardrobe"]);
    function clueRelation(cl) {
        return cl.relation || (cl.on ? "on" : cl.adj ? "adjacent" : cl.not_adj ? "notAdjacent" : null);
    }
    function clueObjectType(cl, targetCell = null) {
        return cl.objectType || targetCell?.object || cl.on || cl.adj || cl.not_adj || null;
    }
    function neighboursOf(r, c) {
        return [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dr, dc]) => cellAt(r + dr, c + dc)).filter(Boolean);
    }
    function compileLevel(level) {
        if (!level || !Array.isArray(level.cells) || !Array.isArray(level.clues))
            return level;
        const cellMap = new Map(level.cells.map(c => [`${c.r},${c.c}`, c]));
        const objectMap = new Map(level.cells.filter(c => c.objectId).map(c => [c.objectId, c]));
        level.clues = level.clues.map(cl => {
            const legacy = cl.on || cl.adj || cl.not_adj;
            if (legacy) {
                const relation = clueRelation(cl);
                const next = { ...cl, relation, objectType: legacy, objectScope: 'type' };
                delete next.on;
                delete next.adj;
                delete next.not_adj;
                delete next.objectId;
                return next;
            }
            if (cl.objectId && !cl.objectType) {
                const target = objectMap.get(cl.objectId);
                if (target)
                    return { ...cl, objectType: target.object, objectScope: cl.objectScope || 'exact' };
            }
            return { ...cl };
        });
        return level;
    }
    LEVELS.forEach(compileLevel);
    const cellAt = (r, c) => state.cellMap.get(`${r},${c}`);
    const key = (r, c) => `${r},${c}`;
    function prepareLevel(level) {
        if (!level)
            return false;
        level = { ...level, geometry: { shape: "square", aspect: 1 } };
        state.level = level;
        state.cells = level.cells.map(x => ({ ...x }));
        state.cellMap = new Map(state.cells.map(x => [key(x.r, x.c), x]));
        state.roomMap = new Map((level.rooms || []).map(x => [x.id, x]));
        state.objectMap = new Map(state.cells.filter(x => x.objectId).map(x => [x.objectId, x]));
        state.solutionAt = new Map(Object.entries(level.solution || {}).map(([id, p]) => [p, id]));
        return true;
    }
    const objectDef = c => OBJECTS[c?.object] || OBJECTS.none;
    const roomName = r => r?.name?.[lang] || r?.[lang] || r?.ru || "";
    const blocked = c => !!c && !!objectDef(c).blocked;
    const charsAt = () => { const m = {}; Object.entries(state.playerPositions).forEach(([id, p]) => m[p] = id); return m; };
    const used = () => { const rows = new Set(), cols = new Set(); Object.values(state.playerPositions).forEach(p => { const [r, c] = p.split(",").map(Number); rows.add(r); cols.add(c); }); return { rows, cols }; };
    function stopTimer() {
        if (state.timer) {
            clearInterval(state.timer);
            state.timer = null;
        }
    }
    function updateTimer() {
        const el = $("timerValue");
        if (!el)
            return;
        el.textContent = `${String(Math.floor(state.seconds / 60)).padStart(2, "0")}:${String(state.seconds % 60).padStart(2, "0")}`;
    }
    function startTimer() {
        stopTimer();
        updateTimer();
        state.lastSavedAt = Date.now();
        state.timer = setInterval(() => {
            if (state.seconds <= 0) {
                stopTimer();
                state.finalized = true;
                saveProgress();
                showOutcome(t("timeout"), t("solution"));
                return;
            }
            state.seconds--;
            updateTimer();
            if (state.seconds % 2 === 0)
                saveProgress();
        }, 1000);
    }
    function roomEdge(el, r, c) {
        const cell = cellAt(r, c) || { roomId: null }, id = cell.roomId, top = r > 0 ? cellAt(r - 1, c)?.roomId : null, bottom = r < state.level.rows - 1 ? cellAt(r + 1, c)?.roomId : null, left = c > 0 ? cellAt(r, c - 1)?.roomId : null, right = c < state.level.cols - 1 ? cellAt(r, c + 1)?.roomId : null;
        if (id !== top || id !== bottom || id !== left || id !== right)
            el.classList.add("room-edge");
        if (r === 0 || c === 0 || r === state.level.rows - 1 || c === state.level.cols - 1)
            el.classList.add("house-edge");
    }
    function victimCell() {
        const { rows, cols } = used(), n = state.level.activeCharacters.length;
        if (rows.size !== n || cols.size !== n)
            return null;
        const fr = [...Array(state.level.rows).keys()].find(r => !rows.has(r)), fc = [...Array(state.level.cols).keys()].find(c => !cols.has(c));
        if (fr == null || fc == null)
            return null;
        const cell = cellAt(fr, fc);
        return cell && !blocked(cell) ? key(fr, fc) : null;
    }
    function dailyDateKey(d = new Date()) { return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`; }
    function dailyIdForDate(d = new Date()) { return `daily-${dailyDateKey(d)}`; }
    function getDone() {
        try {
            return JSON.parse(localStorage.getItem(DONE_KEY) || "[]");
        }
        catch {
            return [];
        }
    }
    function saveDone() {
        const arr = getDone();
        if (!arr.includes(state.level.id)) {
            arr.push(state.level.id);
            localStorage.setItem(DONE_KEY, JSON.stringify(arr));
        }
    }
    function hasResume() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw)
                return false;
            const s = JSON.parse(raw);
            if (!s.levelId || s.completedAt || s.finalized)
                return false;
            if (s.levelId.startsWith('daily-')) {
                const current = ensureDailyLevel();
                return !!current && s.levelId === current.id;
            }
            return LEVELS.some(l => l.id === s.levelId);
        }
        catch {
            return false;
        }
    }
    function saveProgress() {
        if (!state.level)
            return;
        const payload = { version: 21, levelId: state.level.id, playerPositions: state.playerPositions, notes: state.notes, selectedCharacter: state.selectedCharacter, selectedAccused: state.selectedAccused, clueDismissed: state.clueDismissed, mode: state.mode, focus: state.focus, seconds: state.seconds, finalized: state.finalized, placementSolved: !!state.placementSolved, lastSavedAt: Date.now() };
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
            state.lastSavedAt = payload.lastSavedAt;
            const el = $("saveState");
            if (el)
                el.textContent = t("saved");
        }
        catch { }
    }
    function loadProgress() {
        try {
            const s = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
            if (!s || !s.levelId)
                return false;
            if (s.levelId.startsWith('daily-')) {
                const daily = ensureDailyLevel();
                if (!daily || s.levelId !== daily.id)
                    return false;
            }
            const level = LEVELS.find(l => l.id === s.levelId);
            if (!level || s.completedAt)
                return false;
            const elapsed = Math.max(0, Math.floor((Date.now() - (s.lastSavedAt || Date.now())) / 1000));
            prepareLevel(level);
            state.playerPositions = { ...(s.playerPositions || {}) };
            state.notes = { ...(s.notes || {}) };
            state.clueDismissed = { ...(s.clueDismissed || {}) };
            state.selectedCharacter = s.selectedCharacter || null;
            state.selectedAccused = s.selectedAccused || null;
            state.mode = s.mode || "place";
            state.focus = s.focus || null;
            state.seconds = Math.max(0, (s.seconds ?? 420) - elapsed);
            state.finalized = !!s.finalized;
            state.placementSolved = !!s.placementSolved;
            return true;
        }
        catch {
            return false;
        }
    }
    function clearResume() { localStorage.removeItem(SAVE_KEY); }
    const CHARACTER_GENDER = I18N.ru._data.grammar.characterGender;
    const OBJECT_PLURAL = Object.fromEntries(LANGUAGES.map(code => [code, I18N[code]._data.grammar.objectPlural]));
    const OBJECT_PLURAL_GEN = Object.fromEntries(LANGUAGES.map(code => [code, I18N[code]._data.grammar.objectPluralGen]));
    const clueSeed = s => {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < String(s).length; i++) {
            h ^= String(s).charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h >>> 0;
    };
    const pickVariant = (arr, seed) => arr[clueSeed(seed) % arr.length];
    const OBJECT_FORMS = Object.fromEntries(LANGUAGES.map(code => [code, I18N[code]._data.grammar.objectForms]));
    const objectNoun = type => OBJECTS[type]?.name?.[lang] || OBJECT_FORMS[lang]?.[type]?.nom || type || '';
    function roomPrep(name) {
        const n = String(name || '');
        if (lang === 'ru')
            return `в комнате «${n}»`;
        if (lang === 'uk')
            return `у кімнаті «${n}»`;
        return `in the ${n}`;
    }
    function clueTier(level) {
        const explicit = level?.clueTier;
        if (explicit)
            return explicit;
        const order = Number(level?.order) || 0;
        if (order > 500)
            return 'final';
        if (order > 200)
            return 'negative';
        if (order > 50)
            return 'geography';
        return 'direct';
    }
    function clueId(cl) { return JSON.stringify([cl.character, cl.row ?? null, cl.col ?? null, cl.notRow ?? null, cl.notCol ?? null, cl.room ?? null, cl.relation ?? null, cl.targetCharacter ?? null, cl.objectType ?? null, cl.objectId ?? null]); }
    function firstName(id) { const ch = findChar(id); return ch?.name?.[lang] || id || ''; }
    function coordinateLabel(kind, index, size, tier) {
        const first = index === 0, last = index === size - 1, n = index + 1;
        if (tier === 'geography' || tier === 'negative' || tier === 'final') {
            if (kind === 'row' && first) {
                if (lang === 'ru')
                    return `на самом верхнем этаже (в первой строке)`;
                if (lang === 'uk')
                    return `на самому верхньому поверсі (у першому рядку)`;
                return `on the very top floor (in the first row)`;
            }
            if (kind === 'row' && last) {
                if (lang === 'ru')
                    return `на самом нижнем этаже (в последней строке)`;
                if (lang === 'uk')
                    return `на самому нижньому поверсі (в останньому рядку)`;
                return `on the very bottom floor (in the last row)`;
            }
            if (kind === 'col' && first) {
                if (lang === 'ru')
                    return `у самого левого края дома (в первом столбце)`;
                if (lang === 'uk')
                    return `біля самого лівого краю будинку (у першому стовпці)`;
                return `at the far left edge of the house (in the first column)`;
            }
            if (kind === 'col' && last) {
                if (lang === 'ru')
                    return `у самого правого края дома (в последнем столбце)`;
                if (lang === 'uk')
                    return `біля самого правого краю будинку (в останньому стовпці)`;
                return `at the far right edge of the house (in the last column)`;
            }
        }
        if (lang === 'ru')
            return kind === 'row' ? `в ${n}-й строке` : `в ${n}-м столбце`;
        if (lang === 'uk')
            return kind === 'row' ? `у ${n}-му рядку` : `у ${n}-му стовпці`;
        return kind === 'row' ? `in row ${n}` : `in column ${n}`;
    }
    function negativeCoordinate(kind, index, size, gender) {
        const n = index + 1, fem = gender === 'f';
        if (lang === 'ru') {
            if (kind === 'row')
                return fem ? `Я была где угодно, только не в ${n}-й строке.` : `Я был где угодно, только не в ${n}-й строке.`;
            return fem ? `Я была где угодно, только не в ${n}-м столбце.` : `Я был где угодно, только не в ${n}-м столбце.`;
        }
        if (lang === 'uk') {
            if (kind === 'row')
                return fem ? `Я була де завгодно, тільки не в ${n}-му рядку.` : `Я був де завгодно, тільки не в ${n}-му рядку.`;
            return fem ? `Я була де завгодно, тільки не в ${n}-му стовпці.` : `Я був де завгодно, тільки не в ${n}-му стовпці.`;
        }
        return kind === 'row' ? (fem ? `I could have been anywhere, just not in row ${n}.` : `I was anywhere but row ${n}.`) : (fem ? `I could have been anywhere, just not in column ${n}.` : `I was anywhere but column ${n}.`);
    }
    function relativeTargetName(id, form = 'plain') {
        const target = firstName(id);
        if (lang === 'ru') {
            const forms = {
                Anastasia: { gen: 'Анастасии', inst: 'Анастасией' },
                Bertram: { gen: 'Бертрама', inst: 'Бертрамом' },
                Veronica: { gen: 'Вероники', inst: 'Вероникой' },
                Daphne: { gen: 'Дафины', inst: 'Дафиной' },
                Zebastian: { gen: 'Зебастиана', inst: 'Зебастианом' },
                Albert: { gen: 'Альберта', inst: 'Альбертом' }
            };
            return forms[id]?.[form] || target;
        }
        if (lang === 'uk') {
            const forms = {
                Anastasia: { gen: 'Анастасії', inst: 'Анастасією' },
                Bertram: { gen: 'Бертрама', inst: 'Бертрамом' },
                Veronica: { gen: 'Вероніки', inst: 'Веронікою' },
                Daphne: { gen: 'Дафіни', inst: 'Дафіною' },
                Zebastian: { gen: 'Зебастіана', inst: 'Зебастіаном' },
                Albert: { gen: 'Альберта', inst: 'Альбертом' }
            };
            return forms[id]?.[form] || target;
        }
        return target;
    }
    function relativePhrase(cl, gender) {
        const f = gender === 'f';
        const target = relativeTargetName(cl.targetCharacter, (cl.relation === 'adjacentCharacter' || cl.relation === 'notAdjacentCharacter') ? 'inst' : 'gen');
        if (cl.relation === 'aboveCharacter') {
            if (lang === 'ru')
                return f ? `Я была выше ${target}.` : `Я был выше ${target}.`;
            if (lang === 'uk')
                return f ? `Я була вище за ${target}.` : `Я був вище за ${target}.`;
            return `I was above ${target}.`;
        }
        if (cl.relation === 'belowCharacter') {
            if (lang === 'ru')
                return f ? `Я была ниже ${target}.` : `Я был ниже ${target}.`;
            if (lang === 'uk')
                return f ? `Я була нижче за ${target}.` : `Я був нижче за ${target}.`;
            return `I was below ${target}.`;
        }
        if (cl.relation === 'leftOfCharacter') {
            if (lang === 'ru')
                return f ? `Я была левее ${target}.` : `Я был левее ${target}.`;
            if (lang === 'uk')
                return f ? `Я була ліворуч від ${target}.` : `Я був ліворуч від ${target}.`;
            return `I was to the left of ${target}.`;
        }
        if (cl.relation === 'rightOfCharacter') {
            if (lang === 'ru')
                return f ? `Я была правее ${target}.` : `Я был правее ${target}.`;
            if (lang === 'uk')
                return f ? `Я була праворуч від ${target}.` : `Я був праворуч від ${target}.`;
            return `I was to the right of ${target}.`;
        }
        if (cl.relation === 'adjacentCharacter') {
            if (lang === 'ru')
                return f ? `Я стояла рядом с ${target}.` : `Я стоял рядом с ${target}.`;
            if (lang === 'uk')
                return f ? `Я стояла поруч із ${target}.` : `Я стояв поруч із ${target}.`;
            return `I was standing next to ${target}.`;
        }
        if (cl.relation === 'notAdjacentCharacter') {
            if (lang === 'ru')
                return f ? `К ${target} я близко не подходила.` : `К ${target} я близко не подходил.`;
            if (lang === 'uk')
                return f ? `Я не трималася поруч із ${target}.` : `Я не тримався поруч із ${target}.`;
            return `I kept my distance from ${target}.`;
        }
        return '';
    }
    function directionalWords(target, sameRoom, form) {
        const minC = Math.min(...sameRoom.map(c => c.c)), maxC = Math.max(...sameRoom.map(c => c.c)), minR = Math.min(...sameRoom.map(c => c.r)), maxR = Math.max(...sameRoom.map(c => c.r));
        const d = [];
        if (target.c === minC && minC !== maxC)
            d.push(lang === 'ru' ? (form === 'dat' ? 'левому' : form === 'prep' ? 'левом' : 'левым') : lang === 'uk' ? 'лівого' : 'left');
        else if (target.c === maxC && minC !== maxC)
            d.push(lang === 'ru' ? (form === 'dat' ? 'правому' : form === 'prep' ? 'правом' : 'правым') : lang === 'uk' ? 'правого' : 'right');
        if (target.r === minR && minR !== maxR)
            d.push(lang === 'ru' ? (form === 'dat' ? 'верхнему' : form === 'prep' ? 'верхнем' : 'верхним') : lang === 'uk' ? 'верхнього' : 'upper');
        else if (target.r === maxR && minR !== maxR)
            d.push(lang === 'ru' ? (form === 'dat' ? 'нижнему' : form === 'prep' ? 'нижнем' : 'нижним') : lang === 'uk' ? 'нижнього' : 'lower');
        if (lang === 'en') {
            if (d.length === 2)
                return `${d[1]}-${d[0]}`;
            return d.join(' ');
        }
        if (lang === 'uk' && form === 'ins')
            return d.map(x => x === 'лівого' ? 'лівим' : x === 'правого' ? 'правим' : x === 'верхнього' ? 'верхнім' : x === 'нижнього' ? 'нижнім' : x).join(' ');
        if (lang === 'uk' && form === 'prep')
            return d.map(x => x === 'лівого' ? 'лівому' : x === 'правого' ? 'правому' : x === 'верхнього' ? 'верхньому' : x === 'нижнього' ? 'нижньому' : x).join(' ');
        return d.join(' ');
    }
    function exactObjectRef(targetCell, type, relation) {
        const forms = OBJECT_FORMS[lang]?.[type] || { nom: objectNoun(type).toLowerCase(), dat: objectNoun(type).toLowerCase(), gen: objectNoun(type).toLowerCase(), ins: objectNoun(type).toLowerCase(), prep: objectNoun(type).toLowerCase() };
        const same = state.cells.filter(c => c.object === type), room = roomName(state.roomMap.get(targetCell?.roomId));
        const sameRoom = targetCell ? same.filter(c => c.roomId === targetCell.roomId) : [];
        let form = relation === 'adjacent' ? 'ins' : relation === 'notAdjacent' ? 'dat' : relation === 'on' ? 'prep' : 'nom';
        if (lang === 'uk')
            form = relation === 'adjacent' ? 'gen' : relation === 'notAdjacent' ? 'gen' : relation === 'on' ? 'prep' : 'nom';
        let base = forms[form] || forms.nom;
        if (!targetCell || same.length <= 1)
            return base;
        if (sameRoom.length === 1)
            return `${base} ${roomPrep(room)}`;
        let dir = directionalWords(targetCell, sameRoom, form);
        if (!dir) {
            if (lang === 'ru')
                dir = `в ${targetCell.r + 1}-й строке, ${targetCell.c + 1}-м столбце`;
            else if (lang === 'uk')
                dir = `у ${targetCell.r + 1}-му рядку, ${targetCell.c + 1}-му стовпці`;
            else
                dir = `at row ${targetCell.r + 1}, column ${targetCell.c + 1}`;
            return `${base} ${lang === 'en' ? 'in the' : 'в'} ${room.toLowerCase()} — ${dir}`;
        }
        if (lang === 'en')
            return `${dir} ${base} ${roomPrep(room)}`;
        return `${dir} ${base} ${roomPrep(room)}`;
    }
    function onPhrase(type, targetCell, gender) {
        const female = gender === 'f', count = state.cells.filter(c => c.object === type).length;
        const specific = targetCell ? exactObjectRef(targetCell, type, 'on') : objectNoun(type).toLowerCase();
        const plural = count > 1;
        if (lang === 'ru') {
            if (type === 'chair')
                return female ? (targetCell && count > 1 ? `Я сидела на ${specific}.` : `Я сидела ${plural ? 'на одном из стульев' : 'на стуле'}.`) : (targetCell && count > 1 ? `Я сидел на ${specific}.` : `Я сидел ${plural ? 'на одном из стульев' : 'на стуле'}.`);
            if (type === 'carpet')
                return female ? (targetCell && count > 1 ? `Я стояла на ${specific}.` : `Я стояла ${plural ? 'на одном из ковров' : 'на ковре'}.`) : (targetCell && count > 1 ? `Я стоял на ${specific}.` : `Я стоял ${plural ? 'на одном из ковров' : 'на ковре'}.`);
            if (type === 'bed')
                return female ? (targetCell && count > 1 ? `Я находилась на ${specific}.` : `Я находилась ${plural ? 'на одной из кроватей' : 'на кровати'}.`) : (targetCell && count > 1 ? `Я находился на ${specific}.` : `Я находился ${plural ? 'на одной из кроватей' : 'на кровати'}.`);
            return female ? `Я находилась на ${specific}.` : `Я находился на ${specific}.`;
        }
        if (lang === 'uk') {
            if (type === 'chair')
                return female ? (targetCell && count > 1 ? `Я сиділа на ${specific}.` : `Я сиділа ${plural ? 'на одному зі стільців' : 'на стільці'}.`) : (targetCell && count > 1 ? `Я сидів на ${specific}.` : `Я сидів ${plural ? 'на одному зі стільців' : 'на стільці'}.`);
            if (type === 'carpet')
                return female ? (targetCell && count > 1 ? `Я стояла на ${specific}.` : `Я стояла ${plural ? 'на одному з килимів' : 'на килимі'}.`) : (targetCell && count > 1 ? `Я стояв на ${specific}.` : `Я стояв ${plural ? 'на одному з килимів' : 'на килимі'}.`);
            if (type === 'bed')
                return female ? (targetCell && count > 1 ? `Я була на ${specific}.` : `Я була ${plural ? 'на одному з ліжок' : 'на ліжку'}.`) : (targetCell && count > 1 ? `Я був на ${specific}.` : `Я був ${plural ? 'на одному з ліжок' : 'на ліжку'}.`);
            return female ? `Я була на ${specific}.` : `Я був на ${specific}.`;
        }
        if (type === 'chair')
            return targetCell ? `I was sitting on the ${specific}.` : `I was sitting ${plural ? 'on one of the chairs' : 'on the chair'}.`;
        if (type === 'carpet')
            return targetCell ? `I was standing on the ${specific}.` : `I was standing ${plural ? 'on one of the carpets' : 'on the carpet'}.`;
        if (type === 'bed')
            return targetCell ? `I was on the ${specific}.` : `I was ${plural ? 'on one of the beds' : 'on the bed'}.`;
        return `I was on the ${specific}.`;
    }
    function adjacentPhrase(type, targetCell, gender) {
        const count = state.cells.filter(c => c.object === type).length;
        if (targetCell) {
            const ref = exactObjectRef(targetCell, type, 'adjacent');
            if (lang === 'ru')
                return gender === 'f' ? `Я стояла рядом с ${ref}.` : `Я стоял рядом с ${ref}.`;
            if (lang === 'uk')
                return gender === 'f' ? `Я стояла біля ${ref}.` : `Я стояв біля ${ref}.`;
            return `I was standing beside the ${ref}.`;
        }
        if (lang === 'ru') {
            if (count > 1)
                return gender === 'f' ? `Рядом со мной было одно из ${OBJECT_PLURAL_GEN.ru[type] || pluralFor(type, 'ru')}.` : `Рядом со мной было одно из ${OBJECT_PLURAL_GEN.ru[type] || pluralFor(type, 'ru')}.`;
            const form = OBJECT_FORMS.ru?.[type]?.gen || objectNoun(type).toLowerCase();
            return gender === 'f' ? `Я стояла рядом с ${form}.` : `Я стоял рядом с ${form}.`;
        }
        if (lang === 'uk') {
            if (count > 1)
                return gender === 'f' ? `Поруч зі мною був один із ${OBJECT_PLURAL_GEN.uk[type] || pluralFor(type, 'uk')}.` : `Поруч зі мною був один із ${OBJECT_PLURAL_GEN.uk[type] || pluralFor(type, 'uk')}.`;
            const form = OBJECT_FORMS.uk?.[type]?.gen || objectNoun(type).toLowerCase();
            return gender === 'f' ? `Я стояла біля ${form}.` : `Я стояв біля ${form}.`;
        }
        return count > 1 ? `One of the ${pluralFor(type, 'en')} was right beside me.` : `I was standing beside the ${objectNoun(type).toLowerCase()}.`;
    }
    function pluralFor(type, l) {
        const map = l === 'ru' ? OBJECT_PLURAL_GEN.ru : l === 'uk' ? OBJECT_PLURAL_GEN.uk : null;
        if (map?.[type])
            return map[type];
        if (l === 'en')
            return ({ window: 'windows', fireplace: 'fireplaces', candlestick: 'candelabras', table: 'tables', long_table: 'long tables', plant: 'plants', bookcase: 'bookcases', wardrobe: 'wardrobes', chair: 'chairs', bed: 'beds', carpet: 'carpets' })[type] || `${type}s`;
        return objectNoun(type).toLowerCase();
    }
    function clueText(cl) {
        const char = findChar(cl.character);
        if (!char)
            return '';
        const ch = char.name[lang], gender = CHARACTER_GENDER[cl.character] || 'm', tier = clueTier(state.level);
        const room = cl.room ? roomName(state.roomMap.get(cl.room)) : '';
        const relation = clueRelation(cl);
        const targetCell = cl.objectId ? state.objectMap.get(cl.objectId) || null : null;
        const type = clueObjectType(cl, targetCell);
        const typeCount = type ? state.cells.filter(c => c.object === type).length : 0;
        const parts = [];
        if (cl.notRow != null)
            parts.push(negativeCoordinate('row', cl.notRow, state.level.rows, gender));
        if (cl.notCol != null)
            parts.push(negativeCoordinate('col', cl.notCol, state.level.cols, gender));
        if (cl.row != null || cl.col != null || cl.room) {
            const coords = [];
            if (cl.row != null)
                coords.push(coordinateLabel('row', cl.row, state.level.rows, tier));
            if (cl.col != null)
                coords.push(coordinateLabel('col', cl.col, state.level.cols, tier));
            if (cl.room)
                coords.push(roomPrep(room));
            const f = gender === 'f';
            if (lang === 'ru')
                parts.push((f ? 'Я была ' : 'Я был ') + coords.join(', ') + '.');
            else if (lang === 'uk')
                parts.push((f ? 'Я була ' : 'Я був ') + coords.join(', ') + '.');
            else
                parts.push(`I was ${coords.join(', ')}.`);
        }
        if (type && relation === 'on') {
            parts.push(onPhrase(type, targetCell, gender));
        }
        else if (type && relation === 'adjacent') {
            parts.push(adjacentPhrase(type, targetCell, gender));
        }
        else if (type && relation === 'notAdjacent') {
            const plural = OBJECT_PLURAL[lang]?.[type] || `${type}s`;
            const genPlural = OBJECT_PLURAL_GEN[lang]?.[type] || pluralFor(type, lang);
            if (cl.objectId && targetCell) {
                const exact = exactObjectRef(targetCell, type, 'notAdjacent');
                if (lang === 'ru')
                    parts.push(gender === 'f' ? `Терпеть не могу ${exact}: я к нему не подходила.` : `Терпеть не могу ${exact}: я к нему не подходил.`);
                else if (lang === 'uk')
                    parts.push(gender === 'f' ? `Не люблю ${exact}: я до нього не підходила.` : `Не люблю ${exact}: я до нього не підходив.`);
                else
                    parts.push(`I stayed away from ${exact}.`);
            }
            else if (lang === 'ru') {
                const f = gender === 'f';
                if (type === 'carpet')
                    parts.push(f ? 'Терпеть не могу ковры — в моей комнате к ним я не подходила.' : 'Терпеть не могу ковры — в моей комнате к ним я не подходил.');
                else if (typeCount > 1)
                    parts.push(f ? `Я не подходила ни к одному из ${genPlural}.` : `Я не подходил ни к одному из ${genPlural}.`);
                else
                    parts.push(f ? `Я к ${OBJECT_FORMS.ru?.[type]?.dat || objectNoun(type).toLowerCase()} не подходила.` : `Я к ${OBJECT_FORMS.ru?.[type]?.dat || objectNoun(type).toLowerCase()} не подходил.`);
            }
            else if (lang === 'uk') {
                const f = gender === 'f';
                if (type === 'carpet')
                    parts.push(f ? 'Не люблю килими — я до них не підходила.' : 'Не люблю килими — я до них не підходив.');
                else if (typeCount > 1)
                    parts.push(f ? `Я не підходила до жодного з ${genPlural}.` : `Я не підходив до жодного з ${genPlural}.`);
                else
                    parts.push(f ? `Я не підходила до ${OBJECT_FORMS.uk?.[type]?.gen || objectNoun(type).toLowerCase()}.` : `Я не підходив до ${OBJECT_FORMS.uk?.[type]?.gen || objectNoun(type).toLowerCase()}.`);
            }
            else
                parts.push(typeCount > 1 ? `I did not go near any of the ${plural}.` : `I stayed away from the ${objectNoun(type).toLowerCase()}.`);
        }
        const relative = relativePhrase(cl, gender);
        if (relative)
            parts.push(relative);
        return `${ch}: «${parts.join(' ') || '…'}»`;
    }
    function shell(active) {
        document.body.dataset.activeNav = active;
        applyAppearance();
        const nav = (name, label, key) => `<button type="button" class="nav-icon ${active === key ? "active" : ""}" data-nav="${key}" aria-label="${esc(label)}" title="${esc(label)}">${icon(name)}</button>`;
        const flag = FLAGS[lang] || FLAGS.ru;
        document.getElementById("app").innerHTML = `<header class="topbar">
   <div class="topbar-tools">
     <button type="button" id="themeToggle" class="icon-button" aria-label="" title="">${icon(currentAppearance() === "light" ? "moon" : "sun")}</button>
     <div class="lang-picker">
       <button type="button" id="langToggle" class="icon-button flag-button" aria-label="${esc(t("chooseLanguage"))}" title="${esc(t("chooseLanguage"))}">${flag}</button>
       <div class="lang-menu" id="langMenu">
         <button class="lang-option ${lang === "ru" ? "selected" : ""}" data-lang="ru" aria-label="Русский">🇷🇺</button>
         <button class="lang-option ${lang === "uk" ? "selected" : ""}" data-lang="uk" aria-label="Українська">🇺🇦</button>
         <button class="lang-option ${lang === "en" ? "selected" : ""}" data-lang="en" aria-label="English">🇬🇧</button>
       </div>
     </div>
   </div>
   <button type="button" class="brand brand-home" data-nav="home" aria-label="${esc(t("home"))}"><span><strong>${esc(lang === "ru" ? "ПОСЛЕДНЯЯ КЛЕТКА" : lang === "uk" ? "ОСТАННЯ КЛІТИНКА" : "THE LAST CELL")}</strong></span></button>
   <nav class="nav" aria-label="Navigation">${nav("home", t("home"), "home")}${nav("levels", t("levels"), "levels")}${nav("daily", t("daily"), "daily")}${nav("rules", t("rules"), "rules")}${nav("how", t("how"), "how")}</nav>
 </header><main class="page"></main>`;
        updateThemeButton();
        $("themeToggle").onclick = toggleAppearance;
        $("langToggle").onclick = () => $("langMenu")?.classList.toggle("open");
        document.querySelectorAll(".lang-option").forEach(b => b.onclick = () => { setLanguage(b.dataset.lang); $("langMenu")?.classList.remove("open"); });
        document.querySelectorAll("[data-nav]").forEach(b => b.onclick = () => {
            const v = b.dataset.nav;
            if (v === "home")
                renderHome();
            else if (v === "levels")
                renderLevels();
            else if (v === "daily")
                renderDaily();
            else if (v === "rules")
                openRules();
            else
                openHow();
        });
    }
    function setTheme(theme) { document.body.dataset.theme = theme || "base"; }
    function renderHome() {
        stopTimer();
        shell("home");
        setTheme("base");
        const resume = hasResume();
        const saved = resume ? JSON.parse(localStorage.getItem(SAVE_KEY)) : null;
        const level = saved ? (saved.levelId.startsWith('daily-') ? ensureDailyLevel() : LEVELS.find(l => l.id === saved.levelId)) : null;
        const homeCard = (ico, title, sub, key, extra = "") => `<button class="hero-btn ${extra}" data-home="${key}" ${key === "resume" && !resume ? "disabled" : ""}><span class="hero-btn-top"><span class="hero-icon">${ico}</span><strong>${esc(title)}</strong></span><small>${esc(sub)}</small></button>`;
        document.querySelector(".page").innerHTML = `<section class="hero redesign-home">
   <div class="hero-copy">
    <h1>${esc(t("gameTitle1"))}<br><span>${esc(t("gameTitle2"))}</span></h1>
    <div class="hero-actions hero-actions-main">
      ${homeCard("▶", t("start"), t("newGame"), "start", "primary")}
      ${homeCard("↻", t("resume"), resume ? `${t("continueAt")} ${String(level?.order || "")}` : t("resumeUnavailable"), "resume", resume ? "resume-ready" : "disabled")}
      ${homeCard("▦", t("levels"), `${campaignCount()} ${t("case").toLowerCase()}`, "levels")}
      ${homeCard("◷", t("daily"), t("dailyDesc"), "daily")}
    </div>
    <div class="home-utilities">
      <button class="home-utility" type="button" data-home="how"><span aria-hidden="true">?</span>${esc(t("how"))}</button>
      <button class="home-utility" type="button" data-home="rules"><span aria-hidden="true">≡</span>${esc(t("rules"))}</button>
    </div>
   </div>
   <div class="hero-stage redesigned-stage" aria-hidden="true"><div class="stage-grid"></div><div class="stage-glow"></div><div class="stage-board">${Array.from({ length: 36 }, (_, i) => `<i class="stage-cell ${i % 8 === 1 ? "c" : ""} ${i % 11 === 0 ? "p" : ""}">${i % 10 === 0 ? "×" : ""}</i>`).join("")}</div><div class="stage-piece p1">А</div><div class="stage-piece p2">Б</div><div class="stage-piece p3">В</div><div class="stage-last">☠<span>${esc(t("victim"))}</span></div></div>
 </section>`;
        document.querySelectorAll("[data-home]").forEach(b => b.onclick = () => {
            const v = b.dataset.home;
            if (v === "levels")
                renderLevels();
            else if (v === "start")
                startFresh();
            else if (v === "resume")
                continueGame();
            else if (v === "daily")
                renderDaily();
            else if (v === "rules")
                openRules();
            else if (v === "how")
                openHow();
        });
    }
    function startFresh() { clearResume(); setLevel("lvl-001", false); }
    function continueGame() {
        if (loadProgress())
            renderPlay();
        else
            renderHome();
    }
    function campaignCount() {
        let n = 0;
        for (const l of LEVELS)
            if (!l.isDaily)
                n++;
        return n;
    }
    function ensureDailyLevel() {
        const date = new Date();
        const dateKey = dailyDateKey(date);
        const id = dailyIdForDate(date);
        let level = LEVELS.find(l => l.id === id && l.isDaily);
        if (level)
            return level;
        try {
            const cached = JSON.parse(localStorage.getItem(DAILY_CACHE_KEY) || "null");
            if (cached && cached.id === id && Array.isArray(cached.cells) && Array.isArray(cached.clues))
                level = cached;
        }
        catch { }
        if (!level) {
            try {
                level = window.LastCellGenerator.generateDaily(dateKey);
            }
            catch (err) {
                console.error("Daily generation failed", err);
                return null;
            }
        }
        level.isDaily = true;
        const oldDaily = LEVELS.findIndex(l => l.isDaily);
        if (oldDaily >= 0)
            LEVELS.splice(oldDaily, 1);
        LEVELS.push(level);
        compileLevel(level);
        try {
            localStorage.setItem(DAILY_CACHE_KEY, JSON.stringify(level));
        }
        catch { }
        return level;
    }
    function renderDaily() {
        stopTimer();
        shell("daily");
        setTheme("daily");
        const level = ensureDailyLevel();
        if (!level) {
            document.querySelector(".page").innerHTML = '<section class="panel"><h2>Daily unavailable</h2></section>';
            return;
        }
        document.querySelector(".page").innerHTML = `<section class="daily-page"><div class="daily-hero"><div class="eyebrow">${esc(t("dailyToday"))}</div><h2>${esc(t("dailyTitle"))}</h2><p>${esc(t("dailyDesc"))}</p><div class="daily-meta"><span class="stat">${level.rows}×${level.cols}</span><span class="stat">${level.activeCharacters.length} ${esc(t("suspects").toLowerCase())}</span><span class="stat">${esc(txt(level.location))}</span></div><button class="primary daily-open">${esc(t("dailyOpen"))}</button></div><div class="daily-mini-board" style="--daily-cols:${level.cols};--daily-rows:${level.rows}">${level.cells.map(c => `<i class="${BLOCKED_CELL(c) ? "blocked" : ""}">${esc(objectDef(c).icon || "")}</i>`).join("")}</div></section>`;
        document.querySelector(".daily-open").onclick = () => setLevel(level.id, false);
    }
    function BLOCKED_CELL(c) { return !!c && BLOCKED_OBJECTS.has(c.object); }
    function renderLevels() {
        stopTimer();
        shell("levels");
        setTheme("base");
        const done = getDone();
        const campaign = LEVELS.filter(l => !l.isDaily).sort((a, b) => a.order - b.order);
        const chapters = {};
        campaign.forEach(l => (chapters[l.chapter] ??= []).push(l));
        const previousId = order => campaign.find(l => l.order === order - 1)?.id;
        document.querySelector(".page").innerHTML = Object.entries(chapters).map(([ch, arr]) => { const l = arr[0]; return `<section class="chapter ${esc(l.theme ? `theme-${l.theme}` : "")}"><div class="chapter-head"><span>${esc(t("chapter"))} ${ch}</span><div><h2>${esc(txt(l.location))}</h2><small class="theme-chip">${esc(t("theme"))}: ${esc(l.theme || "classic")}</small></div></div><div class="levels">${arr.map(x => { const previous = previousId(x.order), unlocked = x.order === 1 || (!!previous && done.includes(previous)), completed = done.includes(x.id); return `<article class="level-card ${completed ? "done" : ""} ${unlocked ? "" : "locked"}"><div class="level-num">${esc(t("case"))} ${String(x.order).padStart(3, "0")}</div><h3>${esc(txt(x.title))}</h3><div class="stars">${"★".repeat(Math.min(8, x.difficulty)) + "☆".repeat(8 - Math.min(8, x.difficulty))}</div><div class="goal-chip">${esc(GOALS[x.goalType]?.[lang] || x.goalType)}</div><p>${esc(txt(x.intro))}</p><button class="${unlocked ? "primary" : "secondary"} openLevel" data-id="${x.id}" ${unlocked ? "" : "disabled"}>${unlocked ? (completed ? esc(t("completed")) : esc(t("open"))) : `🔒 ${esc(t("locked"))}`}</button></article>`; }).join("")}</div></section>`; }).join("");
        const page = document.querySelector(".page");
        page.onclick = e => {
            const button = e.target.closest(".openLevel:not([disabled])");
            if (button)
                setLevel(button.dataset.id, false);
        };
    }
    function setLevel(id, restore = true) {
        stopTimer();
        const target = LEVELS.find(l => l.id === id) || LEVELS[0];
        if (!target)
            return;
        prepareLevel(target);
        state.playerPositions = {};
        state.notes = {};
        state.clueDismissed = {};
        state.selectedCharacter = null;
        state.selectedAccused = null;
        state.focus = null;
        state.mode = "place";
        state.finalized = false;
        state.placementSolved = false;
        state.seconds = state.level.rows === 4 ? 360 : 420;
        state.lastSavedAt = Date.now();
        document.body.dataset.theme = state.level.theme || "base";
        if (restore && loadProgress()) {
            renderPlay();
            return;
        }
        saveProgress();
        renderPlay();
    }
    function renderPlay() {
        stopTimer();
        shell("play");
        setTheme(state.level.theme || "base");
        const l = state.level;
        document.querySelector(".page").innerHTML = `<section class="layout"><aside class="side"><div class="panel"><div class="panel-title">${esc(t("case"))} ${String(l.order).padStart(3, "0")}</div><div class="case-title">${esc(txt(l.title))}</div><div class="muted">${esc(txt(l.location))}</div><div class="stats"><span class="stat">${l.rows}×${l.cols}</span><span class="stat">${l.activeCharacters.length} ${esc(t("suspects").toLowerCase())}</span><span class="stat theme-stat">${esc(l.theme || "classic")}</span></div><div class="goal"><b>${esc(t("goal"))}:</b><br>${esc(txt(l.goalText))}</div><div id="saveState" class="save-state">${esc(t("saved"))}</div></div><div class="panel"><div class="panel-title">${esc(t("suspects"))}</div><div id="characters" class="char-list"></div><div class="victim-card"><div class="victim-token">☠</div><div><b>${esc(t("victim"))}</b><div class="muted victim-desc">${esc(t("lastText"))}</div></div></div></div></aside><section class="center"><div class="game-head"><div><div class="eyebrow">${esc(t("hint"))}</div><h2 class="game-title">${esc(txt(l.title))}</h2></div><div class="timer"><strong id="timerValue"></strong><span>${esc(t("case"))}</span></div></div><div class="board-shell"><div id="board" class="board" role="grid" aria-label="${esc(txt(l.title))}"></div></div><div class="controls"><button id="placeBtn">${esc(t("pieces"))}</button><button id="notesBtn">${esc(t("notes"))}</button><button id="nearBtn">${esc(t("near"))}</button><span class="help">${esc(t("nearText"))}</span></div><div class="actions"><button id="checkBtn" class="primary">${esc(t("check"))}</button><button id="surrenderBtn">${esc(t("surrender"))}</button><button id="solutionBtn" disabled>${esc(t("solution"))}</button></div><div id="result" class="result hidden"></div><div class="panel killer-panel"><div id="accusedTitle" class="panel-title">${esc(t("culprit"))}</div><div id="accused" class="accused-list"></div><button id="accusedCheck" class="secondary accused-check">${esc(t("check"))}</button><div id="accusedResult" class="result hidden"></div></div></section><aside class="right"><div class="panel"><div class="panel-title">${esc(t("map"))}</div><div id="map" class="map"></div></div><div class="panel"><div class="panel-title">${esc(t("clues"))}</div><div id="clues" class="clues"></div><div class="progress"><div id="progressBar"></div></div><div class="muted progress-note">${esc(t("savedExact"))}</div></div></aside></section>`;
        updateAll();
        bindPlay();
        if (state.seconds > 0 && !state.finalized)
            startTimer();
        else
            updateTimer();
    }
    function bindPlay() {
        const board = $("board");
        if (board)
            board.addEventListener("click", handleBoardClick);
        const characters = $("characters");
        if (characters)
            characters.addEventListener("click", handleCharacterClick);
        const accused = $("accused");
        if (accused)
            accused.addEventListener("click", handleAccusedClick);
        const clues = $("clues");
        if (clues) {
            clues.addEventListener("click", handleClueClick);
            clues.addEventListener("keydown", handleClueKeydown);
        }
        $("placeBtn").onclick = () => setMode("place");
        $("notesBtn").onclick = () => setMode("notes");
        $("nearBtn").onclick = () => setMode("proximity", { clearCharacter: true });
        $("checkBtn").onclick = checkPlacement;
        $("surrenderBtn").onclick = () => { state.finalized = true; stopTimer(); saveProgress(); showOutcome(t("gaveup"), t("solution")); };
        $("solutionBtn").onclick = () => state.finalized && showSolution();
        $("accusedCheck").onclick = checkAccused;
    }
    function setMode(mode, { clearCharacter = false } = {}) {
        state.mode = mode;
        state.focus = null;
        if (clearCharacter)
            state.selectedCharacter = null;
        saveProgress();
        updateAll();
    }
    function handleBoardClick(event) {
        const board = $("board"), cell = event.target.closest(".cell");
        if (!board || !cell || !board.contains(cell))
            return;
        cellClick(Number(cell.dataset.row), Number(cell.dataset.col));
    }
    function handleCharacterClick(event) {
        const button = event.target.closest(".char-card[data-character]");
        if (!button)
            return;
        state.selectedCharacter = button.dataset.character;
        state.mode = "place";
        state.focus = null;
        saveProgress();
        updateAll();
    }
    function handleAccusedClick(event) {
        const button = event.target.closest(".killer[data-character]");
        if (!button || button.disabled)
            return;
        state.selectedAccused = button.dataset.character;
        saveProgress();
        updateAccused();
    }
    function updateAll() {
        const tasks = [[updateCharacters, "characters"], [updateBoard, "board"], [updateMap, "map"], [updateClues, "clues"], [updateAccused, "accused"]];
        for (const [fn, id] of tasks) {
            try {
                fn();
            }
            catch (err) {
                console.error("Last Cell render error:", id, err);
                const el = $(id);
                if (el)
                    el.innerHTML = '<div class="muted">Не удалось отобразить этот блок.</div>';
            }
        }
        $("placeBtn")?.classList.toggle("active", state.mode === "place");
        $("notesBtn")?.classList.toggle("active", state.mode === "notes");
        $("nearBtn")?.classList.toggle("active", state.mode === "proximity");
        $("solutionBtn")?.toggleAttribute("disabled", !state.finalized);
        const badge = $("saveState");
        if (badge)
            badge.textContent = t("saved");
    }
    function updateCharacters() {
        const box = $("characters");
        if (!box)
            return;
        const fragment = document.createDocumentFragment();
        state.level.activeCharacters.forEach(id => { const ch = findChar(id), p = state.playerPositions[id], b = document.createElement("button"); b.type = "button"; b.dataset.character = id; b.className = `char-card char-${id} ${state.selectedCharacter === id ? "active" : ""}`; b.innerHTML = `<span class="avatar">${esc(ch.name[lang][0])}</span><span class="char-main"><span class="char-name">${esc(ch.name[lang])}</span><span class="char-status">${p ? `${esc(t("placed"))} ${p}` : esc(t("unknown"))}</span></span>`; fragment.appendChild(b); });
        box.innerHTML = "";
        box.appendChild(fragment);
    }
    function updateBoard(showSolutionPreview = false) {
        const b = $("board");
        if (!b)
            return;
        b.innerHTML = "";
        b.style.setProperty("--rows", state.level.rows);
        b.style.setProperty("--cols", state.level.cols);
        b.dataset.geometry = "square";
        b.dataset.mode = state.mode;
        const occ = charsAt(), { rows, cols } = used(), victim = victimCell();
        let sr = null, sc = null;
        if (state.selectedCharacter && state.playerPositions[state.selectedCharacter])
            [sr, sc] = state.playerPositions[state.selectedCharacter].split(",").map(Number);
        const focus = state.mode === "proximity" && state.focus ? state.focus.split(",").map(Number) : null, solPreview = showSolutionPreview ? state.solutionAt : null, fragment = document.createDocumentFragment();
        for (let r = 0; r < state.level.rows; r++)
            for (let c = 0; c < state.level.cols; c++) {
                const cell = cellAt(r, c) || { r, c, roomId: null, object: "none" }, room = state.roomMap.get(cell.roomId), od = objectDef(cell), k = key(r, c), el = document.createElement("div");
                el.className = `cell ${room?.className || ""}`;
                el.dataset.row = r;
                el.dataset.col = c;
                el.dataset.key = k;
                el.setAttribute("role", "gridcell");
                roomEdge(el, r, c);
                if (od.blocked)
                    el.classList.add("blocked");
                if (state.mode === "place" && sr !== null && (rows.has(r) || cols.has(c)) && !(r === sr && c === sc))
                    el.classList.add("forbidden");
                if (state.mode === "place" && sr !== null && !rows.has(r) && !cols.has(c) && !blocked(cell))
                    el.classList.add("available", "candidate-cell");
                if (state.mode === "notes" && !blocked(cell))
                    el.classList.add("noteable");
                if (victim === k)
                    el.classList.add("victim-cell");
                if (focus) {
                    const d = Math.abs(focus[0] - r) + Math.abs(focus[1] - c);
                    if (d === 0)
                        el.classList.add("focus-center");
                    else if (d === 1)
                        el.classList.add("neighbor-cell");
                    else if (Math.abs(focus[0] - r) === 1 && Math.abs(focus[1] - c) === 1)
                        el.classList.add("diagonal-cell");
                }
                const tag = document.createElement("span");
                tag.className = "room-label";
                tag.textContent = roomName(room).slice(0, 3).toUpperCase();
                el.appendChild(tag);
                if (cell.object !== "none") {
                    const o = document.createElement("div");
                    o.className = "object-icon";
                    o.textContent = od.icon;
                    o.title = od.name[lang];
                    el.appendChild(o);
                }
                const id = solPreview ? solPreview.get(k) : occ[k];
                if (id) {
                    const ch = findChar(id), p = document.createElement("div");
                    p.className = `piece char-${id}${solPreview ? " solution-piece" : ""}`;
                    p.textContent = ch.name[lang][0];
                    p.title = ch.name[lang];
                    el.appendChild(p);
                }
                else if (victim === k) {
                    const p = document.createElement("div");
                    p.className = "victim";
                    p.textContent = "☠";
                    el.appendChild(p);
                }
                else if (state.mode === "notes" && state.notes[k]) {
                    const v = state.notes[k], n = document.createElement("div");
                    n.className = `piece note-piece note-${v === "×" ? "bad" : v === "?" ? "maybe" : "ok"}`;
                    n.textContent = v;
                    el.appendChild(n);
                }
                fragment.appendChild(el);
            }
        b.appendChild(fragment);
    }
    function cellClick(r, c) {
        const cell = cellAt(r, c), k = key(r, c);
        if (!cell)
            return;
        if (state.mode === "proximity") {
            if (cell.object === "none")
                return;
            state.focus = state.focus === k ? null : k;
            saveProgress();
            updateBoard();
            return;
        }
        if (state.mode === "notes") {
            if (blocked(cell))
                return;
            const cur = state.notes[k] || "";
            state.notes[k] = cur === "" ? "×" : cur === "×" ? "?" : cur === "?" ? "✓" : "";
            saveProgress();
            updateBoard();
            return;
        }
        if (!state.selectedCharacter || blocked(cell))
            return;
        if (state.playerPositions[state.selectedCharacter] === k) {
            delete state.playerPositions[state.selectedCharacter];
            saveProgress();
            updateAll();
            return;
        }
        for (const [id, p] of Object.entries(state.playerPositions)) {
            if (id === state.selectedCharacter)
                continue;
            const [pr, pc] = p.split(",").map(Number);
            if (p === k || pr === r || pc === c)
                return;
        }
        state.playerPositions[state.selectedCharacter] = k;
        state.focus = null;
        saveProgress();
        updateAll();
    }
    function updateMap() {
        const m = $("map");
        if (!m)
            return;
        m.innerHTML = "";
        m.style.setProperty("--map-cols", state.level.cols);
        m.style.setProperty("--map-rows", state.level.rows);
        const occ = charsAt(), { rows, cols } = used(), victim = victimCell(), fragment = document.createDocumentFragment();
        for (let r = 0; r < state.level.rows; r++)
            for (let c = 0; c < state.level.cols; c++) {
                const cell = cellAt(r, c) || { r, c, roomId: null, object: "none" }, room = state.roomMap.get(cell.roomId), od = objectDef(cell), k = key(r, c), el = document.createElement("div");
                el.className = `map-cell ${room?.className || ""}`;
                if (occ[k])
                    el.innerHTML = `<span class="map-letter char-${occ[k]}">${esc(findChar(occ[k]).name[lang][0])}</span>`;
                else if (victim === k)
                    el.innerHTML = "<span class='map-letter victim-letter'>☠</span>";
                else if (od.blocked || rows.has(r) || cols.has(c)) {
                    el.classList.add("crossed");
                    el.innerHTML = "<span class='map-cross'>✕</span>";
                }
                fragment.appendChild(el);
            }
        m.appendChild(fragment);
    }
    function clueIsTrueAtSolution(level, cl) {
        const raw = level?.solution?.[cl?.character];
        if (raw == null)
            return true;
        const [r, c] = String(raw).split(',').map(Number), cell = cellAt(r, c);
        if (!cell)
            return false;
        if (cl.row != null && r !== cl.row)
            return false;
        if (cl.col != null && c !== cl.col)
            return false;
        if (cl.notRow != null && r === cl.notRow)
            return false;
        if (cl.notCol != null && c === cl.notCol)
            return false;
        if (cl.room && cell.roomId !== cl.room)
            return false;
        if (cl.targetCharacter) {
            const otherRaw = level.solution?.[cl.targetCharacter];
            if (otherRaw == null)
                return false;
            const [or, oc] = String(otherRaw).split(',').map(Number);
            if (cl.relation === 'aboveCharacter' && !(r < or))
                return false;
            if (cl.relation === 'belowCharacter' && !(r > or))
                return false;
            if (cl.relation === 'leftOfCharacter' && !(c < oc))
                return false;
            if (cl.relation === 'rightOfCharacter' && !(c > oc))
                return false;
            if (cl.relation === 'adjacentCharacter' && (Math.abs(r - or) + Math.abs(c - oc) !== 1))
                return false;
            if (cl.relation === 'notAdjacentCharacter' && (Math.abs(r - or) + Math.abs(c - oc) === 1))
                return false;
        }
        const rel = clueRelation(cl), type = clueObjectType(cl), ns = neighboursOf(r, c);
        if (rel === 'on')
            return cl.objectId ? cell.objectId === cl.objectId : cell.object === type;
        if (rel === 'adjacent')
            return cl.objectId ? ns.some(x => x.objectId === cl.objectId) : ns.some(x => x.object === type);
        if (rel === 'notAdjacent')
            return cl.objectId ? !ns.some(x => x.objectId === cl.objectId) : !ns.some(x => x.object === type);
        return true;
    }
    function updateClues() {
        const box = $("clues");
        if (!box)
            return;
        const fragment = document.createDocumentFragment();
        for (const cl of state.level.clues) {
            const ch = findChar(cl.character);
            if (!clueIsTrueAtSolution(state.level, cl)) {
                console.warn("Last Cell: clue contradicts the stored solution", state.level.id, cl);
                continue;
            }
            const id = clueId(cl), dismissed = !!state.clueDismissed[id];
            const item = document.createElement("div");
            item.className = `clue char-${cl.character}${dismissed ? " dismissed" : ""}`;
            item.dataset.clueId = id;
            item.setAttribute("role", "button");
            item.setAttribute("tabindex", "0");
            item.setAttribute("aria-pressed", dismissed ? "true" : "false");
            item.title = dismissed ? t("clueRestore") : t("clueDismiss");
            item.innerHTML = `<span class="clue-name">${esc(ch.name[lang])}</span><span class="clue-text">${esc(clueText(cl))}</span>`;
            fragment.appendChild(item);
        }
        box.innerHTML = "";
        box.appendChild(fragment);
        const total = state.level.activeCharacters.length, percent = total ? Object.keys(state.playerPositions).length / total * 100 : 0;
        $("progressBar")?.style.setProperty("--progress", `${percent}%`);
    }
    function toggleClueDismissed(item) {
        if (!item?.dataset.clueId)
            return;
        const id = item.dataset.clueId;
        state.clueDismissed[id] = !state.clueDismissed[id];
        saveProgress();
        item.classList.toggle("dismissed", !!state.clueDismissed[id]);
        item.setAttribute("aria-pressed", state.clueDismissed[id] ? "true" : "false");
    }
    function handleClueClick(event) {
        const item = event.target.closest(".clue[data-clue-id]");
        if (!item)
            return;
        toggleClueDismissed(item);
    }
    function handleClueKeydown(event) {
        if (event.key !== "Enter" && event.key !== " ")
            return;
        const item = event.target.closest(".clue[data-clue-id]");
        if (!item)
            return;
        event.preventDefault();
        toggleClueDismissed(item);
    }
    function updateAccused() {
        const box = $("accused");
        if (!box)
            return;
        const fragment = document.createDocumentFragment();
        state.level.activeCharacters.forEach(id => { const b = document.createElement("button"); b.type = "button"; b.dataset.character = id; b.className = `killer char-${id} ${state.selectedAccused === id ? "selected" : ""}`; b.disabled = !state.placementSolved; b.textContent = findChar(id).name[lang]; fragment.appendChild(b); });
        box.innerHTML = "";
        box.appendChild(fragment);
    }
    function checkPlacement() {
        const out = $("result");
        out.className = "result";
        const need = state.level.activeCharacters, placed = need.filter(id => state.playerPositions[id]);
        if (placed.length < need.length) {
            out.classList.add("bad");
            out.textContent = `${placed.length}/${need.length}`;
            return;
        }
        const v = victimCell();
        if (!v) {
            out.classList.add("bad");
            out.textContent = t("lastText");
            return;
        }
        const [vr, vc] = v.split(",").map(Number), room = cellAt(vr, vc).roomId, inRoom = need.filter(id => { const [r, c] = state.playerPositions[id].split(",").map(Number); return cellAt(r, c).roomId === room; });
        if (inRoom.length !== 1) {
            out.classList.add("bad");
            out.textContent = "✕";
            return;
        }
        let exact = 0;
        need.forEach(id => {
            if (String(state.playerPositions[id]) === String(state.level.solution[id]))
                exact++;
        });
        if (exact === need.length) {
            out.classList.add("ok");
            out.textContent = t("placementSolved");
            state.placementSolved = true;
            saveProgress();
            updateAll();
            document.querySelector(".killer-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        else {
            out.classList.add("bad");
            out.textContent = `${exact}/${need.length}`;
        }
    }
    function checkAccused() {
        const out = $("accusedResult");
        out.className = "result";
        if (!state.placementSolved || !state.selectedAccused) {
            out.classList.add("bad");
            out.textContent = t("lastText");
            return;
        }
        if (state.selectedAccused === state.level.culprit) {
            out.classList.add("ok");
            out.textContent = t("win");
            state.finalized = true;
            stopTimer();
            saveDone();
            saveProgress();
            updateAccused();
            showOutcome(t("win"), t("solution"));
        }
        else {
            out.classList.add("bad");
            out.textContent = "❌";
        }
    }
    function showOutcome(title, sub) {
        const modal = document.createElement("div");
        modal.className = "modal-bg";
        modal.innerHTML = `
    <div class="modal outcome-modal" role="dialog" aria-modal="true" aria-labelledby="outcomeTitle">
      <button class="close" type="button" aria-label="${esc(t("close"))}">×</button>
      <div class="eyebrow">${esc(title)}</div>
      <h2 id="outcomeTitle">${esc(sub)}</h2>
      <div class="actions">
        <button class="primary showSolution">${esc(t("solution"))}</button>
        ${state.level.isDaily
            ? `<button class="secondary homeDaily">${esc(t("home"))}</button>`
            : state.level.order < campaignCount()
                ? `<button class="secondary next">${esc(t("next"))}</button>`
                : `<button class="secondary home">${esc(t("home"))}</button>`}
      </div>
    </div>`;
        document.body.appendChild(modal);
        const isFinalCampaignCase = !state.level.isDaily && state.level.order >= campaignCount();
        modal.querySelector(".close").onclick = () => {
            modal.remove();
            if (isFinalCampaignCase)
                renderHome();
        };
        modal.querySelector(".showSolution").onclick = () => {
            modal.remove();
            showSolution();
        };
        modal.querySelector(".homeDaily")?.addEventListener("click", () => {
            modal.remove();
            renderHome();
        });
        modal.querySelector(".next")?.addEventListener("click", () => {
            modal.remove();
            const next = LEVELS.find(level => !level.isDaily && level.order === state.level.order + 1);
            if (next)
                setLevel(next.id, false);
            else
                renderLevels();
        });
        modal.querySelector(".home")?.addEventListener("click", () => {
            modal.remove();
            renderHome();
        });
    }
    function showSolution() {
        if (!state.finalized)
            return;
        const l = state.level, b = document.createElement("div");
        b.className = "modal-bg";
        const grid = document.createElement("div");
        grid.className = "answer-board";
        grid.style.setProperty("--answer-cols", l.cols);
        grid.style.setProperty("--answer-rows", l.rows);
        for (let r = 0; r < l.rows; r++)
            for (let c = 0; c < l.cols; c++) {
                const el = document.createElement("div");
                el.className = "answer-cell";
                const id = state.solutionAt.get(key(r, c));
                if (id) {
                    const ch = findChar(id);
                    el.classList.add(`char-${id}`);
                    el.textContent = ch.name[lang][0];
                    if (id === l.culprit)
                        el.classList.add("answer-culprit");
                }
                else if (l.victim === key(r, c)) {
                    el.classList.add("answer-victim");
                    el.textContent = "☠";
                }
                grid.appendChild(el);
            }
        const rows = l.activeCharacters.map(id => `<div class="sol-row char-${id}"><b>${esc(findChar(id).name[lang])}</b><br>${esc(l.solution[id])}</div>`).join("");
        b.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="solutionTitle"><button class="close" type="button" aria-label="${esc(t("close"))}">×</button><div class="eyebrow">${esc(t("solution"))}</div><h2 id="solutionTitle" class="visually-hidden">${esc(t("solution"))}</h2><h2>${esc(txt(l.title))}</h2><div class="solution"><div class="answer-host"></div><div class="solution-list">${rows}<div class="modal-card"><b>${esc(t("culprit"))}:</b><br>${esc(findChar(l.culprit).name[lang])}</div><div class="modal-card"><b>${esc(t("victim"))}:</b><br>${esc(l.victim)}</div></div></div><div class="actions"><button class="primary next">${esc(!l.isDaily && l.order >= campaignCount() ? t("home") : t("next"))}</button></div></div>`;
        document.body.appendChild(b);
        b.querySelector(".answer-host").appendChild(grid);
        b.querySelector(".close").onclick = () => {
            b.remove();
            if (!l.isDaily && l.order >= campaignCount())
                renderHome();
        };
        b.querySelector(".next").onclick = () => {
            b.remove();
            clearResume();
            if (!l.isDaily && l.order >= campaignCount())
                renderHome();
            else if (l.isDaily)
                renderDaily();
            else if (l.order < campaignCount()) {
                const next = LEVELS.find(x => !x.isDaily && x.order === l.order + 1);
                if (next)
                    setLevel(next.id, false);
                else
                    renderLevels();
            }
            else
                renderLevels();
        };
    }
    function closeTopModal() {
        const modal = document.querySelector(".modal-bg:last-of-type");
        if (!modal)
            return;
        modal.remove();
        if (state.finalized && state.level && !state.level.isDaily && state.level.order >= campaignCount())
            renderHome();
    }
    document.addEventListener("keydown", event => {
        if (event.key === "Escape")
            closeTopModal();
    });
    document.addEventListener("click", event => {
        if (event.target instanceof HTMLElement && event.target.classList.contains("modal-bg")) {
            event.target.remove();
            if (state.finalized && state.level && !state.level.isDaily && state.level.order >= campaignCount())
                renderHome();
        }
    });
    function ruleModal(title, body) { const b = document.createElement("div"); b.className = "modal-bg"; b.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><button class="close" type="button" aria-label="${esc(t("close"))}">×</button><div class="eyebrow">${esc(title)}</div>${body}</div>`; document.body.appendChild(b); b.querySelector(".close").onclick = () => b.remove(); }
    function openRules() {
        const rules = [
            [t("row"), t("lineText")],
            [t("col"), t("colText")],
            [t("near"), t("nearText")],
            [t("objectsTitle"), t("lesson5Text")],
            [t("notes"), t("lesson4Text")],
            [`${t("victim")} / ${t("culprit")}`, `${t("lastText")} ${t("finalCulprit")}.`]
        ];
        const items = rules.map(([title, text]) => `<li><strong>${esc(title)}.</strong> ${esc(text)}</li>`).join("");
        ruleModal(t("rulesTitle"), `<div class="rules-plain">
          <h2>${esc(t("rulesTitle"))}</h2>
          <p class="rules-plain-intro">${esc(t("goal"))}: ${esc(t("lastText"))}</p>
          <ol>${items}</ol>
          <p class="rules-plain-note">${esc(t("unique"))} ${esc(t("savedExact"))}</p>
        </div>`);
    }
    function lessonBoard(size, opts = {}) {
        const { pieces = {}, blocked = [], highlighted = [], victim = null, closedRows = [], closedCols = [] } = opts;
        let html = "";
        for (let r = 0; r < size; r++)
            for (let c = 0; c < size; c++) {
                const k = `${r},${c}`, cls = ["lesson-cell"];
                if (blocked.includes(k))
                    cls.push("blocked");
                if (highlighted.includes(k))
                    cls.push("highlighted");
                if (victim === k)
                    cls.push("victim");
                if (closedRows.includes(r))
                    cls.push("closed-row");
                if (closedCols.includes(c))
                    cls.push("closed-col");
                const piece = pieces[k], tone = piece?.tone || "cyan";
                html += `<span class="${cls.join(" ")}">${piece ? `<b class="lesson-piece tone-${tone}">${esc(piece.label || piece)}</b>` : victim === k ? "☠" : ""}</span>`;
            }
        return `<div class="lesson-grid" style="--lesson-n:${size}">${html}</div>`;
    }
    function archiveTutorialVisual(step) {
        const board = (size, opts = {}) => lessonBoard(size, opts);
        if (step === 0)
            return `<div class="lesson-visual"><div class="lesson-scene lesson-choice"><div class="lesson-person"><span class="lesson-avatar tone-cyan">Б</span><div><b>${esc(findChar("bertram").name[lang])}</b><small>${esc(t("suspectSingle"))}</small></div></div><span class="lesson-arrow">→</span>${board(4, { highlighted: ["1,2"], pieces: { "1,2": { label: "Б", tone: "cyan" } } })}</div></div>`;
        if (step === 1)
            return `<div class="lesson-visual"><div class="lesson-scene"><div class="lesson-rule"><span class="lesson-rule-label">1</span><span class="lesson-rule-label">${esc(t("row"))}</span><span class="lesson-rule-line"></span><span class="lesson-rule-label">${esc(t("col"))}</span></div>${board(5, { pieces: { "2,2": { label: "Б", tone: "cyan" } }, closedRows: [2], closedCols: [2], highlighted: ["2,2"] })}</div></div>`;
        if (step === 2)
            return `<div class="lesson-visual"><div class="lesson-scene lesson-adj-scene"><div class="lesson-adj-grid"><span class="no">×</span><span class="yes">✓</span><span class="no">×</span><span class="yes">✓</span><span class="center">Б</span><span class="yes">✓</span><span class="no">×</span><span class="yes">✓</span><span class="no">×</span></div><div class="lesson-side-note"><b>${esc(t("near"))}</b>${esc(t("lesson3Text"))}</div></div></div>`;
        if (step === 3)
            return `<div class="lesson-visual"><div class="lesson-scene lesson-notes-scene">${board(4, { pieces: { "1,1": { label: "Б", tone: "cyan" } }, blocked: ["0,1", "1,0"] })}<div class="note-stack"><div class="note-chip"><i class="note-symbol bad">×</i>${esc(t("noteCannot"))}</div><div class="note-chip"><i class="note-symbol maybe">?</i>${esc(t("noteMaybe"))}</div><div class="note-chip"><i class="note-symbol ok">✓</i>${esc(t("noteSure"))}</div></div></div></div>`;
        if (step === 4)
            return `<div class="lesson-visual"><div class="lesson-scene lesson-object-scene"><div class="object-room-grid"><div class="object-tile blocked"><span class="icon">🔥</span><b>${esc(t("objectForbidden"))}</b></div><div class="object-tile allowed"><span class="icon">🪑</span><b>${esc(t("objectAllowed"))}</b></div><div class="object-tile allowed"><span class="icon">🛏️</span><b>${esc(t("objectAllowed"))}</b></div></div><div class="object-rule-card"><strong>${esc(t("objectsTitle"))}</strong><br>${esc(t("lesson5Text"))}</div></div></div>`;
        if (step === 5)
            return `<div class="lesson-visual"><div class="lesson-scene lesson-map-scene"><div class="lesson-map-legend"><span><i class="legend-dot cyan">А</i>${esc(t("mapOccupied"))}</span><span><i class="legend-dot bad">×</i>${esc(t("mapExcluded"))}</span><span><i class="legend-dot lime">Б</i>${esc(t("mapCandidate"))}</span></div>${board(4, { pieces: { "1,1": { label: "А", tone: "cyan" }, "2,2": { label: "Б", tone: "lime" } }, blocked: ["0,0", "0,3", "3,1"] })}</div></div>`;
        if (step === 6)
            return `<div class="lesson-visual"><div class="lesson-scene lesson-last-scene">${board(4, { pieces: { "0,0": { label: "Б", tone: "cyan" }, "1,1": { label: "А", tone: "lime" }, "2,2": { label: "В", tone: "pink" } }, victim: "3,3", highlighted: ["3,3"] })}<div class="lesson-last-arrow">→</div><div class="lesson-last-badge"><b>${esc(t("svgLastCell"))}</b>${esc(t("lastCellCaption"))}</div></div></div>`;
        return `<div class="lesson-visual"><div class="lesson-scene lesson-final-scene">${board(6, { pieces: { "0,1": { label: "Б", tone: "cyan" }, "1,3": { label: "В", tone: "pink" }, "2,0": { label: "З", tone: "violet" }, "3,4": { label: "А", tone: "lime" }, "4,2": { label: "Д", tone: "orange" } }, victim: "5,5", highlighted: ["3,4"], closedRows: [0, 1, 2, 3, 4], closedCols: [0, 1, 2, 3, 4] })}<div class="lesson-final-side"><div class="final-mini-card"><i class="final-mini-icon">☠</i><b>${esc(t("victim"))}</b><small>${esc(t("finalVictim"))}</small></div><div class="final-mini-card"><i class="final-mini-icon killer">А</i><b>${esc(t("culprit"))}</b><small>${esc(t("finalCulprit"))}</small></div><div class="final-answer">${esc(t("svgFullCase"))}</div></div></div></div>`;
    }
    function openHow() {
        let tip = 0;
        const tips = [
            { title: t('lesson1Title'), text: t('lesson1Text') },
            { title: t('lesson2Title'), text: t('lesson2Text') },
            { title: t('lesson3Title'), text: t('lesson3Text') },
            { title: t('lesson4Title'), text: t('lesson4Text') },
            { title: t('lesson5Title'), text: t('lesson5Text') },
            { title: t('lesson6Title'), text: t('lesson6Text') },
            { title: t('lesson7Title'), text: t('lesson7Text') },
            { title: t('lesson8Title'), text: t('lesson8Text'), final: true }
        ];
        const render = () => { const x = tips[tip]; return `<div class="archive-tutorial"><div class="hint-progress"><span>${tip + 1}/8</span><div><i style="--progress:${((tip + 1) / 8) * 100}%"></i></div></div><div class="how-focus archive-focus"><div class="how-visual-wrap">${archiveTutorialVisual(tip)}</div><div class="hint-copy"><div class="hint-kicker">${esc(t("step"))} ${tip + 1}</div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p>${x.final ? `<div class="final-legend"><span class="legend-victim">☠ ${esc(t('victim'))}</span><span class="legend-culprit">● ${esc(t('culprit'))}</span></div>` : ''}</div></div><div class="hint-actions"><button class="secondary" id="hintPrev" ${tip === 0 ? 'disabled' : ''}>${esc(t('prevHint'))}</button><button class="primary" id="hintNext">${esc(tip === 7 ? t('close') : t('nextHint'))}</button></div></div>`; };
        ruleModal(t('howTitle'), render());
        const modal = document.querySelector('.modal-bg:last-child');
        const draw = () => {
            modal.querySelector('.modal').innerHTML = `<button class="close" type="button" aria-label="${esc(t('close'))}">×</button><div class="eyebrow">${esc(t('howTitle'))}</div><h2>${esc(t('howTitle'))}</h2>${render()}`;
            modal.querySelector('.close').onclick = () => modal.remove();
            modal.querySelector('#hintPrev')?.addEventListener('click', () => { tip = Math.max(0, tip - 1); draw(); });
            modal.querySelector('#hintNext')?.addEventListener('click', () => {
                if (tip === 7) {
                    modal.remove();
                    return;
                }
                tip++;
                draw();
            });
        };
        draw();
    }
    window.addEventListener('pagehide', saveProgress);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden')
            saveProgress();
    });
    renderHome();
})();

