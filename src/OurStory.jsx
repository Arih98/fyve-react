import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './OurStory.css';

gsap.registerPlugin(ScrollTrigger);

const title = 'Our Story';

const OurStory = () => {
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        gsap.set('.our-story-reveal, .our-story-title-char, .our-story-hero-line, .our-story-signature', {
          opacity: 1,
          y: 0,
          rotateX: 0
        });
        return;
      }

      gsap.set('.our-story-title-char', {
        yPercent: 110,
        rotateX: -70,
        transformOrigin: '50% 100%',
        opacity: 0
      });

      gsap.set('.our-story-hero-line', {
        y: 34,
        opacity: 0
      });

      gsap.set('.our-story-reveal', {
        y: 48,
        opacity: 0
      });

      gsap.set('.our-story-signature', {
        y: 28,
        opacity: 0
      });

      const intro = gsap.timeline({
        defaults: {
          ease: 'power3.out'
        }
      });

      intro
        .to('.our-story-title-char', {
          yPercent: 0,
          rotateX: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.045
        })
        .to('.our-story-hero-line', {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.12
        }, '-=0.45');

      gsap.utils.toArray('.our-story-reveal').forEach((item) => {
        gsap.to(item, {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 82%',
            once: true
          }
        });
      });

      gsap.to('.our-story-signature', {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.our-story-signature',
          start: 'top 88%',
          once: true
        }
      });

      gsap.to('.our-story-bg-word', {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.our-story-page',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      gsap.to('.our-story-thread', {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.our-story-content',
          start: 'top 70%',
          end: 'bottom 70%',
          scrub: true
        }
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="our-story-page" ref={pageRef}>
      <div className="our-story-bg-word" aria-hidden="true">FYVE</div>

      <section className="our-story-hero">
        <div className="our-story-shell">
          <p className="our-story-kicker">FYVE London</p>

          <h1 className="our-story-title" aria-label={title}>
            {title.split('').map((char, index) => (
              <span className="our-story-title-char-wrap" key={`${char}-${index}`}>
                <span className="our-story-title-char">{char === ' ' ? '\u00A0' : char}</span>
              </span>
            ))}
          </h1>

          <div className="our-story-hero-copy">
            <p className="our-story-hero-line">Ever since I can remember, I’ve been passionate</p>
            <p className="our-story-hero-line">about design, especially children’s fashion.</p>
            <p className="our-story-hero-line">There’s something truly magical about watching</p>
            <p className="our-story-hero-line">a sketch transform into a piece that brings joy</p>
            <p className="our-story-hero-line">to little ones and their families.</p>
          </div>
        </div>
      </section>

      <section className="our-story-content">
        <div className="our-story-shell our-story-content-shell">
          <div className="our-story-thread-wrap" aria-hidden="true">
            <div className="our-story-thread" />
          </div>

          <article className="our-story-card our-story-reveal">
            <span className="our-story-card-number">01</span>
            <p>
              But my greatest inspiration, and my most important role, is being a mom to my five incredible children. That’s where FYVE began, born from the love, chaos, and wonder of raising my own little crew.
            </p>
          </article>

          <article className="our-story-card our-story-reveal">
            <span className="our-story-card-number">02</span>
            <p>
              Like so many of you, I know the daily juggle of balancing work and motherhood is no small feat. It’s a dance I’m still perfecting every day! That’s why I’ve built FYVE not just as a fashion brand, but as a celebration of motherhood, the highs, the challenges, and everything in between.
            </p>
          </article>

          <article className="our-story-card our-story-reveal">
            <span className="our-story-card-number">03</span>
            <p>
              Our clothes are crafted with quality and comfort in mind, using soft, durable fabrics that kids can move in freely, designed to keep up with their energy and spark their joy, all while embracing a British, timeless classical style that never goes out of fashion.
            </p>
          </article>

          <article className="our-story-card our-story-reveal">
            <span className="our-story-card-number">04</span>
            <p>
              I’ve also chosen to partner with other mom-led businesses because I believe we’re stronger together. Supporting each other is at the core of what we do.
            </p>
          </article>

          <article className="our-story-card our-story-reveal">
            <span className="our-story-card-number">05</span>
            <p>
              We’re so excited for you to join the FYVE family! We’d love to hear your feedback and see pictures of your little ones wearing our designs. Your stories and moments mean the world to us.
            </p>
          </article>

          <div className="our-story-signature">
            <span>With love,</span>
            <strong>Hannah x</strong>
          </div>
        </div>
      </section>
    </main>
  );
};

export default OurStory;