# AI Finance Web App

Next.js (App Router) frontend for AI Finance & Accounting.

## Getting Started

### Install Dependencies

```bash
cd web
npm install
```

### Configure Environment

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
web/
├── src/
│   ├── app/
│   │   ├── globals.css      # Global styles with Tailwind
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Add Transaction page
│   └── components/
│       └── TransactionForm.tsx  # Transaction form component
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Features

- TypeScript for type safety
- Tailwind CSS for styling
- React Hook Form state management
- Clean, centered UI design
- Responsive layout

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React useState
