import { createContext, useContext, useState } from 'react'

const LoadingContext = createContext()

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false)

  function showLoader() { setLoading(true) }
  function hideLoader() { setLoading(false) }

  return (
    <LoadingContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {loading && <GlobalLoader />}
    </LoadingContext.Provider>
  )
}

export function useLoader() {
  return useContext(LoadingContext)
}

function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center"
      style={{ background: 'rgba(54, 59, 108, 0.45)' }}>
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-4 border-lavender/30 border-t-violet-cta animate-spin"
        />
        <span className="text-lavender text-xs font-medium">Chargement...</span>
      </div>
    </div>
  )
}