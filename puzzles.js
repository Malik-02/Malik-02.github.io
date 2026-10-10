/* =====================================================================
   RIFT LINKS — PUZZLES FILE
   This is the only file you need to edit to add new puzzles.

   HOW TO ADD A PUZZLE
   1. Copy one whole block, from its opening {  down to its closing },
   2. Paste it at the bottom of the list (just above the final  ];  )
   3. Change the date (YYYY-MM-DD) and the four groups.
   4. Commit. The site updates in about a minute.

   RULES
   - One puzzle per date. The puzzle goes live at midnight in each
     player's own time zone.
   - Exactly 4 groups, each with exactly 4 words.
   - No word can appear twice in the same puzzle.
   - Order the groups easiest first (yellow) to hardest last (purple).
   - Every block ends with a comma after its closing  }
   - If you use an apostrophe inside a word, keep the double quotes:
     "Kog'Maw" works fine.

   If the site ever shows a red error box, it will tell you which
   date has the problem.
   ===================================================================== */

const PUZZLES = [

  {
    date: "2026-10-10",
    groups: [
      { name: "Summoner spells",      words: ["Flash", "Ignite", "Exhaust", "Smite"] },
      { name: "Yordles",              words: ["Teemo", "Tristana", "Veigar", "Lulu"] },
      { name: "Drake types",          words: ["Infernal", "Ocean", "Cloud", "Mountain"] },
      { name: "Champions from Ionia", words: ["Ahri", "Yasuo", "Irelia", "Karma"] },
    ],
  },

  {
    date: "2026-10-11",
    groups: [
      { name: "Roles",                     words: ["Top", "Mid", "Bot", "Support"] },
      { name: "Jungle camps",              words: ["Gromp", "Krugs", "Raptors", "Wolves"] },
      { name: "Champions with a sidekick", words: ["Annie", "Kled", "Nunu", "Ivern"] },
      { name: "Pentakill band members",    words: ["Karthus", "Mordekaiser", "Sona", "Yorick"] },
    ],
  },

  {
    date: "2026-10-12",
    groups: [
      { name: "Chat slang",  words: ["GG", "AFK", "FF", "KS"] },
      { name: "Freljord",    words: ["Ashe", "Braum", "Sejuani", "Tryndamere"] },
      { name: "Demacia",     words: ["Garen", "Lux", "Fiora", "Galio"] },
      { name: "Darkin",      words: ["Aatrox", "Varus", "Kayn", "Naafiri"] },
    ],
  },

];
