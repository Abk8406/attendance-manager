# Attendance Manager (Angular + json-server)

A small attendance management demo built with Angular and json-server. It shows employees in a monthly grid, lets you mark absences and edit hours, and exports to Excel. A loading spinner is shown during HTTP calls.

## Prerequisites
- Node.js 18+
- npm 9+

## Install
```bash
npm install
```

## Run (Angular dev server + API together)
```bash
npm start
```
- Angular app: `http://localhost:4200`
- JSON API (json-server): `http://localhost:3001`

Scripts (see `package.json`):
- `npm run api` – run only the json-server
- `ng serve` – run only the Angular app
- `npm run dev` – run both concurrently

## Data source
- All mock data lives in `db.json` and is served by json-server.
- Employees endpoint: `GET http://localhost:3001/employees`
- Attendance submissions: `POST http://localhost:3001/attendance`

## Core features
- Loading spinner while fetching employees
- Editable attendance grid for days 15–31
- Absent toggle per day; absent disables the hour input
- Totals per employee row and global totals
- Export current table to Excel

## Time input rules (HH:mm)
- Only digits and navigation keys are accepted
- Auto-normalization on blur
- Clamped to a hard maximum of `23:59`
- Pattern validation: `^([01]\d|2[0-3]):[0-5]\d$`
- Tooltip hints the format

## Save semantics (snapshotted summaries)
- Table edits are immediate in the grid
- The header/plant summaries update only when you click Save
- Save also logs the full payload to the browser console

## Plant summaries
- The UI shows three plants: `LBR - S Plant`, `OUD Plant (LBP)`, `LSS14`
- LBR totals come from the actual form values
- OUD/LSS14 totals are currently derived from static employee counts (configurable in the component) until `employees` in `db.json` include a `plant` field
- To make all plants fully data‑driven, add a `plant` property to each employee in `db.json` (e.g., `"plant": "OUD Plant (LBP)"`) and group by plant in the component

## Useful files
- Angular component: `src/app/attendance/attendance-table/attendance-table.component.*`
- API service: `src/app/core/api.service.ts`
- Employee model: `src/app/models/employee.ts`
- Mock data: `db.json`

## Troubleshooting
- API not reachable
  - Ensure `npm start` is running (json-server binds to `:3001`)
  - Another program on port 3001? Change the port in `package.json` script `api`
- Spinner never hides
  - Check the browser console/network; verify `GET /employees` returns 200
- Time input feels restrictive
  - Only digits are allowed; paste with invalid characters is normalized on blur

## Notes
- This project targets Angular 17; see `package.json` for exact versions
- The code is optimized for clarity and demo purposes
