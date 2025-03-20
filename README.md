This is a LLM-in-Langfuse project created based on [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), using [Next.js](https://nextjs.org) framework.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

Second, after completing your code changes, build and start the production server:

```bash
npm run build
npm run start
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Docker

```bash
docker build -t nextjs-llm-in-langfuse .
docker run -p ${EXTERNAL_PORT}$:3000 --name llm-in-langfuse --detach --restart always nextjs-llm-in-langfuse
```

## About .env file

The contents of the .env file need to be adjusted according to your specific Langfuse project. Create a .env file in the root directory with the following variables:

```
LANGFUSE_PUBLIC_KEY=your_public_key
LANGFUSE_SECRET_KEY=your_secret_key
LANGFUSE_BASE_URL=your_base_url
```

You can obtain these credentials from your Langfuse project dashboard. These environment variables are essential for the application to connect to your Langfuse instance correctly.
