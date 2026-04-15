import { useState, useEffect } from 'react'

export function useGoogleMaps(apiKey: string) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if ((window as any).google?.maps) {
      setIsLoaded(true)
      return
    }
    const scriptId = 'google-maps-script'
    const existingScript = document.getElementById(scriptId)

    if (!existingScript) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setIsLoaded(true)
      script.onerror = () => console.error('Failed to load Google Maps API')
      document.head.appendChild(script)
    } else {
      existingScript.addEventListener('load', () => setIsLoaded(true))
    }
  }, [apiKey])

  return isLoaded
}
