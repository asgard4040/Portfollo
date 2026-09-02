import { useEffect } from 'react'
import { ContentProvider, useContent } from './store/ContentContext'
import { themeVars } from './store/colors'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import BackgroundFX from './components/BackgroundFX'
import PinnedScreen from './components/PinnedScreen'
import Dashboard from './components/Dashboard'
import Hero from './sections/Hero'
import About from './sections/About'
import Skills from './sections/Skills'
import Projects from './sections/Projects'
import Design from './sections/Design'
import Contact from './sections/Contact'

function Site() {
  const { content } = useContent()

  /* push the editable palette into Tailwind's CSS variables */
  useEffect(() => {
    const root = document.documentElement
    for (const [key, value] of Object.entries(themeVars(content.colors))) {
      root.style.setProperty(key, value)
    }
  }, [content.colors])

  return (
    <div className="relative min-h-screen bg-paper text-ink">
      {/* ambient glowing particles */}
      <BackgroundFX />

      {/* the pinned "computer" portal:
          - Hero floats above the 3D retro computer at rest
          - Scrolling immediately enters the screen smoothly
          - Inside the screen, inner sections + footer scrub through cleanly */}
      <PinnedScreen hero={<Hero />}>
        <About />
        <Skills />
        <Projects />
        <Design />
        <Contact />
        <Footer />
      </PinnedScreen>

      {/* tactile dot-grid pattern (follows the theme ink) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-80"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle, color-mix(in srgb, var(--color-ink) 28%, transparent) 1.2px, transparent 1.6px), ' +
            'linear-gradient(to right, color-mix(in srgb, var(--color-ink) 6%, transparent) 1px, transparent 1px), ' +
            'linear-gradient(to bottom, color-mix(in srgb, var(--color-ink) 6%, transparent) 1px, transparent 1px)',
          backgroundSize: '28px 28px, 112px 112px, 112px 112px',
        }}
      />

      {/* paper grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.08]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%27120%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%273%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',
        }}
      />

      <div className="pointer-events-none relative z-[45]">
        <div className="pointer-events-auto">
          <Navigation />
        </div>
        <main>
          {/* scroll runway for the portal: dolly-in + browsing the screen */}
          <div
            id="screen-spacer"
            className="pointer-events-none relative"
            style={{ height: 'calc(var(--enter-height, 1000px) + var(--world-height, 4800px))' }}
            aria-hidden="true"
          />
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <ContentProvider>
      <Site />
      <Dashboard />
    </ContentProvider>
  )
}

export default App