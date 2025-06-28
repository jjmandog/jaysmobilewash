import { Workbox } from 'workbox-window'

export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js')

    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        // Service worker updated
        if (confirm('New app update available! Reload to get the latest version?')) {
          window.location.reload()
        }
      }
    })

    wb.addEventListener('waiting', (event) => {
      // Show update available notification
      console.log('Update available, waiting for activation')
    })

    wb.addEventListener('controlling', (event) => {
      // Service worker is now controlling the page
      console.log('Service worker is now controlling the page')
    })

    wb.register().catch((error) => {
      console.error('Service worker registration failed:', error)
    })

    return wb
  }
}