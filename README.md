# AREA OPTIMISER — Exploring Maximum Area Through Mathematics

Interactive Class 12 Mathematics exhibition website (CBSE · *Applications of Derivatives — Maxima and Minima*), styled in a neubrutalist design (flat colours, thick ink borders, hard shadows). Colours live in `src/styles/global.css` (`:root`) and `src/styles/theme.js` (SVG/chart colours).
Built with **React + Vite + CSS**, **Framer Motion**, **Recharts**, **KaTeX** and **Lucide** icons.
No backend, no paid APIs, works fully **offline** once built (fonts and KaTeX are bundled locally).

## Installation & running

Requires **Node.js 18+** (check with `node -v`).

```bash
npm install          # install dependencies (needs internet once)
npm run dev          # development server → open the URL shown (usually http://localhost:5173)
npm test             # run the 21 mathematics unit tests (Vitest)
npm run build        # production build into dist/
npm run preview      # serve the production build → http://localhost:4173
```

**For the exhibition laptop:** run `npm run build` once, then `npm run preview` — no internet needed.

## Project structure

```
├── index.html
├── package.json
├── vite.config.js
├── public/favicon.svg
├── tests/math.test.js               # unit tests for every formula
└── src/
    ├── main.jsx                     # entry: fonts, KaTeX CSS, global styles
    ├── App.jsx                      # loader → navbar → sections
    ├── styles/
    │   ├── global.css               # design tokens, cards, buttons, forms, stats
    │   └── sections.css             # section-specific layout & responsive rules
    ├── utils/
    │   ├── geometry.js              # Shoelace formula, orientation, perimeter, self-intersection, parsing
    │   ├── optimisation.js          # A(L), A'(L), A''(L), P²/16, calculator conditions, validation
    │   └── format.js                # number formatting
    ├── hooks/useHistory.js          # undo / redo state
    ├── data/
    │   ├── project.js               # ← edit names / school / achievements here
    │   └── arduinoSketch.js         # example Arduino Nano code shown on the site
    ├── components/                  # Loader, Navbar, Background, Footer, Tex, AnimatedNumber,
    │                                # Reveal, SectionHeader, Stat, FeedbackIndicator
    └── sections/
        ├── Hero.jsx                 # animated graph + morphing rectangle
        ├── Problem.jsx
        ├── ShapeCalculator/         # MODE 1 — irregular polygon + Shoelace
        │   ├── ShapeCalculator.jsx
        │   └── PolygonCanvas.jsx
        ├── OptimisationLab/         # MODE 2 — fixed-perimeter maxima & minima
        │   ├── OptimisationLab.jsx
        │   ├── AreaGraph.jsx
        │   ├── RectangleViz.jsx
        │   └── DerivativePanel.jsx
        ├── DimensionCalculator.jsx  # L & B calculator, two separate conditions
        ├── Explanation.jsx
        ├── Applications.jsx
        ├── Technology.jsx
        └── About.jsx
```

## The mathematics

**Mode 1 — Shoelace Formula** (area of the shape you draw, not its maximum):
A = ½ |Σ (xᵢ yᵢ₊₁ − xᵢ₊₁ yᵢ)|. The absolute value makes the result identical for clockwise and anticlockwise order.
The site also warns about self-intersecting or collinear vertices, and compares the shape against the regular n-gon
and circle having the same perimeter (the true “how big could it be” benchmarks).

**Mode 2 — Fixed perimeter P:** B = P/2 − L, A(L) = L(P/2 − L), A′(L) = P/2 − 2L, A′ = 0 ⇒ L = B = P/4,
A″(L) = −2 < 0 ⇒ maximum, A_max = P²/16.

**Calculator — two separate conditions:**
1. *Fixed perimeter* → best is the square, A_max = (L+B)²/4 = P²/16.
2. *Independent limits* L ≤ L_max, B ≤ B_max → no turning point; A_max = L_max × B_max (boundary maximum).

## Customising
Edit `src/data/project.js` to add team names, school and guide teacher.
