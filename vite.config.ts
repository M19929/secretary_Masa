import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

function videoUploadPlugin() {
  return {
    name: 'video-upload-handler',
    configureServer(server: any) {
      server.middlewares.use('/api/upload-video', (req: any, res: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-file-name, x-file-ext');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === 'POST') {
          try {
            const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const publicVideosDir = path.resolve(process.cwd(), 'public/assets/videos');
            if (!fs.existsSync(publicVideosDir)) {
              fs.mkdirSync(publicVideosDir, { recursive: true });
            }
            const flutterVideosDir = path.resolve(process.cwd(), 'flutter_app/assets/videos');
            if (!fs.existsSync(flutterVideosDir)) {
              fs.mkdirSync(flutterVideosDir, { recursive: true });
            }

            const rawExt = (req.headers['x-file-ext'] as string) || 'mp4';
            const ext = rawExt.startsWith('.') ? rawExt : `.${rawExt}`;
            const fileName = `clinic_tour_${Date.now()}${ext}`;
            const targetFilePath = path.join(uploadsDir, fileName);
            const standardFilePath = path.join(uploadsDir, 'clinic_video.mp4');

            const writeStream = fs.createWriteStream(targetFilePath);
            req.pipe(writeStream);

            writeStream.on('finish', () => {
              try {
                fs.copyFileSync(targetFilePath, standardFilePath);
              } catch (_) {}
              try {
                fs.copyFileSync(targetFilePath, path.join(publicVideosDir, 'clinic_video.mp4'));
              } catch (_) {}
              try {
                fs.copyFileSync(targetFilePath, path.join(flutterVideosDir, 'clinic_video.mp4'));
              } catch (_) {}

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                url: `/uploads/${fileName}`,
                standardUrl: '/uploads/clinic_video.mp4',
                fileName: fileName
              }));
            });

            writeStream.on('error', (err: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            });
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), videoUploadPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
