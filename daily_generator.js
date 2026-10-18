(() => {
    const CHARS = ['anastasia', 'bertram', 'veronica', 'daphne', 'zebastian', 'albert'];
    const CHAR_FIRST = { anastasia: 'А', bertram: 'Б', veronica: 'В', daphne: 'Д', zebastian: 'З', albert: 'А' };
    const BLOCKED = new Set(['window', 'fireplace', 'candlestick', 'table', 'long_table', 'plant', 'bookcase', 'wardrobe']);
    const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const ROOM_PACKS = [
        [
            { id: 'r1', ru: 'Гостиная', uk: 'Вітальня', en: 'Living Room' }, { id: 'r2', ru: 'Столовая', uk: 'Їдальня', en: 'Dining Room' },
            { id: 'r3', ru: 'Библиотека', uk: 'Бібліотека', en: 'Library' }, { id: 'r4', ru: 'Спальня', uk: 'Спальня', en: 'Bedroom' }
        ],
        [
            { id: 'r1', ru: 'Фойе', uk: 'Фоє', en: 'Foyer' }, { id: 'r2', ru: 'Сцена', uk: 'Сцена', en: 'Stage' },
            { id: 'r3', ru: 'Гримерная', uk: 'Гримерна', en: 'Dressing Room' }, { id: 'r4', ru: 'Костюмерная', uk: 'Костюмерна', en: 'Wardrobe Room' }
        ],
        [
            { id: 'r1', ru: 'Диспетчерская', uk: 'Диспетчерська', en: 'Control Room' }, { id: 'r2', ru: 'Лаборатория', uk: 'Лабораторія', en: 'Laboratory' },
            { id: 'r3', ru: 'Обсерватория', uk: 'Обсерваторія', en: 'Observatory' }, { id: 'r4', ru: 'Жилой отсек', uk: 'Житловий відсік', en: 'Crew Quarters' }
        ],
        [
            { id: 'r1', ru: 'Кабинет', uk: 'Кабінет', en: 'Office' }, { id: 'r2', ru: 'Склад', uk: 'Склад', en: 'Warehouse' },
            { id: 'r3', ru: 'Каюта', uk: 'Каюта', en: 'Cabin' }, { id: 'r4', ru: 'Картографическая', uk: 'Картографічна', en: 'Map Room' }
        ]
    ];
    const SCENES = [
        { ru: 'Старый пансионат', uk: 'Старий пансіонат', en: 'Old Boarding House' },
        { ru: 'Ночной театр', uk: 'Нічний театр', en: 'Night Theatre' },
        { ru: 'Исследовательская станция', uk: 'Дослідницька станція', en: 'Research Station' },
        { ru: 'Портовый склад', uk: 'Портовий склад', en: 'Harbour Warehouse' },
        { ru: 'Загородное поместье', uk: 'Заміський маєток', en: 'Country Estate' },
        { ru: 'Гостиница у реки', uk: 'Готель біля річки', en: 'Riverside Hotel' }
    ];
    const GEOMETRIES = { square: { shape: 'square', aspect: 1 } };
    function hashSeed(seed) {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < String(seed).length; i++) {
            h ^= String(seed).charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h >>> 0;
    }
    function rng(seed) {
        let s = hashSeed(seed) || 1;
        return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s >>>= 0; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    }
    function shuffle(arr, random) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    function key(r, c) { return `${r},${c}`; }
    function gcd(a, b) { while (b) {
        const t = a % b;
        a = b;
        b = t;
    } return Math.abs(a) || 1; }
    function affinePermutation(n, random) {
        const multipliers = [];
        for (let a = 1; a < n; a++)
            if (gcd(a, n) === 1)
                multipliers.push(a);
        const a = multipliers[Math.floor(random() * multipliers.length)] || 1;
        const b = Math.floor(random() * n);
        return Array.from({ length: n }, (_, i) => (a * i + b) % n);
    }
    function makeRooms(n, random) {
        const rowSplits = n === 5 ? [2, 3] : n === 6 ? [2, 3, 4] : [Math.floor(n / 2)];
        const colSplits = n === 5 ? [2, 3] : n === 6 ? [2, 3, 4] : [Math.floor(n / 2)];
        const splitR = rowSplits[Math.floor(random() * rowSplits.length)];
        const splitC = colSplits[Math.floor(random() * colSplits.length)];
        const rooms = [];
        for (let r = 0; r < n; r++)
            for (let c = 0; c < n; c++) {
                const rr = r < splitR ? 0 : 1, cc = c < splitC ? 0 : 1;
                const idx = rr * 2 + cc;
                rooms.push({ r, c, roomId: `r${idx + 1}` });
            }
        return rooms;
    }
    function makeCells(n, random, solution, victim) {
        const roomCells = makeRooms(n, random);
        const cellMap = new Map(roomCells.map(x => [key(x.r, x.c), x.roomId]));
        const cells = [];
        const solutionKeys = new Set(Object.values(solution).map(p => key(p[0], p[1])));
        const blockedTypes = shuffle(['fireplace', 'candlestick', 'table', 'plant', 'bookcase', 'wardrobe'], random);
        let serial = 0;
        for (let r = 0; r < n; r++)
            for (let c = 0; c < n; c++) {
                const k = key(r, c), roomId = cellMap.get(k);
                let object = 'none';
                if (k === victim)
                    object = 'none';
                else if (r === 0 || c === 0 || r === n - 1 || c === n - 1) {
                    object = random() < 0.55 ? 'window' : (solutionKeys.has(k) ? 'none' : 'none');
                }
                else if (!solutionKeys.has(k) && random() < 0.25)
                    object = blockedTypes[Math.floor(random() * blockedTypes.length)];
                if (solutionKeys.has(k)) {
                    const allowed = ['none', 'chair', 'bed', 'carpet'];
                    object = allowed[Math.floor(random() * allowed.length)];
                    if (object === 'none' && random() < 0.7)
                        object = allowed[1 + Math.floor(random() * 3)];
                }
                const objectId = object === 'none' ? null : `obj-${String(++serial).padStart(3, '0')}`;
                cells.push({ r, c, roomId, object, ...(objectId ? { objectId } : {}) });
            }
        const usableTypes = ['chair', 'bed', 'carpet'];
        for (const ch of CHARS.slice(0, n - 1)) {
            const p = solution[ch];
            const cell = cells.find(x => x.r === p[0] && x.c === p[1]);
            if (cell && cell.object === 'none') {
                cell.object = usableTypes[(cell.r + cell.c) % usableTypes.length];
                cell.objectId = `obj-${String(++serial).padStart(3, '0')}`;
            }
        }
        return cells;
    }
    function neighbours(cellMap, r, c) {
        return DIRS.map(([dr, dc]) => cellMap.get(key(r + dr, c + dc))).filter(Boolean);
    }
    function clueIsTrue(level, cl) {
        const raw = level.solution?.[cl.character];
        if (raw == null)
            return false;
        const p = String(raw).split(',').map(Number);
        if (p.length !== 2 || p.some(Number.isNaN))
            return false;
        const cells = new Map(level.cells.map(c => [key(c.r, c.c), c]));
        const cell = cells.get(key(p[0], p[1]));
        if (!cell || BLOCKED.has(cell.object))
            return false;
        if (cl.row != null && p[0] !== cl.row)
            return false;
        if (cl.col != null && p[1] !== cl.col)
            return false;
        if (cl.notRow != null && p[0] === cl.notRow)
            return false;
        if (cl.notCol != null && p[1] === cl.notCol)
            return false;
        if (cl.room && cell.roomId !== cl.room)
            return false;
        if (cl.targetCharacter) {
            const otherRaw = level.solution?.[cl.targetCharacter];
            if (otherRaw == null)
                return false;
            const [or, oc] = String(otherRaw).split(',').map(Number);
            if (cl.relation === 'aboveCharacter' && !(p[0] < or))
                return false;
            if (cl.relation === 'belowCharacter' && !(p[0] > or))
                return false;
            if (cl.relation === 'leftOfCharacter' && !(p[1] < oc))
                return false;
            if (cl.relation === 'rightOfCharacter' && !(p[1] > oc))
                return false;
            if (cl.relation === 'adjacentCharacter' && (Math.abs(p[0] - or) + Math.abs(p[1] - oc) !== 1))
                return false;
            if (cl.relation === 'notAdjacentCharacter' && (Math.abs(p[0] - or) + Math.abs(p[1] - oc) === 1))
                return false;
        }
        const rel = cl.relation || (cl.on ? 'on' : cl.adj ? 'adjacent' : cl.not_adj ? 'notAdjacent' : null), type = cl.objectType || cl.on || cl.adj || cl.not_adj;
        const ns = neighbours(cells, p[0], p[1]);
        if (rel === 'on')
            return cl.objectId ? cell.objectId === cl.objectId : cell.object === type;
        if (rel === 'adjacent')
            return cl.objectId ? ns.some(x => x.objectId === cl.objectId) : ns.some(x => x.object === type);
        if (rel === 'notAdjacent')
            return cl.objectId ? !ns.some(x => x.objectId === cl.objectId) : !ns.some(x => x.object === type);
        return true;
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
    const relationOf = f => f.relation || (f.notRow != null ? 'notRow' : f.notCol != null ? 'notCol' : f.row != null && f.col != null ? 'position' : f.row != null ? 'row' : f.col != null ? 'col' : f.room ? 'room' : null);
    const clueKey = f => JSON.stringify([f.character, f.row ?? null, f.col ?? null, f.notRow ?? null, f.notCol ?? null, f.room ?? null, f.relation ?? null, f.targetCharacter ?? null, f.objectScope ?? null, f.objectType ?? null, f.objectId ?? null]);
    function makeBaseSolution(n, random) {
        const rowPermutation = affinePermutation(n, random);
        const colPermutation = affinePermutation(n, random);
        const freeRow = rowPermutation[0], freeCol = colPermutation[0];
        const rows = rowPermutation.slice(1), cols = colPermutation.slice(1);
        const chars = shuffle(CHARS.slice(0, n - 1), random), sol = {};
        for (let i = 0; i < n - 1; i++)
            sol[chars[i]] = [rows[i], cols[i]];
        return { solution: sol, victim: key(freeRow, freeCol) };
    }
    function factsFor(level) {
        const out = {}, cellMap = new Map(level.cells.map(c => [key(c.r, c.c), c]));
        const nearCells = (r, c) => neighbours(cellMap, r, c);
        const blockedTypes = [...new Set(level.cells.filter(c => c.objectId && BLOCKED.has(c.object)).map(c => c.object))];
        const tier = clueTier(level);
        for (const ch of level.activeCharacters) {
            const raw = level.solution[ch];
            if (!raw)
                throw new Error('missing solution for ' + ch);
            const p = Array.isArray(raw) ? raw : String(raw).split(',').map(Number);
            const cell = cellMap.get(key(p[0], p[1]));
            if (!cell)
                throw new Error('missing solution cell for ' + ch);
            const facts = [{ character: ch, row: p[0] }, { character: ch, col: p[1] }, { character: ch, room: cell.roomId }];
            if (cell.object && cell.object !== 'none' && !BLOCKED.has(cell.object))
                facts.push({ character: ch, relation: 'on', objectType: cell.object, objectScope: 'type', scope: 'any' });
            const ns = nearCells(p[0], p[1]);
            const nearTypes = [...new Set(ns.filter(x => x.objectId && BLOCKED.has(x.object)).map(x => x.object))];
            for (const type of nearTypes)
                facts.push({ character: ch, relation: 'adjacent', objectType: type, objectScope: 'type', scope: 'any' });
            for (const type of blockedTypes) {
                const touchesAny = level.cells.some(x => x.object === type && Math.abs(x.r - p[0]) + Math.abs(x.c - p[1]) === 1);
                if (!touchesAny)
                    facts.push({ character: ch, relation: 'notAdjacent', objectType: type, objectScope: 'type', scope: 'all' });
            }
            if (tier === 'negative' || tier === 'final') {
                for (let r = 0; r < level.rows; r++)
                    if (r !== p[0])
                        facts.push({ character: ch, notRow: r });
                for (let c = 0; c < level.cols; c++)
                    if (c !== p[1])
                        facts.push({ character: ch, notCol: c });
            }
            if (tier === 'final') {
                for (const type of blockedTypes) {
                    const touchesAny = level.cells.some(x => x.object === type && Math.abs(x.r - p[0]) + Math.abs(x.c - p[1]) === 1);
                    if (touchesAny)
                        facts.push({ character: ch, row: p[0], room: cell.roomId, relation: 'notAdjacent', objectType: type, objectScope: 'type' });
                }
                for (const other of level.activeCharacters) {
                    if (other === ch)
                        continue;
                    const [or, oc] = String(level.solution[other]).split(',').map(Number);
                    if (p[0] < or)
                        facts.push({ character: ch, relation: 'aboveCharacter', targetCharacter: other });
                    if (p[0] > or)
                        facts.push({ character: ch, relation: 'belowCharacter', targetCharacter: other });
                    if (Math.abs(p[0] - or) + Math.abs(p[1] - oc) === 1)
                        facts.push({ character: ch, relation: 'adjacentCharacter', targetCharacter: other });
                }
            }
            out[ch] = facts;
        }
        return out;
    }
    function solve(level, limit = 2) {
        const cells = new Map(level.cells.map(c => [key(c.r, c.c), c]));
        const objects = new Map(level.cells.filter(c => c.objectId).map(c => [c.objectId, c]));
        const cluesByChar = new Map();
        for (const cl of level.clues) {
            if (!cluesByChar.has(cl.character))
                cluesByChar.set(cl.character, []);
            cluesByChar.get(cl.character).push(cl);
        }
        const chars = level.activeCharacters;
        const validLocal = (ch, p) => {
            const [r, c] = p, cell = cells.get(key(r, c));
            if (!cell || BLOCKED.has(cell.object))
                return false;
            for (const cl of cluesByChar.get(ch) || []) {
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
                const rel = cl.relation || (cl.on ? 'on' : cl.adj ? 'adjacent' : cl.not_adj ? 'notAdjacent' : null), type = cl.objectType || cl.on || cl.adj || cl.not_adj;
                if (type && cl.objectScope === 'type') {
                    const ns = DIRS.map(([dr, dc]) => cells.get(key(r + dr, c + dc))).filter(Boolean);
                    if (rel === 'on' && cell.object !== type)
                        return false;
                    if (rel === 'adjacent' && !ns.some(x => x.object === type))
                        return false;
                    if (rel === 'notAdjacent' && ns.some(x => x.object === type))
                        return false;
                }
                else if (cl.objectId) {
                    const target = objects.get(cl.objectId);
                    if (!target)
                        return false;
                    const hit = DIRS.some(([dr, dc]) => cells.get(key(r + dr, c + dc)) === target);
                    if (rel === 'on' && cell !== target)
                        return false;
                    if (rel === 'adjacent' && !hit)
                        return false;
                    if (rel === 'notAdjacent' && hit)
                        return false;
                }
            }
            return true;
        };
        const candidate = Object.fromEntries(chars.map(ch => [ch, [...Array(level.rows)].flatMap((_, r) => [...Array(level.cols)].map((__, c) => [r, c]).filter(p => validLocal(ch, p)))]));
        if (Object.values(candidate).some(v => !v.length))
            return [];
        function relationHolds(assign, cl) {
            if (!cl.targetCharacter)
                return true;
            const mine = assign[cl.character], other = assign[cl.targetCharacter];
            if (!mine || !other)
                return true;
            const [r, c] = mine, [or, oc] = other;
            if (cl.relation === 'aboveCharacter')
                return r < or;
            if (cl.relation === 'belowCharacter')
                return r > or;
            if (cl.relation === 'leftOfCharacter')
                return c < oc;
            if (cl.relation === 'rightOfCharacter')
                return c > oc;
            if (cl.relation === 'adjacentCharacter')
                return Math.abs(r - or) + Math.abs(c - oc) === 1;
            if (cl.relation === 'notAdjacentCharacter')
                return Math.abs(r - or) + Math.abs(c - oc) !== 1;
            return true;
        }
        const order = [...chars].sort((a, b) => candidate[a].length - candidate[b].length), sols = [];
        function bt(i, assign, rs, cs) {
            if (sols.length >= limit)
                return;
            if (i === order.length) {
                for (const ch of chars)
                    for (const cl of cluesByChar.get(ch) || [])
                        if (!relationHolds(assign, cl))
                            return;
                const fr = [...Array(level.rows).keys()].filter(r => !rs.has(r)), fc = [...Array(level.cols).keys()].filter(c => !cs.has(c));
                if (fr.length !== 1 || fc.length !== 1)
                    return;
                const victim = key(fr[0], fc[0]), vc = cells.get(victim);
                if (!vc || BLOCKED.has(vc.object))
                    return;
                const inRoom = Object.entries(assign).filter(([, p]) => cells.get(key(p[0], p[1])).roomId === vc.roomId).map(([ch]) => ch);
                if (inRoom.length === 1 && inRoom[0] === level.culprit)
                    sols.push({ ...assign });
                return;
            }
            const ch = order[i];
            for (const p of candidate[ch]) {
                if (rs.has(p[0]) || cs.has(p[1]))
                    continue;
                assign[ch] = p;
                rs.add(p[0]);
                cs.add(p[1]);
                bt(i + 1, assign, rs, cs);
                rs.delete(p[0]);
                cs.delete(p[1]);
                delete assign[ch];
                if (sols.length >= limit)
                    return;
            }
        }
        bt(0, {}, new Set(), new Set());
        return sols;
    }
    function selectClues(level, random) {
        const facts = factsFor(level), selected = [], selectedKeys = new Set(), max = 2;
        const counts = Object.fromEntries(level.activeCharacters.map(ch => [ch, 0]));
        const relOf = f => relationOf(f);
        const signature = f => `${relOf(f) || ''}:${f.objectType || ''}:${f.targetCharacter || ''}`;
        const signatureCounts = new Map();
        const relationBase = { position: 3, row: 2, col: 2, notRow: 2, notCol: 2, room: 4, on: 5, adjacent: 5, notAdjacent: 5, aboveCharacter: 5, belowCharacter: 5, leftOfCharacter: 5, rightOfCharacter: 5, adjacentCharacter: 6, notAdjacentCharacter: 5 };
        function candidateCount(ch, clues) {
            const cells = new Map(level.cells.map(c => [key(c.r, c.c), c]));
            const objects = new Map(level.cells.filter(c => c.objectId).map(c => [c.objectId, c]));
            const list = clues.filter(c => c.character === ch);
            let total = 0;
            for (let r = 0; r < level.rows; r++)
                for (let c = 0; c < level.cols; c++) {
                    const cell = cells.get(key(r, c));
                    if (!cell || BLOCKED.has(cell.object))
                        continue;
                    let ok = true;
                    for (const cl of list) {
                        if (cl.row != null && r !== cl.row) {
                            ok = false;
                            break;
                        }
                        if (cl.col != null && c !== cl.col) {
                            ok = false;
                            break;
                        }
                        if (cl.notRow != null && r === cl.notRow) {
                            ok = false;
                            break;
                        }
                        if (cl.notCol != null && c === cl.notCol) {
                            ok = false;
                            break;
                        }
                        if (cl.room && cell.roomId !== cl.room) {
                            ok = false;
                            break;
                        }
                        const rel = relOf(cl), type = cl.objectType;
                        if (type && cl.objectScope === 'type') {
                            const ns = DIRS.map(([dr, dc]) => cells.get(key(r + dr, c + dc))).filter(Boolean);
                            if (rel === 'on' && cell.object !== type) {
                                ok = false;
                                break;
                            }
                            if (rel === 'adjacent' && !ns.some(x => x.object === type)) {
                                ok = false;
                                break;
                            }
                            if (rel === 'notAdjacent' && ns.some(x => x.object === type)) {
                                ok = false;
                                break;
                            }
                        }
                        else if (cl.objectId) {
                            const target = objects.get(cl.objectId);
                            if (!target) {
                                ok = false;
                                break;
                            }
                            const hit = DIRS.some(([dr, dc]) => cells.get(key(r + dr, c + dc)) === target);
                            if (rel === 'on' && cell !== target) {
                                ok = false;
                                break;
                            }
                            if (rel === 'adjacent' && !hit) {
                                ok = false;
                                break;
                            }
                            if (rel === 'notAdjacent' && hit) {
                                ok = false;
                                break;
                            }
                        }
                    }
                    if (ok)
                        total++;
                }
            return total;
        }
        function scoreFact(f, current, character) {
            const rel = relOf(f), sig = signature(f), tier = clueTier(level);
            let score = relationBase[rel] || 1;
            if (tier === 'negative' && (rel === 'notRow' || rel === 'notCol' || rel === 'notAdjacent'))
                score += 9;
            if (tier === 'final' && (rel === 'notRow' || rel === 'notCol' || rel === 'notAdjacent' || rel === 'aboveCharacter' || rel === 'belowCharacter' || rel === 'adjacentCharacter'))
                score += 10;
            if (tier === 'final' && f.room && f.relation === 'notAdjacent')
                score += 5;
            if (tier === 'geography' && rel === 'room')
                score += 2;
            if (!signatureCounts.has(sig))
                score += 4;
            else
                score -= Math.min(5, signatureCounts.get(sig) * 2);
            const currentCandidates = candidateCount(character, current);
            const afterCandidates = candidateCount(character, [...current, f]);
            score += Math.max(0, currentCandidates - afterCandidates) * 1.8;
            if (afterCandidates === 1)
                score += 6;
            score += random() * 1.25;
            return score;
        }
        for (const ch of shuffle(level.activeCharacters, random)) {
            const pool = [...(facts[ch] || [])].filter(f => clueIsTrue(level, f) && !selectedKeys.has(clueKey(f)));
            if (!pool.length)
                continue;
            pool.sort((a, b) => scoreFact(b, selected, ch) - scoreFact(a, selected, ch));
            const first = pool[0], fk = clueKey(first);
            selected.push(first);
            selectedKeys.add(fk);
            counts[ch] = 1;
            const sig = signature(first);
            signatureCounts.set(sig, (signatureCounts.get(sig) || 0) + 1);
        }
        let sols = solve({ ...level, clues: selected }, 2);
        while (sols.length !== 1) {
            const options = [];
            for (const ch of level.activeCharacters) {
                if (counts[ch] >= max)
                    continue;
                const existing = new Set(selected.filter(x => x.character === ch).map(relOf));
                for (const fact of facts[ch] || []) {
                    if (!clueIsTrue(level, fact))
                        continue;
                    const fk = clueKey(fact);
                    if (selectedKeys.has(fk))
                        continue;
                    const sig = signature(fact);
                    const sigCount = signatureCounts.get(sig) || 0;
                    if (sigCount >= 2)
                        continue;
                    const rel = relOf(fact);
                    const localDiversity = existing.has(rel) ? 0 : 2;
                    const solved = solve({ ...level, clues: [...selected, fact] }, 2);
                    const uniqueness = solved.length === 1 ? 28 : 8 - Math.min(6, solved.length * 2);
                    const strength = scoreFact(fact, selected, ch);
                    options.push({ fact, score: uniqueness + localDiversity + strength + random() * 0.25 });
                }
            }
            if (!options.length) {
                for (const ch of level.activeCharacters) {
                    if (counts[ch] >= max)
                        continue;
                    for (const fact of facts[ch] || []) {
                        const fk = clueKey(fact);
                        if (selectedKeys.has(fk))
                            continue;
                        const solved = solve({ ...level, clues: [...selected, fact] }, 2);
                        options.push({ fact, score: (solved.length === 1 ? 25 : 5) + random() * 0.25 });
                    }
                }
            }
            if (!options.length)
                break;
            options.sort((a, b) => b.score - a.score);
            const pick = options[0].fact;
            selected.push(pick);
            selectedKeys.add(clueKey(pick));
            counts[pick.character]++;
            const sig = signature(pick);
            signatureCounts.set(sig, (signatureCounts.get(sig) || 0) + 1);
            sols = solve({ ...level, clues: selected }, 2);
        }
        if (sols.length !== 1)
            return selected;
        if (selected.some(f => !clueIsTrue(level, f)))
            return [];
        const ensurePreferred = (predicate) => {
            if (selected.some(f => predicate(f)))
                return true;
            const options = [];
            for (const ch of shuffle(level.activeCharacters, random)) {
                if (counts[ch] >= max)
                    continue;
                for (const f of facts[ch] || []) {
                    if (!predicate(f) || !clueIsTrue(level, f))
                        continue;
                    const fk = clueKey(f);
                    if (selectedKeys.has(fk))
                        continue;
                    const solved = solve({ ...level, clues: [...selected, f] }, 2);
                    if (solved.length === 1)
                        options.push({ f, score: scoreFact(f, selected, ch) + random() * 0.2 });
                }
            }
            options.sort((a, b) => b.score - a.score);
            if (!options.length)
                return false;
            const pick = options[0].f;
            selected.push(pick);
            selectedKeys.add(clueKey(pick));
            counts[pick.character]++;
            const sig = signature(pick);
            signatureCounts.set(sig, (signatureCounts.get(sig) || 0) + 1);
            return true;
        };
        const tier = clueTier(level);
        if (tier === 'negative')
            ensurePreferred(f => f.notRow != null || f.notCol != null || f.relation === 'notAdjacent');
        if (tier === 'final')
            ensurePreferred(f => f.relation === 'adjacentCharacter' || f.relation === 'aboveCharacter' || f.relation === 'belowCharacter' || (f.relation === 'notAdjacent' && f.room));
        const total = level.activeCharacters.length;
        const twoTarget = 1 + Math.floor(random() * Math.max(1, Math.floor(total / 2)));
        while (Object.values(counts).filter(v => v === 2).length < twoTarget) {
            const candidates = [];
            for (const ch of shuffle(level.activeCharacters, random)) {
                if (counts[ch] >= 2)
                    continue;
                const existing = new Set(selected.filter(x => x.character === ch).map(relOf));
                for (const f of facts[ch] || []) {
                    if (!clueIsTrue(level, f))
                        continue;
                    const fk = clueKey(f);
                    if (selectedKeys.has(fk))
                        continue;
                    const sig = signature(f);
                    const sigCount = signatureCounts.get(sig) || 0;
                    if (sigCount >= 2)
                        continue;
                    const rel = relOf(f), currentCandidates = candidateCount(ch, selected), afterCandidates = candidateCount(ch, [...selected, f]);
                    let score = (existing.has(rel) ? 0 : 6) + Math.max(0, currentCandidates - afterCandidates) * 1.5 + (sigCount ? 0 : 5);
                    if (afterCandidates === 1)
                        score += 3;
                    if (solve({ ...level, clues: [...selected, f] }, 2).length === 1)
                        score += 4;
                    candidates.push({ f, score: score + random() * 0.25 });
                }
            }
            if (!candidates.length)
                break;
            candidates.sort((a, b) => b.score - a.score);
            const pick = candidates[0].f;
            selected.push(pick);
            selectedKeys.add(clueKey(pick));
            counts[pick.character]++;
            const sig = signature(pick);
            signatureCounts.set(sig, (signatureCounts.get(sig) || 0) + 1);
        }
        return selected;
    }
    function build(seed, { id = 'daily', order = 0, date = null, n = 6, geometry = 'square', difficulty = 3, title = null, clueTier: requestedClueTier = null } = {}) {
        const random = rng(seed);
        for (let attempt = 0; attempt < 40; attempt++) {
            const base = makeBaseSolution(n, random), chars = Object.keys(base.solution);
            const cells = makeCells(n, random, base.solution, base.victim);
            const roomByVictim = cells.find(c => key(c.r, c.c) === base.victim)?.roomId;
            const roomPack = ROOM_PACKS[Math.floor(random() * ROOM_PACKS.length)];
            const scene = SCENES[Math.floor(random() * SCENES.length)];
            const roomSuspects = chars.filter(ch => { const p = base.solution[ch]; return cells.find(c => c.r === p[0] && c.c === p[1])?.roomId === roomByVictim; });
            if (roomSuspects.length !== 1)
                continue;
            const culprit = roomSuspects[0];
            const level = {
                id, order, chapter: 0, theme: 'daily', difficulty, clueTier: clueTier({ order, clueTier: requestedClueTier }),
                title: title || { ru: 'Дело дня', uk: 'Справа дня', en: 'Daily Case' },
                location: scene,
                goalType: ['murder', 'theft', 'sabotage', 'espionage'][Math.floor(random() * 4)],
                goalText: { ru: 'Расставь подозреваемых, найди Последнюю клетку и выясни, кто оказался в комнате жертвы.', uk: 'Розстав підозрюваних, знайди Останню клітинку та з’ясуй, хто опинився в кімнаті жертви.', en: 'Place the suspects, find the Last Cell, and work out who is in the victim’s room.' },
                intro: { ru: 'Сегодняшнее дело собрано заново: новая форма, новая сцена и свои свидетельства.', uk: 'Сьогоднішню справу зібрано заново: нова форма, нова сцена та власні свідчення.', en: 'Built fresh for today: a new shape, a new scene, and its own testimonies.' },
                rows: n, cols: n, geometry: GEOMETRIES[geometry] || GEOMETRIES.square, rooms: roomPack.map(r => ({ id: r.id, name: { ru: r.ru, uk: r.uk, en: r.en }, className: `room-${r.id}` })), cells, activeCharacters: chars, solution: Object.fromEntries(Object.entries(base.solution).map(([ch, p]) => [ch, key(p[0], p[1])])), victim: base.victim, culprit, clues: []
            };
            level.clues = selectClues(level, random);
            if (level.clues.length && solve(level, 2).length === 1) {
                return level;
            }
        }
        throw new Error('Daily generator could not create a unique case');
    }
    function generateDaily(date, options = {}) {
        const d = String(date);
        const n = 5 + (hashSeed(`size:${d}`) % 2);
        const difficulty = n === 5 ? 3 : 4;
        const clueTierForDaily = options.clueTier || (difficulty >= 4 ? 'final' : 'negative');
        return build(`daily:${d}`, { ...options, id: `daily-${d}`, date: d, n, geometry: 'square', difficulty, clueTier: clueTierForDaily });
    }
    window.LastCellGenerator = { build, generateDaily, GEOMETRIES, CHARS, FIRST: CHAR_FIRST };
})();

