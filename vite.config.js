import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "./",
  plugins: [
    {
      name: "rewrite-middleware",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/admin") {
            res.writeHead(301, { Location: "/admin/" });
            res.end();
            return;
          }
          if (
            req.url &&
            !req.url.includes(".") &&
            req.url !== "/" &&
            req.url !== "/admin/"
          ) {
            req.url += ".html";
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        articles: resolve(__dirname, "articles.html"),
        authors: resolve(__dirname, "authors.html"),
        topics: resolve(__dirname, "topics.html"),
        events: resolve(__dirname, "events.html"),
        game: resolve(__dirname, "game.html"),
        contact: resolve(__dirname, "contact.html"),
        disclaimer: resolve(__dirname, "disclaimer.html"),
        featured: resolve(__dirname, "featured-post.html"),
        post: resolve(__dirname, "post.html"),
        post1: resolve(__dirname, "post-1.html"),
        post2: resolve(__dirname, "post-2.html"),
        post3: resolve(__dirname, "post-3.html"),
        admin: resolve(__dirname, "admin/index.html"),
        admin_articles: resolve(__dirname, "admin/articles.html"),
        admin_authors: resolve(__dirname, "admin/authors.html"),
        admin_settings: resolve(__dirname, "admin/settings.html"),
        admin_dashboard: resolve(__dirname, "admin/dashboard.html"),
        dashboard: resolve(__dirname, "admin/dashboard.html"),
        articles_admin: resolve(__dirname, "admin/articles.html"),
      },
    },
  },
});
