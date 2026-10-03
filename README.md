# Electricity Bill Calculator

A small, mobile-first web app that calculates a domestic electricity bill from a
meter reading and shares it as an image — built for billing tenants over WhatsApp.

Live: https://electricity-bill-calculator.pknspace.com

## Features

- Slab-based bill: energy charge, fixed charge, duty, cess and fuel adjustment.
- Shares the bill as a PNG through the native share sheet (WhatsApp included).
- A separate "tenant bill" with only the energy and fixed charges.
- English and Hindi.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui

No backend and no dependencies at runtime — `npm run build` emits a static
`dist/` that any file server can host.

## Development

```bash
npm install
npm run dev      # https://localhost:5173 and the LAN address
```

The dev server runs over HTTPS via `@vitejs/plugin-basic-ssl` and binds to all
interfaces, so you can open it on a phone at `https://<your-lan-ip>:5173` and test
the real share sheet. The certificate is self-signed — accept the browser warning
once. This affects `npm run dev` only; the production build is unchanged.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | HTTPS dev server on localhost and the LAN |
| `npm run build` | Typecheck and production build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run typecheck` | TypeScript check (`tsc -b`) |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest): slab pricing and bill totals |
| `npm run check` | Typecheck, lint and tests |
| `npm run deploy` | Checks, builds and uploads to the VPS |
| `npm run deploy:dry` | Same, but only previews the upload |

## Deployment

The site is static: `npm run build` writes `dist/`, which is synced to a VPS where
Caddy serves it directly (no restart needed).

1. One-time setup: copy `.env.example` to `.env.prod.local` (git-ignored) and fill in
   `DEPLOY_HOST`, `DEPLOY_PORT` and `DEPLOY_DIR`. You also need SSH key access to the server.
2. Deploy:
   ```bash
   npm run deploy:dry   # preview what would change
   npm run deploy       # checks, build, upload
   ```

## How it works

### How the bill is calculated

```
Total = Energy Charge + Fixed Charge + Duty + Cess + Fuel
```

**Energy charge** uses telescopic slabs — each band is billed at its own rate,
so 250 units is `100 × 4.40 + 100 × 4.50 + 50 × 6.00`, not `250 × 6.00`:

| Slab (units) | ₹ / unit |
| ------------ | -------- |
| 0 – 100      | 4.40     |
| 101 – 200    | 4.50     |
| 201 – 400    | 6.00     |
| 401 – 600    | 7.00     |
| above 600    | 8.80     |

| Component        | Basis                                    |
| ---------------- | ---------------------------------------- |
| **Fixed Charge** | ₹20 per kW of sanctioned load            |
| **Duty**         | ₹0.10 per unit                           |
| **Cess**         | 12% of the energy charge                 |
| **Fuel**         | 10% of the *previous* month's energy charge |

Inputs: units consumed this month, sanctioned load (kW), and previous month's
units (used to derive the fuel adjustment).

### Sharing

Two share buttons render the bill to a PNG on a `<canvas>` and hand it to the
Web Share API, which opens the native share sheet with WhatsApp in it:

- **Share full bill** — every component, total of all five.
- **Share tenant bill** — energy charge and fixed charge only, with a total of
  just those two, for passing on to a tenant who doesn't pay duty, cess or fuel.

The Web Share API requires a **secure context**, so file sharing only works over
HTTPS (or `localhost`). On browsers without it — most desktops — the buttons fall
back to downloading the PNG.
