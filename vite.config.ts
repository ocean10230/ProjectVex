import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [ preact(), tailwindcss() ],
  build: {
    minify: true,

    rolldownOptions: {
      input: {
        iframe: "iframe.html",
        sandbox: "sandbox.html",
        script: "src/Background.ts",
        worker: "src/downloader/core/Downloader.ts",
        ui: "src/Render.tsx",

        http_stream: "src/proxy/Streaming.ts"
      },

      output: {
        entryFileNames: 'scripts/[name].js',
        assetFileNames: "assets/[name].[ext]",
        chunkFileNames: 'scripts/libs/[name].js',
        manualChunks(name) {
          if (name.includes("pyodide"))
            return "Runtime"
          else if (name.includes("@ffmpeg/"))
            return "FFMpeg"
          else if (name.includes("zustand"))
            return "HookManager"
          else if (name.includes("preact"))
            return "Preact"
          else if (name.includes("router-dom"))
            return "WebRouter"
          else if (name.includes("motion"))
            return "FramerMotion"
        }
      },
    }
  },
  resolve: {
    alias: {
      'src': path.resolve(__dirname, 'src'),

      "frontend": path.resolve(__dirname, 'frontend'),
      "components": path.resolve(__dirname, 'frontend', 'components'),
      "functions": path.resolve(__dirname, 'frontend', 'functions'),
      "hooks": path.resolve(__dirname, 'frontend', 'manager'),
      "pages": path.resolve(__dirname, 'frontend', 'pages'),
      "validation": path.resolve(__dirname, 'frontend', 'validation'),
      "motion": path.resolve(__dirname, 'frontend', 'motion')
    }
  }
})
