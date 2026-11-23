import { useEffect, useRef } from 'react'

// Moves keyboard focus to a heading when a new screen appears, so keyboard and screen-reader users
// land at the top of the new content instead of on the page body.
export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return ref
}
