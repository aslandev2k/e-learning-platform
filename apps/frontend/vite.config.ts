import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin, type PluginOption } from 'vite';
import svgr from 'vite-plugin-svgr';

// Plugin to inject react-scan script
function injectReactScan(): Plugin {
  return {
    name: 'inject-react-scan',
    transformIndexHtml(html) {
      if (process.env.VITE_ENABLE_SCAN === 'true') {
        return html.replace(
          '<!-- react-scan placeholder -->',
          '<script type="module" src="https://unpkg.com/react-scan/dist/auto.global.js"></script>',
        );
      }
      // Remove placeholder comment if not in scan mode
      return html.replace('<!-- react-scan placeholder -->\n    ', '');
    },
  };
}

// Plugin to serve OpenAPI docs at /api-docs
function serveOpenApiDocs(): Plugin {
  const openApiDistPath = path.resolve(__dirname, '../open-api/dist');
  return {
    name: 'serve-openapi-docs',
    configureServer(server) {
      server.middlewares.use('/api-docs', (req, res, next) => {
        const filePath = path.join(
          openApiDistPath,
          req.url === '/' ? 'index.html' : req.url || 'index.html',
        );
        if (fs.existsSync(filePath)) {
          const ext = path.extname(filePath);

          const contentTypes: Record<string, string> = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.yaml': 'text/yaml',
            '.yml': 'text/yaml',
            '.svg': 'image/svg+xml',
          };

          res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');

          // 👉 HTML: đọc string để replace
          if (ext === '.html') {
            let content = fs.readFileSync(filePath, 'utf8');

            content = content.replaceAll('./', './api-docs/');

            res.end(content);
            return;
          }

          // 👉 File khác: giữ nguyên Buffer
          const content = fs.readFileSync(filePath);
          res.end(content);
        } else {
          next();
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  console.log(`vite config:`, { mode });

  // Điều khiển plugins dựa trên env variable
  const plugins: PluginOption[] = [
    injectReactScan(),
    tanstackRouter({
      routesDirectory: './src/routes',
      target: 'react',
      autoCodeSplitting: true,
      generatedRouteTree: './src/routeTree.gen.ts',
      routeFileIgnorePrefix: '-',
      quoteStyle: 'single',
    }),
    react(), // Make sure to add this plugin after the TanStack Router Bundler plugin
    tailwindcss(),
    svgr(),
  ];

  // Bật serveOpenApiDocs khi chạy dev:docs
  if (process.env.VITE_SERVE_DOCS === 'true') {
    plugins.push(serveOpenApiDocs());
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@repo/zod-schemas': path.resolve(__dirname, '../../packages/zod-schemas'),
        '@repo/shared': path.resolve(__dirname, '../../packages/shared'),
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      exclude: ['@repo/zod-schemas', '@repo/shared'],
    },
    envDir: '../../',
    envPrefix: 'VITE',
    define: {
      'process.env': {
        // Please define it manually and do not add the SECRET key here!!!
        NODE_ENV: mode,
      },
    },
    build: {
      emptyOutDir: true,
      outDir: '../../dist',
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            // React core
            if (id.includes('react-dom')) return 'vendor-react-dom';
            if (id.includes('react/')) return 'vendor-react';

            // TanStack ecosystem
            if (id.includes('@tanstack/react-router')) return 'vendor-tanstack-router';
            if (id.includes('@tanstack/react-query')) return 'vendor-tanstack-query';
            if (id.includes('@tanstack/react-table')) return 'vendor-tanstack-table';

            // Radix UI primitives
            if (id.includes('@radix-ui') || id.includes('radix-ui')) return 'vendor-radix';

            // Icons
            if (id.includes('@tabler/icons-react')) return 'vendor-tabler-icons';
            if (id.includes('lucide-react')) return 'vendor-lucide-icons';

            // Heavy libs
            if (id.includes('recharts') || id.includes('d3-')) return 'vendor-recharts';
            if (id.includes('pdfjs-dist') || id.includes('react-pdf')) return 'vendor-pdf';
            if (id.includes('docx-preview')) return 'vendor-docx';
            if (id.includes('xlsx')) return 'vendor-xlsx';

            // DnD Kit
            if (id.includes('@dnd-kit')) return 'vendor-dnd-kit';

            // Forms
            if (id.includes('react-hook-form') || id.includes('@hookform')) return 'vendor-forms';

            // Date utilities
            if (id.includes('date-fns') || id.includes('react-day-picker')) return 'vendor-date';

            // Zod
            if (id.includes('zod')) return 'vendor-zod';
          },
        },
      },
    },
  };
});
