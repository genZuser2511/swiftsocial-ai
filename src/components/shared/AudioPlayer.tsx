"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, SkipBack, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AudioPlayerProps {
    src: string
    className?: string
}

export function AudioPlayer({ src, className }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [error, setError] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const setAudioData = () => {
            setDuration(audio.duration)
            setError(false)
        }

        const setAudioTime = () => {
            setCurrentTime(audio.currentTime)
        }

        const handleEnded = () => {
            setIsPlaying(false)
            setCurrentTime(0)
        }

        const handleError = (e: any) => {
            console.error("Audio playback error:", e)
            setError(true)
        }

        audio.addEventListener("loadeddata", setAudioData)
        audio.addEventListener("timeupdate", setAudioTime)
        audio.addEventListener("ended", handleEnded)
        audio.addEventListener("error", handleError)

        return () => {
            audio.removeEventListener("loadeddata", setAudioData)
            audio.removeEventListener("timeupdate", setAudioTime)
            audio.removeEventListener("ended", handleEnded)
            audio.removeEventListener("error", handleError)
        }
    }, [src])

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play().catch(err => {
                    console.error("Playback failed:", err)
                    setError(true)
                })
            }
            setIsPlaying(!isPlaying)
        }
    }

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00"
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value)
        setCurrentTime(time)
        if (audioRef.current) {
            audioRef.current.currentTime = time
        }
    }

    return (
        <div 
            className={cn(
                "bg-muted/30 border border-gold-400/10 rounded-2xl p-4 flex items-center gap-4 min-w-[300px]", 
                error && "border-red-500/50",
                className
            )}
            onClick={(e) => e.stopPropagation()}
        >
            <audio ref={audioRef} src={src} preload="auto" playsInline />
            
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "w-10 h-10 rounded-full bg-gold-gradient text-black hover:scale-105 transition-transform shrink-0",
                    error && "bg-red-500 text-white"
                )}
                onClick={togglePlay}
                disabled={error}
            >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>

            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <div className="flex gap-0.5 items-center opacity-30">
                        {error ? (
                            <span className="text-red-500 lowercase font-normal italic">Failed to load audio</span>
                        ) : (
                            [...Array(20)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="w-1 rounded-full bg-gold-400" 
                                    style={{ 
                                        height: `${Math.random() * 12 + 4}px`,
                                        opacity: currentTime / (duration || 1) > i / 20 ? 1 : 0.3
                                    }}
                                />
                            ))
                        )}
                    </div>
                    <span>{formatTime(duration)}</span>
                </div>
                
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleProgressChange}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full h-1 bg-gold-400/20 rounded-lg appearance-none cursor-pointer accent-gold-400"
                    disabled={error}
                />
            </div>

            <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
    )
}
