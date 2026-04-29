import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import './FAQ.css'
import { faqItems } from './data/faqItems'

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null)
  const pageRef = useRef(null)
  const contentRefs = useRef([])
  const iconRefs = useRef([])
  const activeIndexRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(contentRefs.current, {
        height: 0,
        opacity: 0
      })

      gsap.set(iconRefs.current, {
        rotate: 0
      })
    }, pageRef)

    return () => ctx.revert()
  }, [])

  const closeItem = (index) => {
    if (index === null || !contentRefs.current[index]) return

    gsap.to(contentRefs.current[index], {
      height: 0,
      opacity: 0,
      duration: 0.42,
      ease: 'power3.inOut'
    })

    gsap.to(iconRefs.current[index], {
      rotate: 0,
      duration: 0.42,
      ease: 'power3.inOut'
    })
  }

  const openItem = (index, shouldScroll = false) => {
    if (index === null || !contentRefs.current[index]) return

    const currentIndex = activeIndexRef.current

    if (currentIndex !== null && currentIndex !== index) {
      closeItem(currentIndex)
    }

    gsap.set(contentRefs.current[index], {
      height: 'auto',
      opacity: 1
    })

    const height = contentRefs.current[index].offsetHeight

    gsap.fromTo(
      contentRefs.current[index],
      {
        height: 0,
        opacity: 0
      },
      {
        height,
        opacity: 1,
        duration: 0.52,
        ease: 'power3.inOut',
        onComplete: () => {
          gsap.set(contentRefs.current[index], {
            height: 'auto'
          })
        }
      }
    )

    gsap.to(iconRefs.current[index], {
      rotate: 45,
      duration: 0.52,
      ease: 'power3.inOut'
    })

    activeIndexRef.current = index
    setActiveIndex(index)

    if (shouldScroll) {
      setTimeout(() => {
        document.getElementById(`faq-${faqItems[index].slug}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }, 120)
    }
  }

  const toggleItem = (index) => {
    const currentIndex = activeIndexRef.current

    if (currentIndex === index) {
      closeItem(index)
      activeIndexRef.current = null
      setActiveIndex(null)
      return
    }

    openItem(index)
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const openSlug = params.get('open') || location.hash.replace(/^#faq-/, '').replace(/^#/, '')

    if (!openSlug) return

    const index = faqItems.findIndex(item => item.slug === openSlug)

    if (index < 0) return

    requestAnimationFrame(() => {
      openItem(index, true)
    })
  }, [location.search, location.hash])

  return (
    <main className="faq-page" ref={pageRef}>
      <section className="faq-shell">
        <div className="faq-header">
          <h1>Frequently asked questions</h1>
          <p>
            Find answers to common questions about sizing, delivery, returns and garment care.
          </p>
        </div>

        <div className="faq-list">
          {faqItems.map((item, index) => {
            const isActive = activeIndex === index

            return (
              <article
                id={`faq-${item.slug}`}
                className={`faq-item${isActive ? ' is-active' : ''}`}
                key={item.question}
              >
                <button
                  className="faq-question"
                  type="button"
                  aria-expanded={isActive}
                  onClick={() => toggleItem(index)}
                >
                  <span>{item.question}</span>

                  <span
                    className="faq-icon"
                    aria-hidden="true"
                    ref={(el) => {
                      iconRefs.current[index] = el
                    }}
                  >
                    <span></span>
                    <span></span>
                  </span>
                </button>

                <div
                  className="faq-answer-wrap"
                  ref={(el) => {
                    contentRefs.current[index] = el
                  }}
                >
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}