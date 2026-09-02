import { useEffect, useState } from 'react'
import { useContent } from '../store/ContentContext'
import { portalScreen } from '../portal/screen'
import { Icon, navIcon, IconArrowUpRight, IconMenu, IconX } from './icons'

export default function Navigation() {
  const { content } = useContent()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* active section comes from the portal scroll math: the inner sections
     live inside the pinned screen, so scrollTo/IntersectionObserver can't
     track them — the screen module maps scrollY to the section on screen */
  const [active, setActive] = useState('#home')
  useEffect(() => {
    const update = () => setActive(`#${portalScreen.status()}`)
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4 ${
          open ? '' : 'pointer-events-none'
        }`}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          <div
            className={`pointer-events-auto flex h-14 items-center justify-between rounded-full border px-3 pl-5 backdrop-blur-md transition-all duration-300 sm:px-4 ${
              scrolled || open
                ? 'border-line bg-paper/85 shadow-paper'
                : 'border-line/70 bg-paper/60'
            }`}
          >
            {/* Brand */}
            <a href="#home" className="flex items-baseline gap-2" onClick={close}>
              <span className="display text-lg text-ink">{content.profile.name}</span>
              <span className="hidden -translate-y-0.5 font-hand text-base text-ink-faint lg:inline">
                — dev &amp; designer
              </span>
            </a>

            {/* Desktop nav pill */}
            <nav
              className="hidden items-center gap-1 md:flex"
              aria-label="Main"
            >
              {content.nav.map((item, i) => {
                const isActive = active === item.href
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`micro-label flex items-center gap-1.5 rounded-full px-3.5 py-2 transition-all duration-200 ${
                      isActive
                        ? 'bg-ink text-paper shadow-paper-sm'
                        : 'text-ink-soft hover:bg-paper-2 hover:text-ink'
                    }`}
                  >
                    <Icon name={navIcon(i)} className="h-4 w-4" />
                    {item.label}
                  </a>
                )
              })}
            </nav>

            {/* CTA + mobile toggle */}
            <div className="flex items-center gap-2">
              <a
                href="#contact"
                className="btn btn-outline btn-round btn-sm hidden lg:inline-flex"
              >
                Let&apos;s talk
                <IconArrowUpRight className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="btn btn-ghost btn-icon btn-sm btn-round text-ink md:hidden"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                aria-controls="mobile-menu"
              >
                {open ? (
                  <IconX className="h-5 w-5" />
                ) : (
                  <IconMenu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          id="mobile-menu"
        >
          <div className="absolute inset-0 bg-paper/95 backdrop-blur-xl transition-opacity" onClick={close} />
          
          <div
            className="relative z-10 flex h-full flex-col justify-between p-5 pb-8 pt-5"
            style={{
              paddingTop: 'max(1.25rem, env(safe-area-inset-top))',
              paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
            }}
          >
            {/* Top drawer bar with close button */}
            <div className="flex items-center justify-between border-b border-line pb-4">
              <span className="display text-xl text-ink">{content.profile.name}</span>
              <button
                type="button"
                onClick={close}
                className="btn btn-outline btn-icon btn-sm btn-round"
                aria-label="Close menu"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            {/* Nav list */}
            <nav className="my-auto flex flex-col gap-1 py-4">
              <p className="micro-label mb-2 px-3 text-ink-faint">— navigation</p>
              {content.nav.map((item, i) => {
                const isActive = active === item.href
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group flex min-h-[3.25rem] items-center justify-between rounded-btn px-3 transition-colors ${
                      isActive
                        ? 'bg-ink text-paper'
                        : 'text-ink-soft active:bg-paper-2'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`micro-label w-5 ${isActive ? 'text-paper/60' : 'text-ink-faint'}`}
                      >
                        0{i + 1}
                      </span>
                      <Icon
                        name={navIcon(i)}
                        className={`h-5 w-5 ${isActive ? 'text-paper/80' : 'text-ink-faint'}`}
                      />
                      <span className="display text-2xl text-current">{item.label}</span>
                    </div>
                    {isActive && <span className="h-2 w-2 rounded-full bg-paper" />}
                  </a>
                )
              })}
            </nav>

            {/* Bottom info & CTA */}
            <div className="border-t border-line pt-4 flex items-center justify-between">
              <p className="font-hand text-base text-ink-faint">
                {content.profile.name} — dev &amp; designer
              </p>
              <a
                href="#contact"
                onClick={close}
                className="btn btn-solid btn-round btn-sm"
              >
                Contact
                <IconArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}