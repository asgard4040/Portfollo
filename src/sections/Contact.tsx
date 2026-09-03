import { useState } from 'react'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import { Paperclip, KnobMark } from '../components/Doodles'
import { socialIcon } from '../components/social'
import { IconWhatsApp } from '../components/icons'
import { useContent } from '../store/ContentContext'
import { supabase } from '../utils/supabase/client'
import { isSupabaseConfigured } from '../utils/supabase/client'

export default function Contact() {
  const { content } = useContent()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)

    let success = false

    // 1. Deliver message directly to aliemadnajm.iq@gmail.com via FormSubmit AJAX
    try {
      const response = await fetch('https://formsubmit.co/ajax/aliemadnajm.iq@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: `Portfolio Message from ${name} (${email})`,
        }),
      })

      if (response.ok) {
        success = true
      }
    } catch (err) {
      console.warn('FormSubmit email send error:', err)
    }

    // 2. Also backup to Supabase contact_messages if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: insertError } = await supabase
          .from('contact_messages')
          .insert({ name, email, message })
        if (!insertError) success = true
      } catch (err) {
        console.warn('Supabase contact_messages backup error:', err)
      }
    }

    if (success) {
      setSent(true)
      setName('')
      setEmail('')
      setMessage('')
      setTimeout(() => setSent(false), 5000)
    } else {
      // Direct mailto fallback
      window.location.href = `mailto:aliemadnajm.iq@gmail.com?subject=${encodeURIComponent(
        `Portfolio Message from ${name}`,
      )}&body=${encodeURIComponent(`${message}\n\nFrom: ${name} (${email})`)}`
      setSent(true)
      setTimeout(() => setSent(false), 5000)
    }

    setSending(false)
  }

  return (
    <section id="contact" className="border-t border-line px-4 py-16 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          index="05 / Let's talk"
          title="Say hello"
          note="got a project, an idea, or just want to share a sketch?"
        />

        <Reveal rot="-1deg">
          <div className="paper relative p-5 sm:p-10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="font-hand text-2xl text-ink-faint">leave a note…</p>
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href="https://wa.me/9647850086597"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-ink-faint hover:text-ink transition-colors flex items-center gap-1.5"
                >
                  <IconWhatsApp className="h-3.5 w-3.5 text-emerald-600" />
                  <span>+964 785 008 6597</span>
                  <span>↗</span>
                </a>
                <a
                  href="mailto:aliemadnajm.iq@gmail.com"
                  className="font-mono text-xs text-ink-faint hover:text-ink transition-colors flex items-center gap-1.5"
                >
                  <span>aliemadnajm.iq@gmail.com</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

            {/* contact form → saves to Supabase */}
            <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="field-label">Name</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="your name"
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="field-input"
                  />
                </label>
              </div>
              <label className="block">
                <span className="field-label">Message</span>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="tell me what you're up to…"
                  className="field-input"
                />
              </label>
              {error && <p className="text-xs font-semibold text-ink">{error}</p>}
              {sent && (
                <p className="text-xs font-semibold text-ink">Message sent — thanks!</p>
              )}
              <button type="submit" className="btn btn-solid btn-lg w-full sm:w-auto" disabled={sending}>
                {sending ? 'Sending…' : 'Send it'}
                {!sending && <>&nbsp;↗</>}
              </button>
            </form>

            {/* quick links */}
            <div className="mt-8 border-t border-line pt-6">
              <p className="font-hand text-xl text-ink-soft">or find me here:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {content.social.map((link) => {
                  const IconCmp = socialIcon(link.label)
                  return (
                    <a
                      key={link.label + link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group btn btn-outline btn-sm btn-round"
                    >
                      <IconCmp className="h-4 w-4" />
                      {link.label}
                      <KnobMark className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </Reveal>

        {/* sign-off */}
        <Reveal className="mt-10">
          <p className="text-center font-hand text-2xl text-ink-faint">
            thanks for flipping through — {content.profile.firstName}.
          </p>
        </Reveal>
      </div>
    </section>
  )
}