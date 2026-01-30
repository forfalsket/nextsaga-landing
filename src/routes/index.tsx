import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'

export const Route = createFileRoute('/')({
  component: Home,
})

// Trail path definition
const TRAIL_PATH = `
  M 450 240
  C 450 400, 530 550, 530 660
  C 530 770, 370 920, 370 1080
  C 370 1240, 530 1350, 530 1500
  C 530 1650, 370 1780, 370 1920
  C 370 2060, 450 2200, 450 2340
  L 450 2640
`

// Waypoint data
const waypoints = [
  {
    id: 1,
    top: '22%',
    offset: 40,
    side: 'left' as const,
    icon: 'map-pin',
    title: 'Choose Your Distance',
    description: 'A 2km morning stroll or a 10km expedition — you decide how far the story takes you. The quest adapts to your journey.',
  },
  {
    id: 2,
    top: '36%',
    offset: -40,
    side: 'right' as const,
    icon: 'book',
    title: 'AI Crafts Your Tale',
    description: 'Genre, weather, time of day — every detail weaves into a story written just for you. Each waypoint becomes a chapter waiting to unfold.',
  },
  {
    id: 3,
    top: '50%',
    offset: 40,
    side: 'left' as const,
    icon: 'star',
    title: 'Real-World Challenges',
    description: "Photograph a hidden detail. Find a landmark. Complete tasks woven into the narrative — you're not just reading the story, you're living it.",
  },
  {
    id: 4,
    top: '64%',
    offset: -40,
    side: 'right' as const,
    icon: 'camera',
    title: 'Capture Moments',
    description: 'Your photos become part of the story. Every snapshot, every discovery archived alongside the narrative. Your journey, preserved.',
  },
  {
    id: 5,
    top: '78%',
    offset: 0,
    side: 'left' as const,
    icon: 'trophy',
    title: 'Achievements & Archives',
    description: 'Complete quests. Unlock achievements. Your finished stories join a public archive — inspiring fellow adventurers to walk their own tales.',
  },
]

// Particle positions for destination animation
const particles = [
  { tx: -60, ty: -80, delay: 0 },
  { tx: 70, ty: -70, delay: 0.1 },
  { tx: -80, ty: 20, delay: 0.2 },
  { tx: 90, ty: 30, delay: 0.15 },
  { tx: -30, ty: -90, delay: 0.25 },
  { tx: 40, ty: 80, delay: 0.3 },
  { tx: -70, ty: 60, delay: 0.05 },
  { tx: 20, ty: -60, delay: 0.35 },
]

// Ray rotations for destination animation
const rayRotations = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

function Home() {
  const [scrollPercent, setScrollPercent] = useState(0)
  const [activeWaypoints, setActiveWaypoints] = useState<number[]>([])
  const [destinationReached, setDestinationReached] = useState(false)
  const [scrollHintVisible, setScrollHintVisible] = useState(true)
  const [compassVisible, setCompassVisible] = useState(false)
  const [pathLength, setPathLength] = useState(2000)
  const trailRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    // Get the actual path length
    if (trailRef.current) {
      setPathLength(trailRef.current.getTotalLength())
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const percent = Math.min(scrollTop / docHeight, 1)
      setScrollPercent(percent)

      // Scroll hint visibility
      setScrollHintVisible(scrollTop <= 150)

      // Compass visibility
      setCompassVisible(scrollTop > 150 && percent < 0.85)

      // Calculate active waypoints based on scroll position
      const viewportMiddle = scrollTop + window.innerHeight * 0.5
      const docHeight2 = document.documentElement.scrollHeight

      const newActiveWaypoints: number[] = []
      waypoints.forEach((wp) => {
        const wpTop = (parseFloat(wp.top) / 100) * docHeight2
        if (viewportMiddle > wpTop) {
          newActiveWaypoints.push(wp.id)
        }
      })
      setActiveWaypoints(newActiveWaypoints)

      // Destination reached
      if (percent > 0.85 && !destinationReached) {
        setDestinationReached(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [destinationReached])

  const trailOffset = pathLength * (1 - scrollPercent)

  return (
    <div className="paper-texture relative w-full min-h-[600vh] bg-parchment">
      {/* Background gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(74, 93, 74, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 60%, rgba(122, 155, 184, 0.06) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 80%, rgba(74, 93, 74, 0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* Contour lines decoration */}
      <Contours />

      {/* Trail SVG */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-[900px] h-full pointer-events-none">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 900 3000" preserveAspectRatio="xMidYMin slice">
          <path className="trail-path-bg" d={TRAIL_PATH} />
          <path
            ref={trailRef}
            className="trail-path-walked"
            d={TRAIL_PATH}
            style={{
              strokeDasharray: pathLength,
              strokeDashoffset: trailOffset,
            }}
          />
        </svg>
      </div>

      {/* Start Point */}
      <StartPoint />

      {/* Scroll Hint */}
      <ScrollHint visible={scrollHintVisible} />

      {/* Waypoints */}
      {waypoints.map((wp) => (
        <Waypoint key={wp.id} {...wp} isActive={activeWaypoints.includes(wp.id)} />
      ))}

      {/* Destination Glow */}
      <div className={`destination-glow ${destinationReached ? 'active' : ''}`} />

      {/* Destination */}
      <Destination reached={destinationReached} />

      {/* Compass */}
      <Compass visible={compassVisible} />
    </div>
  )
}

// Icons
function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

function LocationPinIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3" />
      <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 11 8 12 1-1 8-6.6 8-12a8 8 0 0 0-8-8z" />
    </svg>
  )
}

function getWaypointIcon(icon: string) {
  switch (icon) {
    case 'map-pin':
      return <MapPinIcon />
    case 'book':
      return <BookIcon />
    case 'star':
      return <StarIcon />
    case 'camera':
      return <CameraIcon />
    case 'trophy':
      return <TrophyIcon />
    default:
      return <MapPinIcon />
  }
}

// Contour lines decoration
function Contours() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.12] pointer-events-none">
      <div className="contour" style={{ width: 300, height: 200, top: '15%', left: '10%' }} />
      <div className="contour" style={{ width: 250, height: 180, top: '16%', left: '11%' }} />
      <div className="contour" style={{ width: 400, height: 250, top: '35%', right: '5%' }} />
      <div className="contour" style={{ width: 350, height: 220, top: '36%', right: '6%' }} />
      <div className="contour" style={{ width: 280, height: 280, top: '55%', left: '8%' }} />
      <div className="contour" style={{ width: 220, height: 220, top: '57%', left: '10%' }} />
      <div className="contour" style={{ width: 350, height: 200, top: '75%', right: '10%' }} />
    </div>
  )
}

// Start point hero
function StartPoint() {
  return (
    <div className="absolute top-[8vh] left-1/2 -translate-x-1/2 text-center z-20 px-6">
      <h1 className="font-serif text-[clamp(2.5rem,7vw,4.5rem)] font-normal tracking-tight mb-4 text-ink">
        Walk Your <span className="text-marker italic">Story</span>
      </h1>
      <p className="text-[1.15rem] text-ink-light max-w-[400px] mx-auto leading-relaxed">
        Turn every walk into an adventure. AI-generated quests that unfold with each step you take.
      </p>
      <div className="start-marker w-20 h-20 mx-auto mt-8 bg-marker rounded-full flex items-center justify-center text-parchment">
        <LocationPinIcon className="w-9 h-9" />
      </div>
    </div>
  )
}

// Scroll hint
function ScrollHint({ visible }: { visible: boolean }) {
  return (
    <div
      className={`absolute top-[calc(100vh-120px)] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-ink z-50 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <span className="font-serif text-2xl">Begin the journey</span>
      <svg className="w-7 h-7 text-ink-light scroll-hint-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
    </div>
  )
}

// Waypoint component
function Waypoint({
  id,
  top,
  offset,
  side,
  icon,
  title,
  description,
  isActive,
}: {
  id: number
  top: string
  offset: number
  side: 'left' | 'right'
  icon: string
  title: string
  description: string
  isActive: boolean
}) {
  return (
    <div
      className={`waypoint absolute z-10 pointer-events-auto ${isActive ? 'active' : ''}`}
      style={{
        top,
        left: `calc(50% + ${offset}px)`,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="waypoint-marker">
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-ink text-parchment text-[11px] font-semibold rounded-full flex items-center justify-center">
          {id}
        </span>
        {getWaypointIcon(icon)}
      </div>
      <div className={`waypoint-content ${side}`}>
        <h2 className="font-serif text-[1.6rem] font-normal mb-3 text-ink leading-tight">{title}</h2>
        <p className="text-[0.95rem] leading-relaxed text-ink-light">{description}</p>
      </div>
    </div>
  )
}

// Destination section
function Destination({ reached }: { reached: boolean }) {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Waitlist signup:', email)
    alert("Thanks for joining the quest! We'll be in touch.")
    setEmail('')
  }

  return (
    <div className={`absolute bottom-[8vh] left-1/2 -translate-x-1/2 text-center z-20 w-full max-w-[480px] px-6 ${reached ? 'reached' : ''}`}>
      <div className="relative w-[120px] h-[120px] mx-auto mb-10">
        <div className={`destination-marker ${reached ? 'reached' : ''}`}>
          <svg className="w-12 h-12 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
        </div>

        {/* Rays */}
        <div className="destination-rays absolute top-[60px] left-[60px] w-0 h-0 pointer-events-none">
          {rayRotations.map((rotation, i) => (
            <div
              key={i}
              className="ray"
              style={{
                transform: `rotate(${rotation}deg)`,
                animationDelay: `${i * 0.04}s`,
              }}
            />
          ))}
        </div>

        {/* Particles */}
        <div className="destination-particles absolute top-[60px] left-[60px] w-0 h-0 pointer-events-none">
          {particles.map((p, i) => (
            <div
              key={i}
              className="particle"
              style={
                {
                  '--tx': `${p.tx}px`,
                  '--ty': `${p.ty}px`,
                  animationDelay: `${p.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>

      <h2
        className={`font-serif text-[2.2rem] font-normal mb-2 transition-all duration-700 ${reached ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: '0.5s' }}
      >
        Quest Complete
      </h2>
      <p
        className={`text-ink-light text-[1.05rem] mb-12 transition-all duration-700 ${reached ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: '0.65s' }}
      >
        You've reached the destination.
      </p>

      <div
        className={`pt-8 border-t border-parchment-dark transition-all duration-700 ${reached ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: '0.8s' }}
      >
        <p className="font-serif text-[1.3rem] text-ink mb-5">Interested in walking your own story?</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group flex gap-2 mb-3">
            <input
              type="email"
              className="input-field"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn-submit">
              Count me in
            </button>
          </div>
          <p className="text-[0.8rem] text-ink-light">No spam. Just the signal when the trail opens.</p>
        </form>
      </div>
    </div>
  )
}

// Compass decoration
function Compass({ visible }: { visible: boolean }) {
  return (
    <svg className={`compass ${visible ? 'visible' : ''}`} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <path d="M50 10 L50 20 M50 80 L50 90 M10 50 L20 50 M80 50 L90 50" stroke="currentColor" strokeWidth="1.5" />
      <path d="M50 20 L55 50 L50 80 L45 50 Z" fill="currentColor" opacity="0.2" />
      <path d="M50 20 L55 50 L50 45 L45 50 Z" fill="#c45a3b" />
      <circle cx="50" cy="50" r="4" fill="currentColor" />
      <text x="50" y="8" textAnchor="middle" fontSize="8" fontFamily="serif" fill="currentColor">
        N
      </text>
    </svg>
  )
}
