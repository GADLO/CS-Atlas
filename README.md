# CS Atlas · Computer Systems Atlas

> A time-based, explorable atlas of computer hardware: from vacuum-tube cabinets to AI accelerators, explained through a timeline, 3D exhibits, and interactive models.

**Status: time-first M1 implemented.** The app now has one master timeline (4 periods × hardware/software/algorithm lanes, 78 nodes), ten derived chapter lenses, seven questions, a lab for calculators and the GPU module, and procedural 3D exhibits. The branch is awaiting review and has not been pushed.

## Overview

CS Atlas is a full-stack learning application that presents computer hardware along a historical timeline and answers seven core questions from the course textbook:

1. How are programs written in C, Java, and other high-level languages translated into machine code, and how does hardware execute the result?
2. What is the interface between software and hardware?
3. What determines program performance, and how can programmers improve it?
4. What techniques can hardware designers use to improve performance?
5. How can hardware designers and programmers improve energy efficiency?
6. Why did serial processing evolve into parallel processing, and what changed as a result?
7. Which great ideas have shaped modern computing since the first commercial computer in 1951?

## Tech stack

- **Frontend:** React 19, Vite, TypeScript, Three.js
- **Backend:** Node.js 22, Express 5, SQLite
- **3D:** procedural geometry in a technical-illustration style; no external GLB assets
- **Runtime:** local, single-user web application

## Repository layout

```text
CS-Atlas/
├── web/                       # React SPA
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx · App.tsx
│       ├── pages/
│       ├── components/        # M1
│       ├── three/             # exhibit and concept scenes (M1)
│       ├── lib/               # API client, types, utilities (M1)
│       └── styles/
├── server/
│   ├── src/
│   │   ├── index.js           # entry point
│   │   ├── app.js             # middleware and route mounting
│   │   ├── config.js
│   │   ├── db/
│   │   │   ├── connection.js
│   │   │   ├── schema.sql
│   │   │   └── seed.js
│   │   ├── repositories/      # entities, timeline, questions, AI, annotations
│   │   ├── routes/            # meta, timeline, entities, questions, AI, models
│   │   ├── lib/http.js
│   │   ├── validation/seed.js
│   │   └── seed.js
│   └── test/
├── data/
│   ├── seed.json              # M1 seed (3 eras, 20 entities, 7 questions)
│   └── README.md
├── scripts/
│   ├── check-data.js
│   └── check-questions.js
├── dist/                      # build output, gitignored
├── package.json
└── README.md
```

## Getting started

```bash
npm install

# Development: API on :8787, Vite on :5173
npm run dev

# Production build and local server
npm run build
npm start        # http://127.0.0.1:8787
```

If you have a local SQLite file from an older schema, reset it before starting:

```bash
npm run db:reset
```

## Verification

```bash
npm run check:data
npm run check:questions
npm test
npm run typecheck
npm run build
```

The current build passes (main JS 112.22 KB gzip; lazy 3D chunk 164.56 KB gzip; CSS 10.96 KB gzip):

- 17 API tests
- Question coverage checks (2 published questions)
- TypeScript type checking
- Vite production build
- A basic API/frontend smoke test
- Headless browser checks for timeline switching, 3D scenes, calculators, quiz, and annotations

## Current status

- [x] Frontend/backend directory structure
- [x] Vite + React frontend scaffold
- [x] Express routes, repositories, and database layers
- [x] M1 schema: periods, timeline nodes, lenses, events, questions, AI modules, generic annotations
- [x] Seed upsert that preserves annotations
- [x] Timeline, period, node, lens, question, AI module, model, and search APIs
- [ ] Schema migrations
- [x] M1 UI: time matrix, period pages, lenses, machine pages, question pages, lab
- [x] 3D: ENIAC/H100/Babbage exhibits + datapath and memory scenes
- [x] Three calculators and GPU module UI
- [x] Responsive layout and headless browser interaction checks
- [x] Editorial layer: About page and period/machine narrative
- [x] Expanded prose: 5-paragraph periods, 4–5-paragraph machines, 5-section Q1/Q3, 4-section GPU module
- [x] One master timeline: 4 periods × 3 lanes, with 78 nodes
- [x] Ten derived chapter lenses (7 classic + 3 frontier) from the architecture-design reference
- [x] Lab page merging three calculators and the GPU module
- [x] Pre-electronic foundations (1642–1936) and generation tags (tube/transistor/IC/VLSI)

## Routes

- `/` — the only master timeline: 4 periods, hardware/software/algorithm lanes, node inspector, frontier branch
- `/period/:slug` (and `/era/:slug` alias) — period narrative, nodes, machines, events
- `/lenses` and `/lenses/:slug` — ten derived chapter lenses (7 classic + 3 frontier)
- `/questions` and `/questions/:slug` — seven-question map, Q1/Q3 answers, quiz, related timeline nodes
- `/lab` — CPU/AMAT/Roofline calculators and the GPU module
- `/machine/:slug` and `/entity/:slug` — 3D exhibit, specs, relations, annotations
- `/notes` — favorites and notes stored in SQLite
- `/about` — method, reading paths, five-layer standard, sources and scope

3D scenes are procedural Three.js builds: ENIAC tube cabinets, an H100 accelerator card, a Babbage analytical-engine workbench, a Pascal adder, a Leibniz stepped-drum calculator, a Jacquard loom, a Hollerith tabulator, a single-cycle/pipeline datapath, and a memory hierarchy. They are explanatory abstractions, not engineering replicas.

## M1 data

`data/seed.json` currently contains:

- 4 periods: mechanical (1642–1936), electronic-early (1936–1971), pc-web (1971–2005), heterogeneous (2005–now)
- 78 timeline nodes across hardware, software, and algorithm lanes
- 10 chapter lenses: 7 classic + 3 frontier (bio, optical, quantum)
- 20 entities: 6 machines, 10 hardware components, 6 software, 3 principle models, 1 AI concept
- 12 events
- 7 questions (Q1 and Q3 published; the rest planned)
- 1 AI module (GPU)
- 20 RV32I instructions and 7 book chapters

It is a time-first M1 foundation, not final content. Later milestones deepen nodes, machines, and sources rather than adding parallel timelines.

The generated `data/cs-atlas.db` file is local runtime state and is not committed.

## Planning documents

Architecture, data model, API contract, content map, 3D specification, and roadmap are maintained in a local Obsidian vault. The public repository contains the implementation only; the vault is not published as part of this repository.

## License

TBD.
