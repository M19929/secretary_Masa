import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Static uploads directory with CORS
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Allow cross-origin requests for media streaming to mobile devices
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-file-name, x-file-ext');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Serve static uploads and video assets
  app.use('/uploads', express.static(uploadsDir));
  app.use('/assets/videos', express.static(path.join(process.cwd(), 'public', 'assets', 'videos')));

  // Video upload API endpoint
  app.post('/api/upload-video', (req, res) => {
    try {
      const rawExt = (req.headers['x-file-ext'] as string) || 'mp4';
      const ext = rawExt.startsWith('.') ? rawExt : `.${rawExt}`;
      const fileName = `clinic_tour_${Date.now()}${ext}`;
      const targetFilePath = path.join(uploadsDir, fileName);
      const standardFilePath = path.join(uploadsDir, 'clinic_video.mp4');
      const publicVideosDir = path.join(process.cwd(), 'public', 'assets', 'videos');
      const flutterVideosDir = path.join(process.cwd(), 'flutter_app', 'assets', 'videos');

      if (!fs.existsSync(publicVideosDir)) {
        fs.mkdirSync(publicVideosDir, { recursive: true });
      }
      if (!fs.existsSync(flutterVideosDir)) {
        fs.mkdirSync(flutterVideosDir, { recursive: true });
      }

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

        res.json({
          success: true,
          url: `/uploads/${fileName}`,
          standardUrl: '/uploads/clinic_video.mp4',
          fileName: fileName
        });
      });

      writeStream.on('error', (err) => {
        res.status(500).json({ success: false, error: err.message });
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
