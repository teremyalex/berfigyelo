This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api - reference/cli/create - next - app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto - updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building - your - application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

 -  [Next.js Documentation](https://nextjs.org/docs)  -  learn about Next.js features and API.
 -  [Learn Next.js](https://nextjs.org/learn)  -  an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js)  -  your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default - template&filter=next.js&utm_source=create - next - app&utm_campaign=create - next - app - readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building - your - application/deploying) for more details.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api - reference/cli/create - next - app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto - updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building - your - application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

 -  [Next.js Documentation](https://nextjs.org/docs)  -  learn about Next.js features and API.
 -  [Learn Next.js](https://nextjs.org/learn)  -  an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js)  -  your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default - template&filter=next.js&utm_source=create - next - app&utm_campaign=create - next - app - readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building - your - application/deploying) for more details.

---

## IP alapú rate limit middleware az API végpontokra

A projekt gyökerébe került egy `middleware.ts`, amely IP cím alapján korlátozza az `/api/*` kéréseket.

- Ablak: 60 másodperc
- Limit: 20 kérés / IP / ablak
- Válasz, ha túlléped: HTTP 429 Too Many Requests + `Retry-After`, `X-RateLimit-*` headerek

Fejlécek és IP feloldás:
- Először a `req.ip`-et használja, majd az `x-forwarded-for`, végül az `x-real-ip` fejléceket.

Fejlesztői környezetben:
- Ha nem production módban fut (NODE_ENV !== 'production'), a lokális/belső IP-k mentesülnek a limit alól.

Fontos megjegyzés:
- A megvalósítás memória-alapú (in-memory) és példányonkénti. Serverless/Edge környezetben az állapot nem osztott a példányok között és cold start esetén kiürülhet.
- Ha globális, tartós limitre van szükség, célszerű Upstash Redis vagy más közös adattár használata.

Testelés
- Indítsd a fejlesztői szervert, majd küldj egymás után >20 kérést ugyanarról az IP-ről valamelyik `/api/*` végpontra. A 21. kérésre 429 státusszal kell válaszolnia.
