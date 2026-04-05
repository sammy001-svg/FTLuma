import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  plugins: [
    {
      name: 'rewrite-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/admin') {
            res.writeHead(301, { Location: '/admin/' });
            res.end();
            return;
          }
          if (req.url && !req.url.includes('.') && req.url !== '/' && req.url !== '/admin/') {
            req.url += '.html';
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
  }
});
