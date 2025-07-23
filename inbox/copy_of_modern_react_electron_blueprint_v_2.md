## 1. ML Logging & Visualization

- **TensorBoard**
  - **Need Met**: Real-time visualization and debugging of PyTorch experiments (scalars, histograms, graphs, embeddings).
  - **Why It Matters**: Surface training dynamics, spot anomalies, and compare runs without manual plotting.
  - **What It Does**:
    - Uses `torch.utils.tensorboard.SummaryWriter` to log events to disk.
    - Hosts a local web UI (`tensorboard --logdir runs/`) displaying:
      - **Scalars**: loss, accuracy trends over time.
      - **Histograms**: weight/activation distributions per step.
      - **Graphs**: network architecture diagrams.
      - **Embeddings**: interactive high-dimensional data views.
      - **Media**: images, text, audio annotations.

## 2. Monorepo & Workspace Structure

- **pnpm / Yarn / npm Workspaces**

  - **Need Met**: Co-locate multiple packages (UI components, web app, Electron shell) in one repo.
  - **Why It Matters**: Simplifies dependency sharing, version consistency, and code reuse across projects.
  - **What It Does**:
    - Root `package.json` specifies:
      ```jsonc
      "workspaces": ["packages/*", "apps/*"]
      ```
    - Packages are symlinked locally; shared deps are hoisted for efficient installs.
    - VSCode detects workspaces, enabling cross-package IntelliSense and refactoring.

- **Turborepo / Nx**

  - **Need Met**: Fast, scalable task orchestration, caching, and dependency graph analysis.
  - **Why It Matters**: Reduces build/test times by only running tasks in affected projects, both locally and in CI.
  - **What It Does**:
    - Defines tasks (`build`, `lint`, `test`) in `turbo.json` or `nx.json`.
    - Executes tasks in parallel or in order based on project graph.
    - Caches outputs (locally or remotely) to skip redundant work.

## 3. Bundling & Build Tools

- **Vite**

  - **Need Met**: Ultra-fast dev server and optimized production bundles.
  - **Why It Matters**: Provides near-instant HMR and efficient builds for large React/TypeScript projects.
  - **What It Does**:
    - **Dev**: Serves code via native ES modules with HMR over WebSocket.
    - **Build**: Leverages Rollup for tree-shaking, code-splitting, minification, and asset hashing.

- **tsup / Rollup**

  - **Need Met**: Bundle shared libraries (`packages/ui`) for multiple targets (ESM, CJS).
  - **Why It Matters**: Ensures your component library is consumable by both web and Electron builds.
  - **What It Does**:
    - **tsup**: Zero-config wrapper around esbuild supporting TS, declarations, minification, and multiple formats.
    - **Rollup**: Configurable bundler with plugins for advanced transforms and output control.

## 4. Reverse Proxy & Static Hosting (Nginx)

- **Capabilities**:

  - High-performance static file serving (gzip, Brotli, HTTP/2).
  - TLS termination via Let’s Encrypt + Certbot.
  - Reverse-proxy API (`/api/`) and auth endpoints to backend.
  - Caching, security (rate-limits, IP filters), and zero-downtime reloads.

- **Example Nginx vhost**:

  ```nginx
  server {
    listen 80;
    server_name internal.example.com;

    root /var/www/myapp;
    index index.html;

    # Protect with auth_request
    location / {
      auth_request /auth;
      try_files $uri /index.html;
    }
    location /api/ {
      auth_request /auth;
      proxy_pass http://127.0.0.1:8000;
    }
    location = /auth {
      internal;
      proxy_pass http://127.0.0.1:8080/realms/app/protocol/openid-connect/token/introspect;
      proxy_set_header Authorization "Bearer $http_authorization";
    }

    gzip on;
    gzip_types text/plain application/javascript text/css application/json;
    location ~* \.(?:js|css|png|jpg|jpeg|svg|gif)$ {
      expires 30d;
      add_header Cache-Control "public";
    }
  }
  ```

## 5. Authentication & Access Control

- **Keycloak**

  - **Need Met**: Enterprise-grade IdP with per-user credentials, roles, and 2FA (TOTP + QR).
  - **Why It Matters**: Offers secure login flows, token issuance (OIDC/OAuth2), and future extensibility (SSO, SAML, LDAP).
  - **What It Does**:
    - Runs as a container or VM, backed by Postgres for user storage.
    - Admin UI to define realms, clients (your apps), users, and enable TOTP.
    - Issues JWTs or session cookies, validated by Nginx or in-app adapters.
    - **Client-side Integration**: Use the `keycloak-js` adapter or `@react-keycloak/web` in your React/Electron app to handle login flows, token refreshing, and automatically attach `Authorization` headers to API calls.

- **Authelia (MVP Alternative)**

  - **Need Met**: Simple flat-file + shared TOTP gateway for quick 2FA protection.
  - **Why It Matters**: Minimal setup for a single shared 2FA experience without a full Identity Provider.
  - **What It Does**:
    - Stores credentials in a flat YAML file (`users_database.yml`) with Argon2-hashed passwords and a shared TOTP secret.
    - Serves a login form with TOTP verification and integrates with Nginx via the `auth_request` module.
  - **Deployment**: Run via Docker Compose:
    ```yaml
    services:
      authelia:
        image: authelia/authelia
        volumes:
          - ./authelia/config:/config
        ports:
          - 9091:9091
    ```

## 6. Client State Management

*Your UI will separate local/transient state (Zustand) from server state (TanStack Query/SWR).*

- **Zustand**
  - **Need Met**: Simplify local and global state in React without boilerplate or performance pitfalls.
  - **Why It Matters**: UIs need both ephemeral state (e.g. form inputs) and shared app state (e.g. user sessions); Zustand offers a minimal API and selective subscriptions for efficient renders.
  - **What It Does**:
    - Defines stores via `create` and exposes hooks (e.g. `useStore`) for subscribing to and updating state.
    - Components subscribe to specific slices of state, re-rendering only when those slices change.
    - Supports middleware for logging, persistence (e.g. localStorage), and integration with Redux DevTools.

## 7. Server Data Fetching & Caching

- **TanStack Query**

  - **Need Met**: Declarative fetching, caching, and syncing of API data.
  - **Why It Matters**: Eliminates repetitive loading/error logic, reduces network calls, and keeps UI state in sync.
  - **What It Does**:
    - Hooks (`useQuery`, `useMutation`) with query keys for cache management.
    - Background refetch on focus, reconnect, custom intervals; pagination/infinite queries; optimistic updates.
    - Devtools for inspecting cache and query lifecycles.

- **SWR**

  - **Need Met**: Lightweight hook for stale-while-revalidate data fetching with minimal config.
  - **Why It Matters**: When bundle size and simplicity are priorities over advanced features.
  - **What It Does**:
    - `useSWR(key, fetcher)`: returns `{ data, error, isValidating }`.
    - Auto revalidation on focus/network; middleware for pagination, retry; \~3KB gzipped.

## 8. Routing

- **React Router v6**

  - Declarative client-side routing (`<Routes>`, `<Route>`), nested layouts, dynamic paths, code splitting, and data APIs (`useLoaderData`).

- **Next.js**

  - File-based `pages/` or `app/` routing with SSR, SSG, ISR, API routes, image optimization, and built-in configs.

- **Remix**

  - Nested routing with loaders/actions, progressive enhancement, form handling, and HTTP cache-control for resilient full-stack apps.

## 9. Styling

- **Tailwind CSS v3**: utility-first styling with `tailwind.config.js` at root; purge unused styles in builds; VSCode IntelliSense plugin.
- **shadcn/ui**: headless, accessible UI components built on Tailwind primitives.
- **CSS Modules** / **Styled Components**: scoped or CSS-in-JS alternatives if preferred.

## 10. Component & Visualization Libraries

- **React Flow**

  - **Need Met**: Build interactive, draggable node-based diagrams and workflow editors (e.g., data pipelines, decision trees).
  - **Why It Matters**: Custom graph UIs require pan/zoom, drag connectors, and dynamic layouts—React Flow provides these out of the box.
  - **What It Does**:
    - Renders nodes and edges as React components with coordinate transforms.
    - Manages interaction handlers for dragging nodes, creating connections, selecting, and keyboard shortcuts.
    - Extensible with minimap, controls, backgrounds, and custom node types.

- **@visx/heatmap**

  - **Need Met**: Create highly customizable heatmaps for data density visualization.
  - **Why It Matters**: Low-level primitives offer fine-grained control over scales, colors, and layout, essential for tailored data displays.
  - **What It Does**:
    - Provides D3-based building blocks for rendering heatmap cells in SVG or Canvas.
    - Exposes scale functions (band, linear) for mapping data to position and color.
    - Supports annotations, axes, and tooltip integration.

- **Recharts**

  - **Need Met**: Rapidly compose common charts (bar, line, pie, area) with minimal configuration.
  - **Why It Matters**: Declarative chart components simplify binding data to visuals, saving development time.
  - **What It Does**:
    - Offers `<LineChart>`, `<BarChart>`, `<PieChart>`, etc., with props for data, colors, and axes.
    - Supports responsive containers, animations, and legends.
    - Allows custom components for advanced styling or event handling.

- **Framer Motion**

  - **Need Met**: Add fluid, declarative animations and gestures to React components.
  - **Why It Matters**: Smooth transitions and interactive feedback enhance usability and perceived performance.
  - **What It Does**:
    - Provides `motion` versions of HTML and SVG elements (`motion.div`, `<motion.svg>`).
    - Supports animations via props (`initial`, `animate`, `exit`) and variants.
    - Enables drag, hover, tap interactions, and layout animations without manual CSS.

## 11. Testing & Documentation

- **Vitest**: fast Vite-native unit tester.
- **@testing-library/react**: DOM-based component testing.
- **Storybook**: isolated component development, documentation, and visual QA.

## 12. Linting, Formatting & CSS Framework

- **ESLint**

  - **Need Met**: Automatically detect and enforce code quality and style rules in JavaScript/TypeScript projects.
  - **Why It Matters**: Prevents bugs, enforces consistency, and provides early feedback in the editor and CI pipelines.
  - **What It Does**:
    - Parses source files into an abstract syntax tree (AST) to apply linting rules (unused variables, unreachable code, stylistic issues).
    - Allows custom rule sets and community plugins (e.g., `eslint-plugin-react`, `@typescript-eslint`).
    - Can auto-fix certain errors (`eslint --fix`) and integrate with VSCode for inline highlighting.

- **Prettier**

  - **Need Met**: Enforces a consistent code style automatically.
  - **Why It Matters**: Removes bike-shedding about formatting; ensures uniform code across developers.
  - **What It Does**:
    - Reformats code (indentation, line breaks, quotes) according to opinionated rules.
    - Integrates with ESLint or runs as a separate step (pre-commit hook via `husky` + `lint-staged`).

- **Tailwind CSS v3**

  - **Need Met**: Provides utility-first CSS classes for rapid UI development without writing custom CSS.
  - **Why It Matters**: Speeds up styling by composing utilities, eliminates naming clashes, and ensures consistency.
  - **What It Does**:
    - You add `@tailwind base; @tailwind components; @tailwind utilities;` to your main CSS.
    - `tailwind.config.js` lets you customize themes, colors, and purge unused styles in production.

## 13. Deployment & Hosting

### 13.1 Web App Hosting on DigitalOcean

1. **App Platform**: GitHub-connected, auto-build/deploy, built-in SSL/CDN, minimal ops.
2. **Droplet + Nginx**: SSH, build, copy `dist/` to `/var/www/myapp`, reload Nginx (Section 4), manage TLS via Certbot.

> No Netlify, Vercel, or AWS required—standardized on DO resources.

### 13.2 Electron App Distribution

- **electron-builder**: generates DMG (macOS), MSI (Windows), AppImage (Linux) installers via `npm run build:electron`.

## 14. CI/CD & Commands

Your `package.json` includes scripts for local dev, builds, and packaging. Here’s a **GitHub Actions** workflow for both App Platform and Droplet deploys:

```yaml
name: CI
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install Dependencies
        run: npm ci
      - name: Lint & Test
        run: npm run lint && npm test
      - name: Build Web
        run: npm run build:web
      - name: Build Electron
        run: npm run build:electron
      - name: Deploy to DO App Platform
        uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      - name: Update App
        run: doctl app update ${{ secrets.DO_APP_ID }} --spec .do/app.yaml

  droplet-deploy:
    needs: build-and-deploy
    runs-on: ubuntu-latest
    if: ${{ always() }}
    steps:
      - uses: actions/checkout@v3
      - name: Copy build to Droplet
        uses: appleboy/scp-action@v0.1.2
        with:
          host: ${{ secrets.DO_HOST }}
          username: ${{ secrets.DO_USER }}
          key: ${{ secrets.DO_SSH_KEY }}
          source: "dist/**"
          target: "/var/www/myapp"
      - name: Reload Nginx
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.DO_HOST }}
          username: ${{ secrets.DO_USER }}
          key: ${{ secrets.DO_SSH_KEY }}
          script: sudo systemctl reload nginx
```

- **Env & Secrets**: Store DO tokens, SSH keys, JWT secrets, and DB URLs in GitHub Secrets or DO App Secrets—not in code.
- **Docker Secrets**: Mount Authelia or Keycloak credentials and TOTP secrets as Docker secrets or environment variables.

## 15. Observability, Error Handling & Accessibility

- **Error Boundaries**: Wrap critical UI sections with React `<ErrorBoundary>`, log to Sentry or console and display fallback UI.
- **Global Loading UI**: Use React context or Zustand state to show a top-level spinner during data loads or route changes.
- **Monitoring**:
  - **Sentry**: capture and track front-end exceptions and performance metrics.
  - **Web Vitals**: use the `web-vitals` package to report LCP, FID, and CLS.
- **Accessibility**:
  - Use `eslint-plugin-jsx-a11y` and ensure shadcn/ui components follow ARIA guidelines.
  - Consider integrating **react-aria** for robust accessibility primitives.
- **Internationalization**: plan for `react-intl` or `next-i18next` to handle multiple languages gracefully.

## 16. UI Layout & Advanced Visualization Patterns

- **Pane-Based Layout**: Use CSS Grid or Flexbox with libraries like `react-grid-layout` or `react-mosaic-component` for resizable, draggable panes:

  ```jsx
  <div className="grid grid-cols-4 h-screen">
    <aside className="col-span-1">Filters & Navigation</aside>
    <main className="col-span-3 grid grid-rows-6 gap-2 p-2">
      {/* row 1: summary metrics */}
      {/* rows 2–5: chart grid */}
      {/* row 6: alerts & logs */}
    </main>
  </div>
  ```

- **Popout & Dockable Panels**:

  - **GoldenLayout**: supports floating, docking, tabbing panels with plugin ecosystem.
  - **react-mosaic-component**: React-only split-view with drag-to-resize tiles.
  - **React Rnd** or **PhosphorJS**: build custom floating windows.

- **Live Plotting & Streaming Charts**:

  - **react-vega** / **Vega-Lite**: declarative JSON specs with streaming data support.
  - **VisX** (`@visx/xychart`): low-level API for real-time plots.
  - **Recharts**: throttle updates (50–100 ms) for simple real-time charts.

- **Sankey Diagrams & Flow Charts**:

  - **@nivo/sankey** or **d3-sankey** via VisX or `react-d3-graph`.
  - **React Flow**: interactive node-link workflows (already listed).

- **Future-Path Grids & Network Visualizations**:

  - **deck.gl** scatterplot or **react-three-fiber** for WebGL graphs.
  - **AG-Grid** with custom cell renderers for state matrices.

- **Grids of Cells & Data Tables**:

  - **AG-Grid Community**: virtualized rows/columns, real-time updates via `api.applyTransaction` or `api.setRowData()`, `valueFormatter`, `cellRenderer`, `cellClassRules`.
  - **TanStack Table** + **react-window**: headless table + virtualization for lighter installs.

- **Overlaid Annotations & Alerts**:

  - **react-annotation** or **react-popper**/**Tippy.js**: attach callouts/tooltips to DOM/SVG elements.
  - Absolute-position `<div>` overlays using Tailwind `absolute` classes.

- **Performance Tips**:

  - Batch & throttle updates with `requestAnimationFrame` or `lodash.throttle`.
  - Offload heavy calculations or graph layouts to Web Workers via `postMessage`.

*This blueprint now fully restores all detailed content and ensures correctness across sections.*

