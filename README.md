# ClassFlow — Smart Classroom & Resource Scheduling System

ClassFlow is a desktop application designed for colleges and higher education institutions to manage classrooms, faculty teaching assignments, curriculum subjects, and weekly timetables while preventing double-booking and scheduling conflicts.

Built with **Electron**, **React**, **TypeScript**, and **Prisma ORM** powered by **PostgreSQL** (with native support for Neon cloud PostgreSQL or local Docker instances).

---

## Architecture Diagram

```mermaid
flowchart TD
    subgraph RendererProcess["Renderer Process (Untrusted UI)"]
        UI["React 18 UI / TypeScript"]
        COMP["Pages & Components<br/>(Overview, Timetable, Rooms, Faculty, Subjects, Reports, Settings)"]
        UI --> COMP
    end

    subgraph PreloadLayer["Preload Bridge (contextBridge)"]
        API["window.classflowAPI<br/>(Strictly Typed IPC Invokers)"]
    end

    subgraph MainProcess["Electron Main Process (Trusted Privileged Runtime)"]
        IPC["Validated IPC Handlers<br/>(Input Sanitization & Error Masking)"]
        SERVICES["Application Services Layer"]
        CONFLICT["Conflict Detector Engine<br/>(Interval Overlap & Capacity Rules)"]
        REPO["Repository Data-Access Layer"]
        FS["Native Dialogs & CSV Export<br/>(Formula Injection Protection)"]
    end

    subgraph DatabaseLayer["Persistent Storage"]
        PRISMA["Prisma Client ORM<br/>(Connection Pooling & Transactions)"]
        POSTGRES[("PostgreSQL Database<br/>(Neon Cloud or Local Docker)")]
    end

    COMP -->|"Typed Invocations"| API
    API -->|"ipcRenderer.invoke()"| IPC
    IPC --> SERVICES
    SERVICES --> CONFLICT
    SERVICES --> REPO
    SERVICES --> FS
    REPO --> PRISMA
    PRISMA -->|"Parameterized SQL"| POSTGRES
```

---

## Process Responsibilities & Security Model

| Process | Environment | Responsibilities & Boundaries |
| :--- | :--- | :--- |
| **Renderer** | Browser / React | • Renders pages, tables, forms, and timetable grid.<br/>• Collects user input and displays real-time validation warnings.<br/>• **Never** imports Prisma or Node.js filesystem modules.<br/>• Has zero direct knowledge of PostgreSQL credentials or connection URLs. |
| **Preload Bridge** | Isolated Bridge | • Exposes a narrow, typed `window.classflowAPI` via `contextBridge.exposeInMainWorld`.<br/>• Uses `ipcRenderer.invoke()` with predefined channels only.<br/>• Node integration is disabled; Context isolation is enabled. |
| **Main Process** | Node.js / Electron | • Coordinates application lifecycle and browser window creation.<br/>• Holds privileged `PrismaClient` connection pool.<br/>• Validates all inputs using Zod schemas before touching the database.<br/>• Serializes concurrent timetable bookings inside Prisma `$transaction` blocks.<br/>• Handles native file save dialogs and spreadsheet formula injection sanitization. |

---

## Database Architecture & Prisma Schema

ClassFlow uses **PostgreSQL** as its single, authoritative database managed through **Prisma ORM**.

### Entity Relationship Model

```text
┌─────────────────┐             ┌─────────────────────────┐             ┌──────────────────┐
│    Classroom    │ 1         * │        Schedule         │ *         1 │     Subject      │
├─────────────────┤─────────────┼─────────────────────────┼─────────────┼──────────────────┤
│ id (PK)         │             │ id (PK)                 │             │ id (PK)          │
│ code (Unique)   │             │ subjectId (FK)          │             │ code (Unique)    │
│ name            │             │ facultyId (FK)          │             │ name             │
│ building        │             │ classroomId (FK)        │             │ department       │
│ capacity        │             │ dayOfWeek (Enum/String) │             │ semester         │
│ roomType        │             │ startTime (HH:mm)       │             │ defaultStudents  │
│ equipment (JSON)│             │ endTime (HH:mm)         │             │ requiredEquipment│
│ isActive        │             │ expectedStudents        │             │ isActive         │
└─────────────────┘             │ notes                   │             └──────────────────┘
                                └─────────────────────────┘
                                             *
                                             │ 1
                                ┌─────────────────────────┐
                                │         Faculty         │
                                ├─────────────────────────┤
                                │ id (PK)                 │
                                │ employeeCode (Unique)   │
                                │ fullName                │
                                │ department              │
                                │ email                   │
                                │ phone                   │
                                │ designation             │
                                │ isActive                │
                                └─────────────────────────┘
```

---

## Conflict Detection Engine

The core scheduling engine (`src/main/services/conflictDetector.ts`) uses deterministic interval math to eliminate scheduling races and double-bookings.

### Overlap Condition

Two time slots $[A_{start}, A_{end})$ and $[B_{start}, B_{end})$ on the same day overlap if and only if:

$$\text{existingStart} < \text{requestedEnd} \quad \text{AND} \quad \text{requestedStart} < \text{existingEnd}$$

#### Truth Table Examples
- **10:00–11:00 and 11:00–12:00**: Allowed (Back-to-back classes; $11:00 < 11:00$ is false).
- **10:00–11:30 and 11:00–12:00**: Conflict rejected (Overlaps by 30 minutes).
- **09:00–12:00 and 10:00–11:00**: Conflict rejected (Contained interval).
- **Same faculty teaching in different rooms at overlapping times**: Conflict rejected (`FACULTY_CONFLICT`).
- **Same room booked for different subjects at overlapping times**: Conflict rejected (`ROOM_CONFLICT`).
- **Editing existing schedule without altering times**: Allowed (The schedule's own ID is excluded from conflict checks).

### Capacity and Equipment Rules
1. **Capacity Validation**: If expected attendance exceeds classroom capacity, a `CAPACITY_WARNING` is raised. The administrator must explicitly confirm an override to save the record.
2. **Equipment Compatibility**: Compares `subject.requiredEquipment` against `classroom.equipment`. Warns if projector, audio, or lab workstations are missing.

---

## Setup & Prerequisites

### 1. Requirements
- Node.js 20+ or 22+ (verified on Node v24.22.0)
- npm 10+
- PostgreSQL database instance (Neon cloud or local Docker)

### 2. Environment Configuration
Copy the sample environment file:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL connection URL:

```dotenv
# Option A: Neon Cloud PostgreSQL (Recommended)
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-example-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Option B: Local PostgreSQL (via Docker)
# docker run --name classflow-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=classflow -p 5432:5432 -d postgres
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/classflow?schema=public"
```

---

## Database Migrations & Seeding

1. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

2. **Apply Migrations to PostgreSQL**:
   ```bash
   npx prisma migrate deploy
   ```
   *(Or `npx prisma db push` during rapid prototyping).*

3. **Populate Academic Demo Dataset**:
   ```bash
   npm run prisma:seed
   ```
   *(Or click "Load Sample Data" directly from within the application's Overview or Settings page).*

---

## Development & Testing Commands

| Command | Action |
| :--- | :--- |
| `npm run start` | Launches ClassFlow in Electron development mode with Vite hot-reload |
| `npm test` | Runs the Vitest test suite (interval overlap, conflict detector, CSV injection, Zod) |
| `npm run typecheck` | Validates TypeScript types across the entire project |
| `npm run package` | Packages the desktop application binary into `out/ClassFlow-darwin-arm64` |
| `npm run make` | Generates the distribution archive (`.zip`) in `out/make` |

---

## CSV Export Security

Spreadsheet formula injection (CSV Injection) is prevented in `src/main/utils/csvExport.ts`:
- Any cell value starting with `=`, `+`, `-`, `@`, `\t`, or `\r` is automatically prepended with a single quote (`'`).
- All fields are quoted according to RFC 4180 with internal double-quotes escaped as `""`.

---

## Packaging

### macOS Packaging (Apple Silicon / Intel)
```bash
npm run package
npm run make
```
The output distributable is created at:
```text
out/make/zip/darwin/arm64/ClassFlow-darwin-arm64-1.0.0.zip
```

### Windows Packaging Considerations
To package for Windows:
1. Electron Forge includes Windows target support in `forge.config.ts`.
2. Install `@electron-forge/maker-squirrel` or zip maker.
3. Run `npm run make -- --platform=win32`.
4. Ensure code signing certificates are configured for production Windows Defender SmartScreen compliance.

---

## Production Security Notes

For production campus-wide deployment with multiple concurrent administrators:
1. **Never distribute database credentials** within client desktop bundles.
2. The service layer is architected with clean separation so that a future stateless REST / GraphQL backend API can host `PrismaClient` while the desktop Electron client authenticates administrators via OAuth2 / JWT.
