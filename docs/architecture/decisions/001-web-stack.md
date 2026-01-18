# ADR 001: Web App Tech Stack

## Context
We needed to choose a technology stack for the `apps/web` application to serve as both a product landing page and a documentation viewer for the library.

## Decision
We chose the following stack:

1.  **Framework: Next.js (App Router)**
    *   **Why**: Industry standard, excellent static site generation (SSG) for docs, and easy server-side rendering (SSR) for dynamic features like the "random quote" hero.
2.  **Styling: Tailwind CSS v4**
    *   **Why**: v4 is the latest stable version, offering better performance and CSS-variable based configuration which aligns with our "Interstellar" theme requirements.
3.  **Documentation: next-mdx-remote**
    *   **Why**: Allows us to keep documentation in the root `docs/` folder (decoupled from the app) and render it safely.

## Consequences
- **Positive**: High performance, good SEO, modern developer experience.
- **Negative**: Adds a build step (Next.js build) which is heavier than a simple HTML generator, but acceptable given the feature set.
