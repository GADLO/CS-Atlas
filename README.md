# CS Atlas · Computer Systems Atlas

> A time-based, explorable atlas of computer hardware: from vacuum-tube cabinets to AI accelerators, explained through a timeline, 3D exhibits, and interactive models.

**Status: structural scaffold / M0–M1 WIP.** The frontend/backend layout, API layering, and build pipeline are in place. Business pages and production content will be added during the M1 vertical slice.

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
│   │   ├── repositories/      # entities, content, annotations, meta
│   │   ├── routes/            # meta, entities, content, annotations
│   │   ├── lib/http.js
│   │   ├── validation/seed.js
│   │   └── seed.js
│   └── test/
├── data/
│   ├── seed.json              # development placeholder, replaced in M1
│   └── README.md
├── scripts/check-data.js
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

## Verification

```bash
npm run check:data
npm test
npm run typecheck
npm run build
```

The scaffold currently passes:

- 10 API tests
- TypeScript type checking
- Vite production build
- A basic API/frontend smoke test

## Current status

- [x] Frontend/backend directory structure
- [x] Vite + React frontend scaffold
- [x] Express routes, repositories, and database layers
- [x] Development seed for local startup and tests
- [x] API tests and production build
- [ ] Data-layer hardening: migrations, seed upsert, generic annotations
- [ ] M1: three eras, six machines, ENIAC/H100 exhibits, Q1/Q3, GPU module, three calculators

## Development data

`data/seed.json` is a **development placeholder** (3 entities, 20 instructions, 7 chapters). It exists only to validate the schema, API, and build pipeline. It is not final historical content and will be replaced during M1.

The generated `data/cs-atlas.db` file is local runtime state and is not committed.

## Planning documents

Architecture, data model, API contract, content map, 3D specification, and roadmap are maintained in a local Obsidian vault. The public repository contains the implementation only; the vault is not published as part of this repository.

## License

TBD.
