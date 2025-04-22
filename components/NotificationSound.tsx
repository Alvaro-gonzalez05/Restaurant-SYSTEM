"use client"

import { useEffect, useRef } from "react"

interface NotificationSoundProps {
  play: boolean
  onPlay?: () => void
}

export default function NotificationSound({ play, onPlay }: NotificationSoundProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (play && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current
        .play()
        .then(() => {
          if (onPlay) onPlay()
        })
        .catch((error) => {
          console.error("Error playing notification sound:", error)
          // Llamar a onPlay incluso si hay error para evitar que se quede bloqueado
          if (onPlay) onPlay()
        })
    }
  }, [play, onPlay])

  // Usar una URL de sonido pública confiable
  return (
    <audio
      ref={audioRef}
      src="https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=notification-sound-7062.mp3"
      preload="auto"
      style={{ display: "none" }}
    />
  )
}
