import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import '@/index.css'
import { ThemeProvider } from '@/context/theme-context'
import { QueryProvider } from '@/providers/QueryProvider'
import { router } from '@/router'
import { Toaster } from '@/components/ui/sonner'

createRoot(document.getElementById('root')!).render(
  <QueryProvider>
    <ThemeProvider defaultTheme="system">
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </ThemeProvider>
  </QueryProvider>
)
