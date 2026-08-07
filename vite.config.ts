import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const polarToken =
    env.POLAR_ACCESS_TOKEN ||
    env.VITE_POLAR_ACCESS_TOKEN ||
    process.env.POLAR_ACCESS_TOKEN ||
    process.env.VITE_POLAR_ACCESS_TOKEN ||
    ''

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'POLAR_'],
    define: {
      'import.meta.env.POLAR_ACCESS_TOKEN': JSON.stringify(polarToken),
      'import.meta.env.VITE_POLAR_ACCESS_TOKEN': JSON.stringify(polarToken),
    },
  }
})
