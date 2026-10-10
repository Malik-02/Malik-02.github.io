# Rift Links

A daily League of Legends word-grouping puzzle. Live at **https://malik-02.github.io**

This file is the guide for running the site yourself.

---

## What each file does

| File | What it is | Do you edit it? |
|---|---|---|
| `puzzles.js` | All the puzzles, one per date | **Yes, this is the main one** |
| `style.css` | Colours, fonts, sizes (the "paint") | Sometimes, to change the look |
| `index.html` | Page structure, Google/SEO tags, footer (the "skeleton") | Rarely |
| `game.js` | Game logic: clicks, checking answers, saving progress (the "brain") | No, unless you're learning |
| `og-image.png` | Preview picture when the link is shared in Discord, texts, etc. | Only to redesign it |
| `favicon.svg` | Little icon in the browser tab | Rarely |
| `robots.txt`, `sitemap.xml` | Tell Google it's allowed to list the site | No |
| `README.md` | This guide | Whenever you want |

The site is plain **HTML, CSS and JavaScript**: the three languages every website is built on. No frameworks, no build step, no server. GitHub Pages serves the files as-is.

---

## Add a new puzzle (daily routine, ~2 minutes)

1. Open `puzzles.js` in your repository and click the **pencil icon** (Edit).
2. Copy one whole puzzle block, from its `{` to its closing `},`
3. Paste it just above the final `];`
4. Change the `date` and the four groups (easiest first, hardest last).
5. Click **Commit changes**. The site updates in about a minute.

Tip: write a week of puzzles at once. Future-dated puzzles stay hidden until their day, so you can schedule ahead.

If you make a typo, the site shows a red box telling you which date is broken. Fix it and commit again.

---

## Tools

**To run the site you need nothing but a browser and GitHub.** You can edit everything on github.com, even from your phone.

**To learn and edit on your computer (recommended, all free):**

- **VS Code** (code.visualstudio.com): the code editor most developers use. Colours your code so it's easier to read and spots typos.
- **Live Server** extension for VS Code: right-click `index.html` → "Open with Live Server" and the site opens in your browser, refreshing every time you save.
- **Chrome DevTools**: on any website, right-click → Inspect. The **Console** tab shows errors; the **Elements** tab lets you try style changes live.
- **GitHub Desktop** (desktop.github.com): a simple app to send changes from your computer to GitHub without typing commands.

**Free places to learn the basics:** MDN Web Docs (developer.mozilla.org), freeCodeCamp's Responsive Web Design course, and javascript.info.

---

## First-time setup (already done once, here for reference)

1. Upload all files: repository → **Add file → Upload files** → drag everything in → **Commit changes**.
2. Turn the site on: **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)` → **Save**.
3. Wait 1–2 minutes, then visit https://malik-02.github.io

## Get on Google

1. Go to **Google Search Console** (search.google.com/search-console) and add a property using the **URL prefix** option: `https://malik-02.github.io/`
2. Verify with the **HTML tag** method: Google gives you a `<meta name="google-site-verification" ...>` line. Paste it into `index.html` just under the `<title>` line, commit, then click Verify.
3. In Search Console, open **Sitemaps** and submit `sitemap.xml`.
4. Wait a few days to two weeks for it to show up.

## Custom domain (optional, later)

1. Buy the domain (Cloudflare, Porkbun or Namecheap).
2. In GitHub: **Settings → Pages → Custom domain**, type it in, save.
3. At your domain seller, add the DNS records GitHub's docs list (search "GitHub Pages managing a custom domain").
4. Update the address in `index.html` (canonical and og tags), `game.js` (`SITE_URL`), `robots.txt` and `sitemap.xml`.

---

## Rules for a public fan site

- Keep the Riot disclaimer in the footer.
- Keep it free (no paywalls).
- Don't use Riot's logos, splash art or official branding.
