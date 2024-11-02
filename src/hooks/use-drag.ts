import { useState, useCallback } from 'react'

export function useDrag() {
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  const dragStart = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setStartPos({ x: e.clientX, y: e.clientY })
  }, [])

  const dragMove = useCallback((e: React.MouseEvent, updatePosition: (dx: number, dy: number) => void) => {
    if (!isDragging) return
    const dx = e.clientX - startPos.x
    const dy = e.clientY - startPos.y
    updatePosition(dx, dy)
  }, [isDragging, startPos])

  const dragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  return { dragStart, dragMove, dragEnd }
}
