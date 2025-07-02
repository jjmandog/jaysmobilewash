import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Redirect to preserve exact original functionality and UI
    if (typeof window !== 'undefined') {
      window.location.replace('/index.html');
    }
  }, []);

  return null; // This component won't be visible as we redirect immediately
}