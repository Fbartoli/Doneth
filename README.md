# Doneth Monorepo

## Overview

This repository contains the Doneth project, a full-stack application built with a modern web and blockchain technology stack. It utilizes a monorepo structure managed by pnpm to handle multiple packages and their dependencies efficiently.

## Monorepo Structure

The project is organized into several packages within the `packages/` directory:

-   `packages/web`: Contains the Next.js frontend application, user interface, and client-side logic.
-   _(Potentially other packages like `packages/contracts` for smart contracts, or `packages/core` for shared business logic may exist or be added here)._

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js**: Version 18.x or higher (LTS recommended). You can use a version manager like [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.
-   **pnpm**: Version 8.x or higher. If you don't have pnpm, you can install it via npm:
    ```bash
    npm install -g pnpm
    ```

## Getting Started

Follow these steps to get the project up and running on your local machine:

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Doneth
```
_(Replace `<your-repository-url>` with the actual URL of your Git repository)._

### 2. Install Dependencies

Install all project dependencies using `pnpm` from the root of the monorepo. This will also link local packages.

```bash
pnpm install
```

## Available Scripts

The following scripts are commonly available and can be run from the root of the monorepo using `pnpm`. Specific package scripts can also be run from their respective directories or by using `pnpm --filter <package-name> <script-name>`.

-   **`pnpm dev`**
    Starts the development server for the relevant package(s) (e.g., the Next.js application in `packages/web`). Check the root `package.json` or individual package `package.json` files for specific dev command configurations.

-   **`pnpm build`**
    Builds all (or specified) packages for production.

-   **`pnpm lint`**
    Lints the codebase across all relevant packages to check for code quality and style issues.

-   **`pnpm test`**
    Runs automated tests for the project.

_(Note: These are common script names. Please refer to the `package.json` files in the root and individual packages for the exact scripts available and their configurations.)_

## Technologies Used

This project leverages a range of modern technologies, including:

-   **Package Manager**: [pnpm](https://pnpm.io/)
-   **Frontend**:
    -   [Next.js](https://nextjs.org/) (App Router)
    -   [React](https://reactjs.org/)
    -   [TypeScript](https://www.typescriptlang.org/)
    -   [Tailwind CSS](https://tailwindcss.com/)
-   **Blockchain & Web3**:
    -   [Wagmi](https://wagmi.sh/) (React Hooks for Ethereum)
    -   [Lens Protocol](https://www.lens.xyz/) (Social graph)
    -   [Ponder](https://ponder.sh/) (Blockchain data indexing)
-   **Database ORM**:
    -   [Prisma](https://www.prisma.io/) (If used for backend services)
-   **State Management**: React Context API, React Query (via Lens Protocol hooks)
-   **Deployment**: (e.g., Vercel, Netlify - specify as applicable)

## Contributing

We welcome contributions to the Doneth project! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'feat: Add some amazing feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a Pull Request.

Please ensure your code adheres to the project's linting rules and includes tests where appropriate.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
_(If you don't have a LICENSE file, you might want to add one. A common choice is the MIT License.)_
