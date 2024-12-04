```markdown
# Commons Claimer Frontend

This repository hosts the frontend for the **Commons Protocol Claimer**. Follow the steps below to set up, develop, and build the project.

---

## Prerequisites

Before starting, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version >= 16)
- [pnpm](https://pnpm.io/) (preferred package manager)
- A `.env.local` configuration file (see [Environment Variables](#environment-variables)).

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/commons-claimer-frontend.git
cd commons-claimer-frontend
```

### 2. Install Dependencies
Use `pnpm` to install all required dependencies:
```bash
pnpm install
```

### 3. Set Up Environment Variables
Copy the example environment file and configure it:
```bash
cp .env.example .env.local
```
Customize `.env.local` with your specific settings.

---

## Development

### Run Locally
Start the development server:
```bash
pnpm dev
```
Visit the application at [http://localhost:3000](http://localhost:3000).

---

## Build for Production

To build the application for deployment:
```bash
pnpm build
```
The production-ready files will be in the `dist` folder.

---

## Environment Variables

| Variable         | Description                     | Default Value           |
|-------------------|---------------------------------|-------------------------|
| `API_URL`         | Base URL for the backend API    | `http://localhost:4000` |
| `NEXT_PUBLIC_ENV` | Current environment (dev/prod)  | `development`           |

---
