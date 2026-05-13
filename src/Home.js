import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import Lottie from 'lottie-react'
import { useInView } from 'react-intersection-observer'
import './Home.css'
import FYVEHeroLottie from './assets/FYVEHeroLottie.json'
import { Observer } from 'gsap/Observer'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(Observer, ScrollTrigger)

ScrollTrigger.config({
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded'
})

const Home = () => {
  const lottieRef = useRef()
  const heroRef = useRef(null)
  const hasAnimated = useRef(false)
  const introDone = useRef(false)
  const hasSetHomeIntroPlayed = useRef(false)
  const [inViewRef, inView] = useInView({ triggerOnce: false, threshold: 0.5 })
  const [heroImageReady, setHeroImageReady] = useState(false)

  const setHeroViewportRef = (node) => {
    heroRef.current = node
    inViewRef(node)
  }

  const animationDuration = (FYVEHeroLottie.op - FYVEHeroLottie.ip) / FYVEHeroLottie.fr * 1000
  const londonFadeDelay = animationDuration * 0.3

  useLayoutEffect(() => {
  const previousScrollRestoration = window.history.scrollRestoration

  window.history.scrollRestoration = 'manual'

  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  window.dispatchEvent(new Event('scroll'))

  requestAnimationFrame(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    window.dispatchEvent(new Event('scroll'))
  })

  return () => {
    window.history.scrollRestoration = previousScrollRestoration
  }
}, [])

useEffect(() => {
  const raf = requestAnimationFrame(() => {
    ScrollTrigger.refresh()
  })

  return () => {
    cancelAnimationFrame(raf)
  }
}, [])

  useEffect(() => {
  if (!lottieRef.current || !introDone.current) return

  if (!inView) return

  lottieRef.current.goToAndStop(0, true)
  lottieRef.current.play()
}, [inView])

  useEffect(() => {
  let refreshTimer = null
  let lastScrollAt = 0

  const markScroll = () => {
    lastScrollAt = performance.now()
  }

  const refreshScroll = () => {
    clearTimeout(refreshTimer)

    refreshTimer = setTimeout(() => {
      const waitForStillness = () => {
        if (performance.now() - lastScrollAt < 250) {
          refreshTimer = setTimeout(waitForStillness, 250)
          return
        }

        requestAnimationFrame(() => {
          ScrollTrigger.refresh()
        })
      }

      waitForStillness()
    }, 350)
  }

  window.addEventListener('scroll', markScroll, { passive: true })
  window.addEventListener('load', refreshScroll)

  const images = Array.from(document.querySelectorAll('.home-page img'))

  images.forEach((img) => {
    if (!img.complete) {
      img.addEventListener('load', refreshScroll)
    }
  })

  return () => {
    clearTimeout(refreshTimer)
    window.removeEventListener('scroll', markScroll)
    window.removeEventListener('load', refreshScroll)

    images.forEach((img) => {
      img.removeEventListener('load', refreshScroll)
    })
  }
}, [])

  useEffect(() => {
    const navEntry = performance.getEntriesByType('navigation')[0]
    const isReload = navEntry?.type === 'reload'

    if (isReload) {
      sessionStorage.removeItem('homeIntroPlayed')
    }

    const shouldSkipIntro = sessionStorage.getItem('homeIntroPlayed') === 'true'

    hasAnimated.current = false
    introDone.current = false

    const speed = 1.35

const ctx = gsap.context(() => {
  const isMobile = window.innerWidth <= 768
  const splitLeftX = isMobile ? -58 : -72
  const splitRightX = isMobile ? 52 : 64
  const expandLeftX = isMobile ? -280 : -340
  const expandRightX = isMobile ? 280 : 340
  const finalHeight = isMobile ? '100svh' : '110vh'
  const initialSlotWidth = '0vw'
  const intermediateWidth = isMobile ? '28vw' : '18vw'
  const initialSlotHeight = isMobile ? '50vw' : '14vw'
  const fyveTextY = -1.11
  const mobileHeaderEl = document.querySelector('.mobile-header')
  const announcementBarEl = document.querySelector('.announcement-bar')
  const announcementHeight = announcementBarEl ? announcementBarEl.offsetHeight : 0

  if (shouldSkipIntro) {
        gsap.set('.fyve-mask', { visibility: 'visible', xPercent: -50, yPercent: -50 })
gsap.set('.hero-side-left, .hero-side-right', { visibility: 'visible' })
gsap.set('.fyve-letter', { yPercent: 0 })
gsap.set('.london-letter', { yPercent: 0 })
gsap.set('.fyve-text', { y: `${fyveTextY}vw` })
gsap.set('.hero-side-left', { xPercent: expandLeftX, visibility: 'hidden' })
gsap.set('.hero-side-right', { xPercent: expandRightX, visibility: 'hidden' })
gsap.set('.fyve-image-slot', { width: '100vw', height: finalHeight })
gsap.set('.fyve-image-scale-wrap', { scale: 1 })
gsap.set('.fyve-cover-left', { xPercent: -100 })
gsap.set('.fyve-cover-right', { xPercent: 100 })
gsap.set('.lottie-container', { autoAlpha: 1 })
gsap.set('.london-below', { opacity: 1 })
        gsap.set(document.documentElement, { '--home-announcement-offset': `${announcementHeight}px` })

        if (mobileHeaderEl) gsap.set(mobileHeaderEl, { opacity: 1 })
        if (announcementBarEl) gsap.set(announcementBarEl, { opacity: 1, y: 0 })
        gsap.set('.home-mobile-top-logo', { opacity: 1 })

        introDone.current = true
        return
      }

      gsap.set('.fyve-mask', { visibility: 'visible', xPercent: -50, yPercent: -50 })
gsap.set('.hero-side-left, .hero-side-right', { visibility: 'visible', xPercent: 0 })
gsap.set('.fyve-text', { y: `${fyveTextY}vw` })
gsap.set('.fyve-image-slot', { width: initialSlotWidth, height: initialSlotHeight })
gsap.set('.fyve-image-scale-wrap', { scale: 0.94, transformOrigin: 'center center' })
gsap.set('.fyve-cover-left', { xPercent: 0 })
gsap.set('.fyve-cover-right', { xPercent: 0 })
gsap.set('.lottie-container', { autoAlpha: 0 })
gsap.set('.london-below', { opacity: 0 })
      gsap.set(document.documentElement, { '--home-announcement-offset': '0px' })

      if (mobileHeaderEl) gsap.set(mobileHeaderEl, { opacity: 0 })

      if (announcementBarEl) {
        if (isMobile) {
          gsap.set(announcementBarEl, { opacity: 1, y: -announcementHeight })
        } else {
          gsap.set(announcementBarEl, { opacity: 0, y: 0 })
        }
      }

      gsap.set('.home-mobile-top-logo', { opacity: 0 })

      const tl = gsap.timeline({
        onComplete: () => {
          introDone.current = true
          if (!hasSetHomeIntroPlayed.current) {
            sessionStorage.setItem('homeIntroPlayed', 'true')
            hasSetHomeIntroPlayed.current = true
          }
        }
      })

      tl.addLabel('lettersIn')
        .fromTo('.fyve-letter', {
          yPercent: 100
        }, {
          yPercent: 0,
          duration: 1.1 * speed,
          ease: 'expo.out',
          stagger: 0.03
        }, 'lettersIn')
        .fromTo('.london-letter', {
          yPercent: 100
        }, {
          yPercent: 0,
          duration: 1.0 * speed,
          ease: 'expo.out',
          stagger: 0.02
        }, 'lettersIn+=0.22')

        .addLabel('splitReveal', 'lettersIn+=0.72')
.to('.hero-side-left', {
  xPercent: splitLeftX,
  duration: 0.95 * speed,
  ease: 'power3.inOut'
}, 'splitReveal')
.to('.hero-side-right', {
  xPercent: splitRightX,
  duration: 0.95 * speed,
  ease: 'power3.inOut'
}, 'splitReveal')
.to('.fyve-image-slot', {
  width: intermediateWidth,
  duration: 0.82 * speed,
  ease: 'expo.inOut'
}, 'splitReveal+=0.08')
.to('.fyve-cover-left', {
  xPercent: -100,
  duration: 0.82 * speed,
  ease: 'power3.inOut'
}, 'splitReveal+=0.08')
.to('.fyve-cover-right', {
  xPercent: 100,
  duration: 0.82 * speed,
  ease: 'power3.inOut'
}, 'splitReveal+=0.08')
.to('.fyve-image-scale-wrap', {
  scale: 1,
  duration: 1.0 * speed,
  ease: 'expo.out'
}, 'splitReveal')

        .addLabel('expandOut', 'splitReveal+=0.95')
.to('.hero-side-left', {
  xPercent: expandLeftX,
  duration: 0.88 * speed,
  ease: 'expo.inOut',
  onComplete: () => gsap.set('.hero-side-left', { visibility: 'hidden' })
}, 'expandOut')
.to('.hero-side-right', {
  xPercent: expandRightX,
  duration: 0.88 * speed,
  ease: 'expo.inOut',
  onComplete: () => gsap.set('.hero-side-right', { visibility: 'hidden' })
}, 'expandOut')
.to('.fyve-image-slot', {
  width: '100vw',
  height: finalHeight,
  duration: 0.9 * speed,
  ease: 'expo.inOut'
}, 'expandOut')

        .addLabel('uiReveal', 'expandOut+=0.35')
        .to(document.documentElement, {
          '--home-announcement-offset': `${announcementHeight}px`,
          duration: 0.9 * speed,
          ease: 'power2.out'
        }, 'uiReveal')

      if (announcementBarEl) {
        if (isMobile) {
          tl.to(announcementBarEl, {
            y: 0,
            duration: 0.9 * speed,
            ease: 'power2.out'
          }, 'uiReveal')
        } else {
          tl.to(announcementBarEl, {
            opacity: 1,
            duration: 0.6 * speed,
            ease: 'power2.out'
          }, 'uiReveal+=0.4')
        }
      }

      if (mobileHeaderEl) {
        tl.to(mobileHeaderEl, {
          opacity: 1,
          duration: 0.7 * speed,
          ease: 'power2.out'
        }, 'uiReveal+=0.75')
      }

      tl.to('.home-mobile-top-logo', {
        opacity: 1,
        duration: 0.5 * speed,
        ease: 'power2.out'
      }, 'uiReveal+=0.45')
        .addLabel('lottieIn', 'uiReveal+=0.45')
        .to('.lottie-container', {
          autoAlpha: 1,
          duration: 0.8 * speed,
          ease: 'power2.out',
          onStart: () => {
            lottieRef.current?.play()
          }
        }, 'lottieIn')
        .to('.london-below', {
          opacity: 1,
          duration: 0.5 * speed,
          ease: 'power2.out'
        }, `lottieIn+=${londonFadeDelay / 1000}`)
    }, heroRef)

const refreshAfterIntro = () => {
  let lastScrollY = window.scrollY
  let stableFrames = 0

  const check = () => {
    const currentScrollY = window.scrollY

    if (Math.abs(currentScrollY - lastScrollY) < 1) {
      stableFrames += 1
    } else {
      stableFrames = 0
    }

    lastScrollY = currentScrollY

    if (stableFrames >= 3) {
      ScrollTrigger.refresh()
      return
    }

    requestAnimationFrame(check)
  }

  requestAnimationFrame(check)
}

setTimeout(refreshAfterIntro, 500)

    hasAnimated.current = !shouldSkipIntro

    return () => {
      ctx.revert()
      document.documentElement.style.removeProperty('--home-announcement-offset')
    }
  }, [londonFadeDelay])

  useEffect(() => {
  const ctx = gsap.context(() => {
    const isMobile = window.innerWidth <= 768
gsap.set('.fyve-image-parallax-wrap', {
  y: isMobile ? '-4vh' : '4vh',
  scale: isMobile ? 1.04 : 1.06,
  force3D: true,
  transformOrigin: 'center center'
})

gsap.to('.fyve-image-parallax-wrap', {
  y: isMobile ? '5vh' : '19vh',
  scale: 1,
  ease: 'none',
  force3D: true,
  scrollTrigger: {
    trigger: '.fyve-hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 0.35,
    invalidateOnRefresh: true
  }
})

gsap.fromTo('.section1-aesthetic-image', {
  scale: 1.2
}, {
  scale: 1,
  ease: 'none',
  immediateRender: false,
  scrollTrigger: {
    trigger: '.section-1',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 0.25,
    invalidateOnRefresh: true
  }
})

gsap.fromTo('.section1-title-line--top', {
  xPercent: 0
}, {
  xPercent: -18,
  ease: 'none',
  immediateRender: false,
  scrollTrigger: {
    trigger: '.section-1',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    invalidateOnRefresh: true
  }
})

gsap.fromTo('.section1-title-line--bottom', {
  xPercent: 0
}, {
  xPercent: 18,
  ease: 'none',
  immediateRender: false,
  scrollTrigger: {
    trigger: '.section-1',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    invalidateOnRefresh: true
  }
})

   gsap.utils.toArray('.results-img-wrap').forEach((item) => {
  const amount = Number(item.dataset.resultsAmount || 10)

  gsap.fromTo(item, {
    y: `${amount}vh`
  }, {
    y: `${-amount}vh`,
    ease: 'none',
    immediateRender: true,
    scrollTrigger: {
      trigger: item,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true
    }
  })
})

const titleTravel = isMobile ? 260 : 230

gsap.fromTo('.results-before-after-title', {
  y: isMobile ? '-22vh' : '-18vh'
}, {
  y: `${titleTravel}vh`,
  ease: 'none',
  immediateRender: true,
  scrollTrigger: {
    trigger: '.results-float-section',
    start: 'top 55%',
    end: 'bottom+=70% top',
    scrub: true,
    invalidateOnRefresh: true
  }
})

    let rotation = 0
    const stamp = document.querySelector('.section1-stamp')

    if (stamp) {
      Observer.create({
        type: 'wheel,touch,scroll',
        onDown: () => {
          rotation -= 5
          gsap.to(stamp, { rotation, duration: 0.1, overwrite: true })
        },
        onUp: () => {
          rotation += 5
          gsap.to(stamp, { rotation, duration: 0.1, overwrite: true })
        },
        tolerance: 10,
        preventDefault: false
      })
    }
  })

  return () => ctx.revert()
}, [])

  return (
    <div className="home-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Fyve London',
            url: 'https://fyvelondon.com',
            logo: 'https://fyvelondon.com/api/Uploads/your-logo-file.png',
            sameAs: [
              'https://www.instagram.com/fyvelondon'
            ]
          })
        }}
      />
      <div className="fyve-hero-section">
        <div ref={setHeroViewportRef} className="fyve-hero-viewport">
          <div className="fyve-animation-stage">
            <div className="fyve-brand-layer">
  <div className="hero-side hero-side-left">
    <div className="fyve-text">
      {'FY'.split('').map((l, i) => <span key={i} className="fyve-letter">{l}</span>)}
    </div>
    <div className="london-text">
      {'LON'.split('').map((l, i) => <span key={i} className="london-letter">{l}</span>)}
    </div>
  </div>

  <div className="fyve-mask">
    <div className="fyve-image-slot">
      <div className={`fyve-image-reveal ${heroImageReady ? 'is-loaded' : ''}`}>
        <div className="fyve-image-scale-wrap">
          <div className="fyve-image-parallax-wrap">
<picture className="fyve-image-picture">
  <source media="(max-width: 768px)" srcSet="/assets/home/fyve-hero-children-white-mobile.webp" />
  <source media="(min-width: 769px)" srcSet="/assets/home/fyve-hero-children-white-desktop.webp" />
  <img
  src="/assets/home/fyve-hero-children-white-desktop.webp"
  alt="Fyve London children wearing SS26 collection"
  className={`fyve-image ${heroImageReady ? 'is-loaded' : ''}`}
  loading="eager"
  fetchPriority="high"
  decoding="async"
  onLoad={(e) => {
    const img = e.currentTarget

    if (img.decode) {
      img.decode()
        .then(() => setHeroImageReady(true))
        .catch(() => setHeroImageReady(true))
    } else {
      setHeroImageReady(true)
    }
  }}
/>
</picture>
</div>
        </div>
        <div className="fyve-cover fyve-cover-left"></div>
        <div className="fyve-cover fyve-cover-right"></div>
      </div>
    </div>
  </div>

  <div className="hero-side hero-side-right">
    <div className="fyve-text">
      {'VE'.split('').map((l, i) => <span key={i + 2} className="fyve-letter">{l}</span>)}
    </div>
    <div className="london-text">
      {'DON'.split('').map((l, i) => <span key={i + 3} className="london-letter">{l}</span>)}
    </div>
  </div>
</div>
          </div>

          <div className="fyve-ui-layer">
            <div className="home-mobile-top-logo">
              <img src="/assets/FYVE-White-Logo.svg" alt="FYVE Logo" />
            </div>

            <div className="lottie-container">
              <div className="lottie-animation-wrap">
                <Lottie
                  lottieRef={lottieRef}
                  animationData={FYVEHeroLottie}
                  loop={false}
                  autoplay={false}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <div className="london-below">LONDON</div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-1 section1-aesthetic-layout">
  <div className="section1-aesthetic-image-panel">
    <img
      src="/assets/home/fyve-girls-british-dress2.webp"
      alt="Modern British children's fashion by Fyve London"
      className="section1-aesthetic-image"
    />
  </div>

<h2 className="section1-aesthetic-title">
  <span className="section1-title-line section1-title-line--top">Comfortably Modern</span>
  <span className="section1-title-line section1-title-line--bottom">Distinctly British</span>
</h2>

  <div className="section1-aesthetic-copy-panel">
    <div className="section1-aesthetic-bottom">
      <p className="section1-aesthetic-body">
        Discover our exquisite luxury children’s clothing, comfortably modern and distinctly British, blending timeless elegance with everyday comfort for little ones.
      </p>

      <a href="https://dev.fyvelondon.com/products?category=ss26" className="section1-aesthetic-button">
        Shop Collection
        <img src="/assets/FYVE-button-Arrow-Icon-white.svg" alt="" />
      </a>
    </div>
  </div>
</div>

      <div className="results-float-section">
  <div className="results-float-row">
    <div className="results-icon-wrapper">
      <div className="results-before-after-title results-parallax-item">
        <img src="/assets/home/before-after-title.png" alt="Before/After" draggable="false" />
      </div>
    </div>

    <a href="https://dev.fyvelondon.com/products?category=ss26" className="results-img-wrap results-img-wrap-5" data-results-amount="15.5556">
      <img src="/assets/home/fyve-girls-british-dress.webp" alt="" draggable="false" />
    </a>

    <a href="https://dev.fyvelondon.com/products?category=ss26" className="results-img-wrap results-img-wrap-4" data-results-amount="7.77778">
      <img src="/assets/home/fyve-detail-british-childrens-fashion.webp" alt="" draggable="false" />
    </a>

    <a href="https://dev.fyvelondon.com/products?category=ss26" className="results-img-wrap results-img-wrap-3" data-results-amount="11.6667">
      <img src="/assets/home/FYVE-SS26-WF7672.webp" alt="" draggable="false" />
    </a>

    <a href="https://dev.fyvelondon.com/products?category=ss26" className="results-img-wrap results-img-wrap-2" data-results-amount="19.4444">
      <img src="/assets/home/FYVE-SS26-WF767233.webp" alt="" draggable="false" />
    </a>

    <a href="https://dev.fyvelondon.com/products?category=ss26" className="results-img-wrap results-img-wrap-1" data-results-amount="3.88889">
      <img src="/assets/home/fyve-london-hero.webp" alt="" draggable="false" />
    </a>

    <a href="https://dev.fyvelondon.com/products?category=ss26" className="results-outline-button">
      See the collection
    </a>
  </div>
</div>

      <div className="section-2">
        <picture className="section2-bg-picture">
          <source media="(max-width: 768px)" srcSet="/assets/home/FYVE-SS26-WF767233.webp" />
          <img
            src="/assets/home/FYVE-SS26-WF7672.webp"
            alt=""
            className="section2-bg-image"
          />
        </picture>

        <div className="section2-inner">
          <div className="section2-title">SS26</div>

          <div className="section2-mobile-content">
            <div className="section2-text">
              Timeless Elegance,<br />
              Playfully Refined.
            </div>

            <a href="https://dev.fyvelondon.com/products?category=ss26" className="section1-shop-button section2-shop-button">
              Shop Collection
              <img src="/assets/FYVE-button-Arrow-Icon-white.svg" alt="" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home