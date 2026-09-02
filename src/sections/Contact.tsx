import { useState } from 'react'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import { Paperclip, KnobMark } from '../components/Doodles'
import { socialIcon } from '../components/social'
import { useContent } from '../store/ContentContext'
import { supabase } from '../utils/supabase/client'

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
    const { error: insertError } = await supabase
      .from('contact_messages')
      .insert({ name, email, message })
    if (insertError) {
      setError('Could not send your message. Please try again.')
    } else {
      setSent(true)
      setName('')
      setEmail('')
      setMessage('')
      setTimeout(() => setSent(false), 4000)
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
            <Paperclip className="absolute -top-2 left-10 w-8 -rotate-12 text-ink-faint" />
            <p className="font-hand text-2xl text-ink-faint">leave a note…</p>

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