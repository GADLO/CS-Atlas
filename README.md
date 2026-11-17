# CS Atlas · Computer Systems Atlas

> A time-based, explorable atlas of computer hardware: from vacuum-tube cabinets to AI accelerators, explained through a timeline, 3D exhibits, and interactive models.

**Status: M1 data foundation / vertical slice WIP.** The frontend/backend layout, database schema, timeline/questions APIs, and build pipeline are in place. UI pages and 3D exhibits are the next step.

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

The current data foundation passes:

- 15 API tests
- Question coverage checks (2 published questions)
- TypeScript type checking
- Vite production build
- A basic API/frontend smoke test

## Current status

- [x] Frontend/backend directory structure
- [x] Vite + React frontend scaffold
- [x] Express routes, repositories, and database layers
- [x] M1 schema: eras, events, questions, AI modules, generic annotations
- [x] Seed upsert that preserves annotations
- [x] Timeline, era, question, AI module, model, and search APIs
- [ ] Schema migrations
- [ ] M1 UI: timeline, era pages, machine pages, question pages
- [ ] 3D: ENIAC/H100 exhibits + datapath concept scene
- [ ] Three calculators and GPU module UI

## M1 data

`data/seed.json` currently contains:

- 3 eras: stored-program, PC/RISC, AI/heterogeneous
- 20 entities: 6 machines, 10 hardware components, 6 software, 3 principle models, 1 AI concept
- 7 events
- 7 questions (Q1 and Q3 published; the rest planned)
- 1 AI module (GPU)
- 20 RV32I instructions and 7 book chapters

It is a real M1 data foundation, not final V1 content. M2 expands to 9 eras and 18 machines.

The generated `data/cs-atlas.db` file is local runtime state and is not committed.

## Planning documents

Architecture, data model, API contract, content map, 3D specification, and roadmap are maintained in a local Obsidian vault. The public repository contains the implementation only; the vault is not published as part of this repository.

## License

TBD.
