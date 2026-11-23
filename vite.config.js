import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  if (command === 'build') {
    const url = env.VITE_SUPABASE_URL || ''
    const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url) || !key.startsWith('sb_publishable_')) {
      throw new Error('Production requires a Supabase HTTPS project URL and public publishable key. Never use a secret/service-role key.')
    }
  }
  return { plugins: [react(), tailwindcss()], build: { sourcemap: false } }
})
