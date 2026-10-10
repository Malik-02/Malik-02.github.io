/* =====================================================================
   RIFT LINKS — GAME LOGIC (JavaScript)

   JavaScript is the part of a website that "does things": reacts to
   clicks, checks answers, remembers progress. index.html is the
   skeleton, style.css is the paint, this file is the brain.

   You don't need to edit this to run the site. Puzzles live in
   puzzles.js and colours live in style.css. But it's commented so you
   can read along and learn how it works.

   Anything after  //  or between  /*  and  * /  is a comment. The
   browser ignores comments; they're notes for humans.
   ===================================================================== */

// Everything is wrapped in (function () { ... })(); so our variable
// names can't clash with anything else on the page. It's a common
// JavaScript habit, you can ignore it.
(function () {

  /* ---------------------------------------------------------------
     SETTINGS
     "const" creates a named value that never changes.
     --------------------------------------------------------------- */
  const MAX_MISTAKES = 4;                       // guesses you can get wrong
  const SITE_URL = "malik-02.github.io";        // shown in the share text
  const SQUARES = ["🟨", "🟩", "🟦", "🟪"];     // emoji per group, easiest to hardest

  // Shortcut: $("board") finds the element in index.html with id="board".
  // Saves typing document.getElementById(...) everywhere.
  const $ = (id) => document.getElementById(id);


  /* ---------------------------------------------------------------
     SMALL HELPER FUNCTIONS
     A "function" is a reusable chunk of code you can call by name.
     --------------------------------------------------------------- */

  // Turns 7 into "07" so dates always look like 2026-10-07.
  function pad(n) { return String(n).padStart(2, "0"); }

  // Today's date in the player's own time zone, as "YYYY-MM-DD".
  // This is how the site decides which puzzle is "today's".
  function todayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  // "2026-10-10" -> "Oct 10, 2026" for display.
  function prettyDate(key) {
    return new Date(key + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  // Randomly reorders a list (the "Fisher-Yates shuffle", a classic).
  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];   // swap two items
    }
    return list;
  }

  // localStorage is a small notepad the browser keeps for each website.
  // We use it to remember a player's progress if they refresh or come
  // back later. It only lives on that player's device.
  // try/catch means "attempt this, and if it errors, don't crash".
  function load(date) {
    try { return JSON.parse(localStorage.getItem("riftlinks:" + date)); } catch (e) { return null; }
  }
  function save(date, data) {
    try { localStorage.setItem("riftlinks:" + date, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  // Shows a red message box instead of the game.
  function fail(message) {
    $("error").textContent = message;
    $("error").hidden = false;
    $("game").hidden = true;
    $("archiveBtn").hidden = true;
  }


  /* ---------------------------------------------------------------
     CHECK puzzles.js FOR MISTAKES
     If you make a typo in puzzles.js, this catches it and tells you
     exactly which date is broken, instead of showing a blank page.
     --------------------------------------------------------------- */
  function validate() {
    // If puzzles.js has a syntax error, PUZZLES never gets created.
    if (typeof PUZZLES === "undefined" || !Array.isArray(PUZZLES)) {
      return "The site couldn't read puzzles.js. Look near your last edit for a missing comma, quote or bracket.";
    }
    const seenDates = new Set();                 // a Set is a list with no duplicates
    for (const p of PUZZLES) {                   // loop over every puzzle
      const where = p && p.date ? "Puzzle dated " + p.date : "A puzzle with no date";

      // The /.../ thing is a "regular expression": a pattern. This one means 4 digits-2 digits-2 digits.
      if (!p || !/^\d{4}-\d{2}-\d{2}$/.test(p.date || "")) return where + ": the date must look like 2026-10-10.";
      if (seenDates.has(p.date)) return "Two puzzles use the date " + p.date + ". Each date can only have one puzzle.";
      seenDates.add(p.date);

      if (!Array.isArray(p.groups) || p.groups.length !== 4) return where + ": needs exactly 4 groups.";

      const words = new Set();
      for (const g of p.groups) {
        if (!g.name) return where + ": every group needs a name.";
        if (!Array.isArray(g.words) || g.words.length !== 4) return where + ": the group \"" + g.name + "\" needs exactly 4 words.";
        for (const w of g.words) {
          const k = String(w).trim().toLowerCase();
          if (words.has(k)) return where + ": the word \"" + w + "\" appears twice.";
          words.add(k);
        }
      }
    }
    return null;   // null = "no problems found"
  }

  const problem = validate();
  if (problem) { fail(problem); return; }   // stop here if puzzles.js is broken


  /* ---------------------------------------------------------------
     PICK TODAY'S PUZZLE
     --------------------------------------------------------------- */

  // Sort all puzzles by date and number them #1, #2, #3...
  const ALL = [...PUZZLES].sort((a, b) => a.date.localeCompare(b.date));
  ALL.forEach((p, i) => { p.number = i + 1; });

  // Only puzzles dated today or earlier are playable. Future ones stay hidden.
  // If you skip a day, the most recent past puzzle shows instead.
  const today = todayKey();
  const AVAILABLE = ALL.filter((p) => p.date <= today);

  if (!AVAILABLE.length) {
    fail(ALL.length ? "The first puzzle unlocks on " + prettyDate(ALL[0].date) + "." : "No puzzles yet. Add one to puzzles.js.");
    $("error").style.borderColor = "var(--line)";
    $("error").style.color = "var(--muted)";
    return;
  }


  /* ---------------------------------------------------------------
     GAME STATE
     "state" is everything about the current game: which words are
     selected, which groups are solved, how many mistakes, etc.
     "let" is like const, but the value can change later.
     --------------------------------------------------------------- */
  let puzzle;   // the puzzle being played
  let state;    // the player's progress on it

  // Which group (0-3) does a word belong to?
  function groupOf(word) { return puzzle.groups.findIndex((g) => g.words.includes(word)); }

  // Load a puzzle: either resume saved progress or start fresh.
  function start(p) {
    puzzle = p;
    const saved = load(p.date);
    if (saved && saved.version === 1) {
      state = saved;
    } else {
      state = {
        version: 1,
        selected: [],          // words the player has tapped
        solved: [],            // group numbers found so far
        mistakes: 0,
        guesses: [],           // every guess, for the emoji share grid
        tried: [],             // guesses already made, to block repeats
        over: false,
        won: false,
        remaining: shuffle(p.groups.flatMap((g) => g.words)),   // all 16 words, mixed up
      };
    }
    state.selected = [];

    const isToday = p === AVAILABLE[AVAILABLE.length - 1];
    $("puzzleLabel").textContent = "#" + p.number + " · " + prettyDate(p.date) + (isToday ? "" : " (archive)");
    $("msg").textContent = "";
    $("archive").hidden = true;
    render();
  }

  // Save progress (minus the current selection) to the browser.
  function persist() {
    save(puzzle.date, Object.assign({}, state, { selected: [] }));
  }


  /* ---------------------------------------------------------------
     DRAW THE SCREEN
     render() rebuilds the board from "state" every time something
     changes. Simple and hard to get out of sync.
     --------------------------------------------------------------- */
  function render() {
    const board = $("board");
    board.innerHTML = "";   // wipe the board

    // 1. Solved groups appear as coloured bars at the top.
    state.solved.forEach((gi) => {
      const g = puzzle.groups[gi];
      const bar = document.createElement("div");
      bar.className = "solved c" + gi;           // c0..c3 = colour classes in style.css
      const title = document.createElement("b");
      title.textContent = g.name;
      const list = document.createElement("span");
      list.textContent = g.words.join(", ");
      bar.append(title, list);
      board.appendChild(bar);
    });

    // 2. Remaining words become clickable tiles.
    state.remaining.forEach((word) => {
      const tile = document.createElement("button");
      tile.type = "button";
      const isSelected = state.selected.includes(word);
      tile.className = "tile" + (isSelected ? " sel" : "");
      tile.textContent = word;
      tile.disabled = state.over;
      tile.setAttribute("aria-pressed", isSelected);   // tells screen readers it's toggled
      tile.onclick = () => toggle(word);
      board.appendChild(tile);
    });

    // 3. Mistake dots: gold = left, dark = used.
    $("pips").innerHTML = Array.from({ length: MAX_MISTAKES }, (_, i) =>
      '<span class="pip' + (i < MAX_MISTAKES - state.mistakes ? "" : " gone") + '"></span>').join("");

    // 4. Buttons only work when they make sense.
    $("submit").disabled = state.selected.length !== 4 || state.over;
    $("clear").disabled = state.selected.length === 0 || state.over;

    // 5. Swap the buttons for the results box once the game ends.
    $("controls").hidden = state.over;
    $("end").hidden = !state.over;
    if (state.over) renderEnd();
  }

  function renderEnd() {
    $("endTitle").textContent = state.won ? (state.mistakes === 0 ? "Flawless victory" : "Victory") : "Defeat";
    $("shareGrid").textContent = shareGrid();
    const latest = AVAILABLE[AVAILABLE.length - 1];
    $("nextLine").textContent = puzzle === latest ? "New puzzle at midnight." : "";
  }

  // Turns guesses into rows of emoji, e.g. 🟨🟨🟩🟨
  function shareGrid() {
    return state.guesses.map((row) => row.map((g) => SQUARES[g]).join("")).join("\n");
  }


  /* ---------------------------------------------------------------
     PLAYER ACTIONS
     --------------------------------------------------------------- */

  // Tap a tile: select it, or unselect it if it's already selected. Max 4.
  function toggle(word) {
    const s = state.selected;
    if (s.includes(word)) s.splice(s.indexOf(word), 1);
    else if (s.length < 4) s.push(word);
    $("msg").textContent = "";
    render();
  }

  // Press Submit: check the 4 selected words.
  function submit() {
    const sel = [...state.selected];

    // Block the exact same guess twice (doesn't cost a mistake).
    const key = [...sel].sort().join("|");
    if (state.tried.includes(key)) { $("msg").textContent = "Already guessed!"; return; }
    state.tried.push(key);
    state.guesses.push(sel.map(groupOf));

    // Count how many selected words belong to each group.
    const counts = {};
    sel.forEach((w) => { const g = groupOf(w); counts[g] = (counts[g] || 0) + 1; });
    const best = Math.max(...Object.values(counts));

    // All 4 from the same group = correct!
    if (best === 4) {
      state.solved.push(groupOf(sel[0]));
      state.remaining = state.remaining.filter((w) => !sel.includes(w));
      state.selected = [];
      if (state.solved.length === 4) { state.over = true; state.won = true; }
      persist();
      render();
      return;
    }

    // Otherwise it's a mistake.
    state.mistakes++;
    $("msg").textContent = best === 3 ? "One away..." : "Not a group.";

    // Shake animation on the wrong tiles (defined in style.css).
    document.querySelectorAll(".tile.sel").forEach((t) => {
      t.classList.remove("shake"); void t.offsetWidth; t.classList.add("shake");
    });

    if (state.mistakes >= MAX_MISTAKES) {
      // Out of mistakes: reveal every group and end the game.
      state.over = true;
      puzzle.groups.forEach((g, gi) => { if (!state.solved.includes(gi)) state.solved.push(gi); });
      state.remaining = [];
      state.selected = [];
      persist();
      setTimeout(() => { $("msg").textContent = ""; render(); }, 450);   // wait for the shake to finish
    } else {
      persist();
      setTimeout(render, 380);
    }
  }


  /* ---------------------------------------------------------------
     ARCHIVE OF PAST PUZZLES
     --------------------------------------------------------------- */
  function openArchive() {
    const list = $("archiveList");
    list.innerHTML = "";
    [...AVAILABLE].reverse().forEach((p) => {           // newest first
      const s = load(p.date);
      let status = "Not played";
      if (s && s.over) status = s.won ? "Solved" : "Lost";
      else if (s && s.guesses && s.guesses.length) status = "In progress";

      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-current", p === puzzle);
      const left = document.createElement("span");
      left.textContent = "#" + p.number + " · " + prettyDate(p.date);
      const right = document.createElement("span");
      right.className = "state";
      right.textContent = status;
      btn.append(left, right);
      btn.onclick = () => { start(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
      li.appendChild(btn);
      list.appendChild(li);
    });
    $("archive").hidden = false;
    $("archive").scrollIntoView({ behavior: "smooth", block: "start" });
  }


  /* ---------------------------------------------------------------
     CONNECT BUTTONS TO FUNCTIONS
     "onclick" = run this function when the button is clicked.
     --------------------------------------------------------------- */
  $("submit").onclick = submit;
  $("shuffle").onclick = () => { shuffle(state.remaining); persist(); render(); };
  $("clear").onclick = () => { state.selected = []; render(); };
  $("archiveBtn").onclick = openArchive;
  $("closeArchive").onclick = () => { $("archive").hidden = true; };

  // Copy the emoji result to the clipboard so players can paste it anywhere.
  $("copy").onclick = () => {
    const text = "Rift Links #" + puzzle.number + "\n" + shareGrid() + "\n" + SITE_URL;
    const done = () => {
      $("copy").textContent = "Copied";
      setTimeout(() => { $("copy").textContent = "Copy result"; }, 1500);
    };
    const fallback = () => {   // if copying is blocked, highlight the grid so they can copy manually
      const r = document.createRange(); r.selectNodeContents($("shareGrid"));
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    };
    try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
  };


  /* ---------------------------------------------------------------
     GO! Start on the newest available puzzle.
     --------------------------------------------------------------- */
  start(AVAILABLE[AVAILABLE.length - 1]);

})();
