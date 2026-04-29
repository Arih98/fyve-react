import React, { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import './FAQ.css'

const faqItems = [
  {
    question: 'What sizes do you offer?',
    answer: 'We offer a range of sizes for infants, toddlers, and older children.'
  },
  {
    question: 'What materials are your garments made from?',
    answer: 'Our clothing is crafted from high-quality, durable, and comfortable fabrics. Detailed information about the material composition can be found on each product page.'
  },
  {
    question: 'How do I care for the clothing?',
    answer: 'Each product comes with care instructions to maintain its quality. We advise following the washing and drying guidelines provided to ensure longevity.'
  },
  {
    question: 'What are your delivery options and times?',
    answer: 'Typically, orders are processed within 1-2 working days, with standard delivery taking 3-5 working days.'
  },
  {
    question: 'Can I track my order?',
    answer: 'Yes, once your order has shipped, you will receive a tracking number via email so you can monitor its progress.'
  },
  {
    question: 'What is your returns policy?',
    answer: 'You may return your item(s) within 7 days of delivery. There will be an $8 charge to process your return, and we\'ll provide you with a prepaid shipping label to make the process as smooth as possible. Please note, your return must be marked as posted within 7 calendar days from being delivered. Any returns received which do not meet our returns criteria will not be eligible for a refund.'
  },
  {
    question: 'Are there any exchange options available?',
    answer: 'If an exchange is preferred, please contact our customer service team who will endeavour to assist you.'
  },
  {
    question: 'Do you offer international shipping?',
    answer: 'Not at this time, we ship across the United States at present. For availability in Europe, please check out our retailers list displayed on our Instagram Page.'
  },
  {
    question: 'How can I get in touch if I have further questions?',
    answer: 'You can drop us an email at hello@fyvelondon.com'
  }
]

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null)
  const pageRef = useRef(null)
  const itemRefs = useRef([])
  const contentRefs = useRef([])
  const iconRefs = useRef([])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(contentRefs.current, {
        height: 0,
        opacity: 0
      })

      gsap.set(iconRefs.current, {
        rotate: 0
      })

      gsap.fromTo(
        itemRefs.current,
        {
          y: 18,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.055
        }
      )
    }, pageRef)

    return () => ctx.revert()
  }, [])

  const toggleItem = (index) => {
    const nextIndex = activeIndex === index ? null : index

    if (activeIndex !== null && contentRefs.current[activeIndex]) {
      gsap.to(contentRefs.current[activeIndex], {
        height: 0,
        opacity: 0,
        duration: 0.42,
        ease: 'power3.inOut'
      })

      gsap.to(iconRefs.current[activeIndex], {
        rotate: 0,
        duration: 0.42,
        ease: 'power3.inOut'
      })
    }

    if (nextIndex !== null && contentRefs.current[nextIndex]) {
      gsap.set(contentRefs.current[nextIndex], {
        height: 'auto',
        opacity: 1
      })

      const height = contentRefs.current[nextIndex].offsetHeight

      gsap.fromTo(
        contentRefs.current[nextIndex],
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
            gsap.set(contentRefs.current[nextIndex], {
              height: 'auto'
            })
          }
        }
      )

      gsap.to(iconRefs.current[nextIndex], {
        rotate: 45,
        duration: 0.52,
        ease: 'power3.inOut'
      })
    }

    setActiveIndex(nextIndex)
  }

  return (
    <main className="faq-page" ref={pageRef}>
      <section className="faq-shell">
        <div className="faq-header">
          <p className="faq-eyebrow">Customer care</p>
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
                className={`faq-item${isActive ? ' is-active' : ''}`}
                key={item.question}
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
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