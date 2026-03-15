/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Hls from "hls.js"
import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    Settings,
    PictureInPicture2,
    SkipBack,
    SkipForward,
    Loader2,
    ChevronLeft,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { useIsMobile } from "@/hooks/use-mobile"

interface MoviePlayerProps {
    src: string
    title?: string
    poster?: string
    onBack?: () => void
    selectedEp?: string
}

const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return "00:00"
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export default function MoviePlayer({ src, title = "Movie", poster, onBack, selectedEp }: MoviePlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const hlsRef = useRef<Hls | null>(null)
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const progressRef = useRef<HTMLDivElement>(null)
    const [isFakeFullscreen, setIsFakeFullscreen] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [buffered, setBuffered] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [playbackSpeed, setPlaybackSpeed] = useState(1)
    const [qualityLevels, setQualityLevels] = useState<{ height: number; bitrate: number; index: number }[]>([])
    const [currentQuality, setCurrentQuality] = useState(-1) // -1 = Auto
    const [isPiPSupported, setIsPiPSupported] = useState(false)
    const [isHovering, setIsHovering] = useState(false)
    const [previewTime, setPreviewTime] = useState<number | null>(null)
    const [previewPosition, setPreviewPosition] = useState(0)
    const isMobile = useIsMobile()
    // Initialize HLS
    useEffect(() => {
        if (!videoRef.current) return

        const video = videoRef.current

        // Reset states when src changes
        setIsPlaying(false)
        setCurrentTime(0)
        setDuration(0)
        setBuffered(0)
        setIsLoading(true)
        setQualityLevels([])
        setCurrentQuality(-1)
        setPreviewTime(null)

        // Destroy previous HLS instance if exists
        if (hlsRef.current) {
            hlsRef.current.destroy()
            hlsRef.current = null
        }

        // Check PiP support
        setIsPiPSupported("pictureInPictureEnabled" in document)

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            })

            hls.loadSource(src)
            hls.attachMedia(video)

            hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                const levels = data.levels.map((level, index) => ({
                    height: level.height,
                    bitrate: level.bitrate,
                    index,
                }))
                setQualityLevels(levels)
                setIsLoading(false)
            })

            hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
                if (currentQuality === -1) {
                    // Auto mode - don't update currentQuality
                }
            })

            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad()
                            break
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError()
                            break
                    }
                }
            })

            hlsRef.current = hls

            return () => {
                hls.destroy()
                hlsRef.current = null
                document.body.style.overflow = '' // ← thêm dòng này
                if (controlsTimeoutRef.current)
                    clearTimeout(controlsTimeoutRef.current)
            }
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src
            video.load()
            setIsLoading(false)
        }
    }, [src])

    // Video event listeners
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)
        const handleTimeUpdate = () => setCurrentTime(video.currentTime)
        const handleDurationChange = () => setDuration(video.duration)
        const handleVolumeChange = () => {
            setVolume(video.volume)
            setIsMuted(video.muted)
        }
        const handleWaiting = () => setIsLoading(true)
        const handleCanPlay = () => setIsLoading(false)
        const handleProgress = () => {
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1)
                setBuffered(bufferedEnd)
            }
        }

        video.addEventListener("play", handlePlay)
        video.addEventListener("pause", handlePause)
        video.addEventListener("timeupdate", handleTimeUpdate)
        video.addEventListener("durationchange", handleDurationChange)
        video.addEventListener("volumechange", handleVolumeChange)
        video.addEventListener("waiting", handleWaiting)
        video.addEventListener("canplay", handleCanPlay)
        video.addEventListener("progress", handleProgress)

        return () => {
            video.removeEventListener("play", handlePlay)
            video.removeEventListener("pause", handlePause)
            video.removeEventListener("timeupdate", handleTimeUpdate)
            video.removeEventListener("durationchange", handleDurationChange)
            video.removeEventListener("volumechange", handleVolumeChange)
            video.removeEventListener("waiting", handleWaiting)
            video.removeEventListener("canplay", handleCanPlay)
            video.removeEventListener("progress", handleProgress)
        }
    }, [])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!containerRef.current?.contains(document.activeElement) && document.activeElement !== document.body) return

            switch (e.key.toLowerCase()) {
                case " ":
                case "k":
                    e.preventDefault()
                    togglePlay()
                    break
                case "f":
                    e.preventDefault()
                    toggleFullscreen()
                    break
                case "m":
                    e.preventDefault()
                    toggleMute()
                    break
                case "arrowleft":
                    e.preventDefault()
                    skip(-10)
                    break
                case "arrowright":
                    e.preventDefault()
                    skip(10)
                    break
                case "arrowup":
                    e.preventDefault()
                    changeVolume(0.1)
                    break
                case "arrowdown":
                    e.preventDefault()
                    changeVolume(-0.1)
                    break
                case "j":
                    e.preventDefault()
                    skip(-10)
                    break
                case "l":
                    e.preventDefault()
                    skip(10)
                    break
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                    e.preventDefault()
                    seekToPercent(parseInt(e.key) * 10)
                    break
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    // Fullscreen change listener
    useEffect(() => {
        const video = videoRef.current

        const handleFullscreenChange = () => {
            const isFS =
                !!document.fullscreenElement ||
                !!(document as any).webkitFullscreenElement ||
                !!(document as any).mozFullScreenElement ||
                !!(document as any).msFullscreenElement ||
                !!(video as any)?.webkitDisplayingFullscreen
            setIsFullscreen(isFS)
        }

        // iOS Safari video fullscreen events
        const handleiOSFullscreen = () => {
            setIsFullscreen(true)
        }
        const handleiOSExitFullscreen = () => {
            setIsFullscreen(false)
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
        document.addEventListener("mozfullscreenchange", handleFullscreenChange)
        document.addEventListener("MSFullscreenChange", handleFullscreenChange)

        // iOS Safari specific events
        if (video) {
            video.addEventListener("webkitbeginfullscreen", handleiOSFullscreen)
            video.addEventListener("webkitendfullscreen", handleiOSExitFullscreen)
        }

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
            document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
            document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
            if (video) {
                video.removeEventListener("webkitbeginfullscreen", handleiOSFullscreen)
                video.removeEventListener("webkitendfullscreen", handleiOSExitFullscreen)
            }
        }
    }, [])

    // Auto-hide controls
    const showControlsTemporarily = useCallback(() => {
        setShowControls(true)
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current)
        }
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false)
            }, 3000)
        }
    }, [isPlaying])

    useEffect(() => {
        if (!isPlaying) {
            setShowControls(true)
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current)
            }
        }
    }, [isPlaying])

    const togglePlay = () => {
        if (!videoRef.current) return
        if (isPlaying) {
            videoRef.current.pause()
        } else {
            videoRef.current.play()
        }
    }

    const toggleMute = () => {
        if (!videoRef.current) return
        videoRef.current.muted = !videoRef.current.muted
    }

    const changeVolume = (delta: number) => {
        if (!videoRef.current) return
        const newVolume = Math.max(0, Math.min(1, volume + delta))
        videoRef.current.volume = newVolume
        if (newVolume > 0 && isMuted) {
            videoRef.current.muted = false
        }
    }

    const handleVolumeChange = (value: number[]) => {
        if (!videoRef.current) return
        const newVolume = value[0] / 100
        videoRef.current.volume = newVolume
        if (newVolume > 0 && isMuted) {
            videoRef.current.muted = false
        }
    }

    const skip = (seconds: number) => {
        if (!videoRef.current) return
        videoRef.current.currentTime += seconds
    }

    const seekToPercent = (percent: number) => {
        if (!videoRef.current || !duration) return
        videoRef.current.currentTime = (percent / 100) * duration
    }

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || !progressRef.current) return
        const rect = progressRef.current.getBoundingClientRect()
        const percent = (e.clientX - rect.left) / rect.width
        videoRef.current.currentTime = percent * duration
    }

    const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current || !duration) return
        const rect = progressRef.current.getBoundingClientRect()
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        setPreviewTime(percent * duration)
        setPreviewPosition(e.clientX - rect.left)
    }

    const toggleFullscreen = async () => {
        const container = containerRef.current
        const video = videoRef.current
        if (!container || !video) return

        // Check if we're currently in fullscreen (cross-browser)
        const isCurrentlyFullscreen =
            document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).mozFullScreenElement ||
            (document as any).msFullscreenElement ||
            (video as any).webkitDisplayingFullscreen

        if (!isCurrentlyFullscreen) {
            // Try to enter fullscreen
            try {
                if (container.requestFullscreen) {
                    await container.requestFullscreen()
                } else if ((container as any).webkitRequestFullscreen) {
                    // Safari desktop
                    await (container as any).webkitRequestFullscreen()
                } else if ((container as any).mozRequestFullScreen) {
                    // Firefox
                    await (container as any).mozRequestFullScreen()
                } else if ((container as any).msRequestFullscreen) {
                    // IE/Edge
                    await (container as any).msRequestFullscreen()
                } else if ((video as any).webkitEnterFullscreen) {
                    // iOS Safari - only supports video element fullscreen
                    await (video as any).webkitEnterFullscreen()
                } else if ((video as any).webkitSupportsFullscreen && (video as any).webkitEnterFullScreen) {
                    // Older iOS
                    await (video as any).webkitEnterFullScreen()
                }
            } catch (err) {
                // Fallback for iOS - try video element fullscreen
                if ((video as any).webkitEnterFullscreen) {
                    try {
                        await (video as any).webkitEnterFullscreen()
                    } catch (e) {
                        console.error("Fullscreen not supported")
                    }
                }
            }
        } else {
            // Exit fullscreen
            try {
                if (document.exitFullscreen) {
                    await document.exitFullscreen()
                } else if ((document as any).webkitExitFullscreen) {
                    await (document as any).webkitExitFullscreen()
                } else if ((document as any).mozCancelFullScreen) {
                    await (document as any).mozCancelFullScreen()
                } else if ((document as any).msExitFullscreen) {
                    await (document as any).msExitFullscreen()
                } else if ((video as any).webkitExitFullscreen) {
                    await (video as any).webkitExitFullscreen()
                }
            } catch (err) {
                console.error("Exit fullscreen failed")
            }
        }
    }

    const togglePiP = async () => {
        if (!videoRef.current) return

        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture()
        } else {
            await videoRef.current.requestPictureInPicture()
        }
    }

    const handlePlaybackSpeedChange = (speed: string) => {
        if (!videoRef.current) return
        const newSpeed = parseFloat(speed)
        videoRef.current.playbackRate = newSpeed
        setPlaybackSpeed(newSpeed)
    }

    const handleQualityChange = (quality: string) => {
        const index = parseInt(quality)
        setCurrentQuality(index)
        if (hlsRef.current) {
            hlsRef.current.currentLevel = index
        }
    }

    const progress = duration ? (currentTime / duration) * 100 : 0
    const bufferedProgress = duration ? (buffered / duration) * 100 : 0

    return (
        <TooltipProvider>
            <div
                ref={containerRef}
                className={cn(
                    "relative w-full bg-black overflow-hidden group",
                    isFullscreen ? "h-screen" : "aspect-video"
                )}
                onMouseMove={showControlsTemporarily}
                onTouchStart={showControlsTemporarily}
                onTouchMove={showControlsTemporarily}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => {
                    setIsHovering(false)
                    setPreviewTime(null)
                }}
            >
                {/* Video Element */}
                <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    poster={poster}
                    onClick={togglePlay}
                    playsInline
                />

                {/* Loading Spinner */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 pointer-events-none">
                        <Loader2 className="w-12 h-12 text-white animate-spin" />
                    </div>
                )}

                {/* Play/Pause Center Indicator */}
                <div
                    className={cn(
                        "absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 z-10",
                        !isPlaying && !isLoading ? "opacity-100" : "opacity-0"
                    )}
                >
                    <div className="w-20 h-20 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-10 h-10 text-white ml-1" fill="white" />
                    </div>
                </div>

                {/* Top Gradient & Title */}
                <div
                    className={cn(
                        "absolute top-0 left-0 right-0  bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 z-20",
                        showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                >
                    {(!isFullscreen && isMobile ?
                        <div className="flex items-center gap-4 p-4">
                            {onBack && (
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <ChevronLeft className="w-6 h-6 text-white" />
                                </button>
                            )}
                            <h1 className="text-white font-medium text-lg truncate">{title} tập {selectedEp}</h1>
                        </div>
                        : null
                    )}
                </div>

                {/* Bottom Controls */}
                <div
                    className={cn(
                        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300  z-20",
                        showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                >
                    {/* Progress Bar */}
                    <div className="px-4 mb-2">
                        <div
                            ref={progressRef}
                            className="relative h-1 bg-white/30 rounded-full cursor-pointer group/progress hover:h-1.5 transition-all"
                            onClick={handleProgressClick}
                            onMouseMove={handleProgressHover}
                            onMouseLeave={() => setPreviewTime(null)}
                        >
                            {/* Buffered */}
                            <div
                                className="absolute top-0 left-0 h-full bg-white/40 rounded-full"
                                style={{ width: `${bufferedProgress}%` }}
                            />
                            {/* Progress */}
                            <div
                                className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                            {/* Thumb */}
                            <div
                                className={cn(
                                    "absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg",
                                )}
                                style={{ left: `calc(${progress}% - 6px)` }}
                            />
                            {/* Preview Time Tooltip */}
                            {previewTime !== null && (
                                <div
                                    className="absolute bottom-6 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded"
                                    style={{ left: previewPosition }}
                                >
                                    {formatTime(previewTime)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between px-4 pb-4">
                        {/* Left Controls */}
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={togglePlay}
                                        className="rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        {isPlaying ? (
                                            <Pause className="size-4 md:size-6 text-white" fill="white" />
                                        ) : (
                                            <Play className="size-4 md:size-6 text-white" fill="white" />
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={8}>
                                    <p>{isPlaying ? "Tạm dừng" : "Phát"}</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={() => skip(-10)}
                                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        <SkipBack className="size-4 lg:size-5 text-white" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={8}>
                                    <p>Tua lùi 10s (J)</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={() => skip(10)}
                                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        <SkipForward className="size-4 lg:size-5 text-white" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={8}>
                                    <p>Tua tới 10s (L)</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Volume Control */}
                            <div className="flex items-center gap-2 group/volume">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={toggleMute}
                                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                        >
                                            {isMuted || volume === 0 ? (
                                                <VolumeX className="size-4 lg:size-5 text-white" />
                                            ) : (
                                                <Volume2 className="size-4 lg:size-5 text-white" />
                                            )}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={8}>
                                        <p>{isMuted ? "Bật âm (M)" : "Tắt âm (M)"}</p>
                                    </TooltipContent>
                                </Tooltip>
                                <div className={`${(isMobile && isFullscreen ? 'w-auto' : 'w-0')}  overflow-hidden group-hover/volume:w-20 transition-all duration-300`}>
                                    <Slider
                                        value={[isMuted ? 0 : volume * 100]}
                                        onValueChange={handleVolumeChange}
                                        max={100}
                                        step={1}
                                        className="w-20 [&_[data-slot=slider-track]]:bg-white/30 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-0 [&_[data-slot=slider-thumb]]:w-3 [&_[data-slot=slider-thumb]]:h-3"
                                    />
                                </div>
                            </div>

                            {/* Time Display */}
                            <div className="text-white text-sm ml-2 font-mono hidden md:block">
                                <span>{formatTime(currentTime)}</span>
                                <span className="mx-1 text-white/60">/</span>
                                <span className="text-white/60">{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-1">
                            {/* Settings Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button type="button" className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Cai dat">
                                        <Settings className="size-4 lg:size-5 text-white" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    sideOffset={8}
                                    align="end"
                                    className="!z-[9999] w-56 bg-zinc-900/95 border-zinc-700 text-white backdrop-blur-md"
                                >
                                    {/* Playback Speed */}
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="hover:bg-white/10 focus:bg-white/10 [&_svg]:text-white cursor-pointer">
                                            <span>Tốc độ phát</span>
                                            <span className="ml-auto text-zinc-400 text-xs">
                                                {playbackSpeed === 1 ? "Bình thường" : `${playbackSpeed}x`}
                                            </span>
                                        </DropdownMenuSubTrigger>

                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent className="bg-zinc-900/95 border-zinc-700 text-white backdrop-blur-md">
                                                <DropdownMenuRadioGroup
                                                    value={playbackSpeed.toString()}
                                                    onValueChange={handlePlaybackSpeedChange}
                                                >
                                                    {PLAYBACK_SPEEDS.map((speed) => (
                                                        <DropdownMenuRadioItem
                                                            key={speed}
                                                            value={speed.toString()}
                                                            className="hover:bg-white/10 focus:bg-white/10"
                                                        >
                                                            {speed === 1 ? "Bình thường" : `${speed}x`}
                                                        </DropdownMenuRadioItem>
                                                    ))}
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>

                                    {/* Quality */}
                                    {qualityLevels.length > 1 && (
                                        <>
                                            <DropdownMenuSeparator className="bg-zinc-700" />
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger className="hover:bg-white/10 focus:bg-white/10 [&_svg]:text-white">
                                                    <span>Chất lượng</span>
                                                    <span className="ml-auto text-zinc-400 text-xs">
                                                        {currentQuality === -1
                                                            ? "Tự động"
                                                            : `${qualityLevels.find((q) => q.index === currentQuality)?.height}p`}
                                                    </span>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent className="bg-zinc-900/95 border-zinc-700 text-white backdrop-blur-md">
                                                        <DropdownMenuRadioGroup
                                                            value={currentQuality.toString()}
                                                            onValueChange={handleQualityChange}
                                                        >
                                                            <DropdownMenuRadioItem
                                                                value="-1"
                                                                className="hover:bg-white/10 focus:bg-white/10"
                                                            >
                                                                Tự động
                                                            </DropdownMenuRadioItem>
                                                            {qualityLevels
                                                                .sort((a, b) => b.height - a.height)
                                                                .map((level) => (
                                                                    <DropdownMenuRadioItem
                                                                        key={level.index}
                                                                        value={level.index.toString()}
                                                                        className="hover:bg-white/10 focus:bg-white/10"
                                                                    >
                                                                        {level.height}p
                                                                        <span className="ml-2 text-zinc-400 text-xs">
                                                                            {(level.bitrate / 1000000).toFixed(1)} Mbps
                                                                        </span>
                                                                    </DropdownMenuRadioItem>
                                                                ))}
                                                        </DropdownMenuRadioGroup>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* PiP Button */}
                            {isPiPSupported && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={togglePiP}
                                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                        >
                                            <PictureInPicture2 className="w-5 h-5 text-white" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={8}>
                                        <p>Hình trong hình</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}

                            {/* Fullscreen Button */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={toggleFullscreen}
                                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        {isFullscreen ? (
                                            <Minimize className="w-5 h-5 text-white" />
                                        ) : (
                                            <Maximize className="w-5 h-5 text-white" />
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={8}>
                                    <p>{isFullscreen ? "Thoát toàn màn hình (F)" : "Toàn màn hình (F)"}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>

            </div>
        </TooltipProvider>
    )
}
