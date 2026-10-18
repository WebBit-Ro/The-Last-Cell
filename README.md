# ☠️ The Last Cell | Остання клітинка | Последняя клетка

 An adaptive web-based logic detective game built with pure HTML, CSS, and JavaScript.
 Мультивалютна адаптивна веб-гра у жанрі логічного детективу на чистому HTML, CSS та JavaScript.
 Адаптивная веб-игра в жанре логического детектива на чистом HTML, CSS и JavaScript.

---
 
## 🌐 Live Demo / Перегляд сайту / Просмотр сайта

* 🇬🇧 **English:** You can check the live site [here](https://webbit-ro.github.io/The-Last-Cell/)
* 🇺🇦 **Українська:** Подивитися роботу сайту можна [тут](https://webbit-ro.github.io/The-Last-Cell/)
* 🇷🇺 **Русский:** Посмотреть работу сайта вы можете [тут](https://webbit-ro.github.io/The-Last-Cell/)

---

###  Language / Мова / Язык
* [English](#-english)
* [Українська](#-українська)
* [Русский](#-русский)

---

##  English

**The Last Cell** is a web-based logic puzzle game where players act as detectives, analytical thinking to deduce suspect placements, find the "Last Cell" (the victim's location), and identify the culprit based on provided testimonies.

### 🌟 Key Features
* **440+ Campaign Levels:** Progressively scaling difficulty categorized into thematic chapters.
* **Daily Case Generator:** Procedurally builds a completely unique puzzle every single day.
* **Full Multi-language Support:** Dynamic runtime switching between English, Ukrainian, and Russian.
* **Atmorphic Themes:** Includes custom styles mapped to game genres (Classic, Mafia, Werewolves, Occult).
* **Pure Vanilla Stack:** Built from scratch using zero build tools, external frameworks, or heavy dependencies.
* **Smart UI/UX:** Responsive layouts, light/dark mode toggles, animations, progress auto-saving via `localStorage`.

### 🛠️ Tech Stack & Architecture
* **Frontend:** Semantic HTML5, Modern CSS3 (Grid/Flexbox layouts, CSS variables, native responsive design).
* **Core Logic:** Vanilla JavaScript (ES6+), native State Management, procedurally-driven algorithms, math-based GCD/affine permutations for grid generation.
* **Quality Assurance:** Native automated smoke testing framework without heavy packages.

### 🚀 Local Deployment
1. Clone or download this repository.
2. Open the project folder in your code editor.
3. Launch `index.html` via a local server (e.g., *Live Server* extension in VS Code) or run:
   ```bash
   python -m http.server 8000
   ```
4. Navigate to `http://localhost:8000` in your browser.
*(Note: Running via a server is recommended over direct `file://` execution to ensure stable localStorage permissions across all modern browsers).*

---

## 🇺🇦 Українська

**Остання клітинка** — це браузерна логічна гра-головоломка, де гравець виступає в ролі детектива. Мета гри — використовуючи дедукцію та аналітичне мислення, розставити підозрюваних по своїх місцях, знайти «останню клітинку» (кімнату жертви) та обчислити справжнього злочинця на основі свідчень.

### 🌟 Ключові особливості
* **440+ рівнів кампанії:** Поступове масштабування складності, розбите на тематичні глави.
* **Генератор щоденних справ:** Процедурно створює абсолютно унікальну детективну задачу щодня.
* **Повна локалізація:** Динамічне перемикання інтерфейсу між англійською, українською та російською мовами.
* **Атмосферні теми:** Ексклюзивні стилі для різних ігрових жанрів (Класика, Мафія, Перевертні, Окультизм).
* **Чистий Vanilla-стек:** Написано з нуля без використання збирачів, фреймворків чи сторонніх важких бібліотек.
* **Продуманий UI/UX:** Адаптивна сітка, перемикач темної/світлої теми, плавні анімації, автозбереження прогресу через `localStorage`.

### 🛠️ Технологічний стек та архітектура
* **Frontend:** Семантичний HTML5, сучасний CSS3 (Grid, Flexbox, рідні CSS-змінні для тем оформлення).
* **Логіка гри:** Рідний JavaScript (ES6+), ручне управління станом гри, процедурні алгоритми та афінні перестановки для генерації ігрового поля.
* **Тестування:** Власний вбудований фреймворк для швидких димових (smoke) перевірок цілісності рівнів та локалізацій.

### 🚀 Запуск проекту
1. Завантажте або склонуйте репозиторій.
2. Відкрийте папку проекту у вашому редакторі коду.
3. Запустіть `index.html` через локальний сервер (наприклад, розширення *Live Server* у VS Code) або виконайте команду:
   ```bash
   python -m http.server 8000
   ```
4. Відкрийте `http://localhost:8000` у браузері.

---

## 🇷🇺 Русский

**Последняя клетка** — это браузерная логическая игра-головоломка, в которой игрок примеряет на себя роль детектива. Используя дедукцию и аналитическое мышление, необходимо правильно расставить подозреваемых на поле, найти «последнюю клетку» (комнату жертвы) и вычислить преступника на основе собранных улик и показаний.

### 🌟 Ключевые особенности
* **440+ уровней кампании:** Постепенно растущая сложность, разделенная на тематические главы.
* **Генератор ежедневных дел:** Процедурно создает совершенно уникальную детективную задачу каждый день.
* **Полная локализация:** Динамическое переключение интерфейса «на лету» между английским, украинским и русским языками.
* **Атмосферные темы:** Эксклюзивные стили под разные игровые жанры (Классика, Мафия, Оборотни, Оккультизм).
* **Чистый Vanilla-стек:** Написано с нуля без использования сборщиков (Webpack/Vite), фреймворков или тяжелых сторонних библиотек.
* **Продуманный UI/UX:** Адаптивная сетка, переключатель темной/светлой темы, поддержка `prefers-reduced-motion`, автосохранение прогресса через `localStorage`.

### 🛠️ Технологический стек и архитектура
* **Frontend:** Семантический HTML5, современный CSS3 (Grid, Flexbox, нативные CSS-переменные для кастомных тем).
* **Логика игры:** Чистый JavaScript (ES6+), нативное управление состоянием (State Management), процедурные алгоритмы генерации и аффинные перестановки.
* **Тестирование:** Собственный легковесный smoke-тест для мгновенной валидации структуры уровней и языковых локалей.

### 🚀 Запуск проекта
1. Скачайте или склонируйте репозиторий.
2. Откройте папку проекта в вашем редакторе кода.
3. Запустите `index.html` через локальный сервер (например, расширение *Live Server* в VS Code) или выполните в консоли:
   ```bash
   python -m http.server 8000
   ```
4. Откройте адрес `http://localhost:8000` в браузере.
