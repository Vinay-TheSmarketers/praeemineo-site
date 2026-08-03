import { useLayoutEffect, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ValuePrismStage } from "./ValuePrismStage.jsx";
import { FluidCanvas } from "./FluidCanvas.jsx";

// Import motion initializers
import { initSmoothScroll } from "./js/core/smooth-scroll.js";
import { initScrollMatrix } from "./js/core/scroll-matrix.js";
import { initPointerParallax } from "./js/core/pointer-parallax.js";
import { initTextReveal } from "./js/core/text-reveal.js";
import { initPrism } from "./js/components/prism.js";


gsap.registerPlugin(ScrollTrigger);

const stages = [
  ["core", "The Core"],
  ["standard", "The Standard"],
  ["people", "People Pillar"],
  ["business", "Business Pillar"],
  ["customer", "Customer Pillar"],
  ["process", "The Process"],
  ["behaviors", "Nine Behaviors"],
  ["full-prism", "Full ValuePrism"],
];

const methodNodes = [
  ["01", "Governance & leadership"],
  ["02", "Be fair & ethical"],
  ["03", "Be a value add"],
  ["04", "Training & communications"],
  ["05", "Learning & encouraging"],
  ["06", "Customer focused"],
  ["07", "Result focused"],
  ["08", "Outstanding service"],
  ["09", "Continuous improvement"],
];

function FlowTitle({ lines }) {
  return lines.map((line) => (
    <span className="flow-line" key={line}><span>{line}</span></span>
  ));
}

function StoryMoment({ id, number, eyebrow, titleLines, children, align = "left", className = "" }) {
  return (
    <section id={id} className={`moment align-${align} ${className}`} data-stage={number}>
      <div className="story-card">
        <div className="story-index"><span>{number}</span><i /><span>{eyebrow}</span></div>
        <h2><FlowTitle lines={titleLines} /></h2>
        {children}
      </div>
    </section>
  );
}

export function App() {
  const rootRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStage, setActiveStage] = useState(0);
  const [inValuePrism, setInValuePrism] = useState(false);

  // Preloader Logic
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setIsLoading(false);
      document.body.classList.remove("loading");
      return;
    }

    document.body.classList.add("loading");
    gsap.set(".pl-lines line", { opacity: 0 });
    gsap.set(".pl-mark", { opacity: 0, scale: 0.6, transformOrigin: "center" });
    gsap.set(".pl-line", { opacity: 0 });

    const pctEl = document.querySelector(".preloader-pct");
    const pctState = { v: 0 };
    gsap.to(pctState, {
      v: 100,
      duration: 2.15,
      ease: "power1.inOut",
      onUpdate: () => {
        if (pctEl) pctEl.textContent = String(Math.round(pctState.v)).padStart(2, "0") + "%";
      }
    });

    const lineTl = gsap.timeline();
    document.querySelectorAll(".pl-line").forEach((el, i) => {
      lineTl.to(el, { opacity: 1, duration: 0.2 }, i * 0.45)
            .to(el, { opacity: 0, duration: 0.2 }, i * 0.45 + 0.32);
    });

    const tl = gsap.timeline({
      onComplete: () => {
        setIsLoading(false);
        document.body.classList.remove("loading");
        ScrollTrigger.refresh();
      },
      defaults: { ease: "power2.inOut" }
    });

    tl.to(".pl-lines line", { opacity: 0.85, duration: 0.45, stagger: 0.06 })
      .to(".pl-mark", { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.6)" }, "+=0.9")
      .to(".preloader-flash", { opacity: 1, duration: 0.12 })
      .to(".preloader-flash", { opacity: 0, duration: 0.3 })
      .to("#preloader", { yPercent: -100, duration: 0.7, ease: "power3.inOut" }, "-=.05");

    const timeout = setTimeout(() => {
      setIsLoading(false);
      document.body.classList.remove("loading");
      ScrollTrigger.refresh();
    }, 6000);

    return () => clearTimeout(timeout);
  }, []);

  // Motion Initializations & ScrollTriggers
  useLayoutEffect(() => {
    if (isLoading) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      // 1. Reading Progress bar across page
      gsap.to(".reading-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".site-shell",
          start: "top top",
          end: "bottom bottom",
          scrub: true
        },
      });

      // 2. Track ValuePrism moments active stage
      gsap.utils.toArray(".valueprism-section .moment").forEach((moment, index) => {
        ScrollTrigger.create({
          trigger: moment,
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => self.isActive && setActiveStage(index),
        });
      });

      // 3. Track if we are inside the ValuePrism section
      ScrollTrigger.create({
        trigger: ".valueprism-section",
        start: "top 120px",
        end: "bottom 80%",
        onToggle: (self) => setInValuePrism(self.isActive),
      });

      // 4. Hero text reveal — single professional group entrance
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .fromTo(".hero .kicker", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .6 })
        .fromTo(".hero .headline", { autoAlpha: 0, y: 24, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .9 }, "-=.3")
        .fromTo(".hero-sub", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .7 }, "-=.5")
        .fromTo(".hero-cta", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .6 }, "-=.35")
        .fromTo(".hero-meta > div", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .06 }, "-=.25");

      // 5. Scroll-based animations (skip if user prefers reduced motion)
      if (!reducedMotion) {
        // ValuePrism moments card reveals
        gsap.utils.toArray(".valueprism-section .story-card").forEach((card) => {
          const revealTargets = card.querySelectorAll(".story-index, .flow-line > span, .story-card > p, .micro-proof, .text-loop, .behavior-proof, blockquote, .replay-link");
          gsap.fromTo(revealTargets, {
            opacity: 0,
            filter: "blur(9px)",
            clipPath: "inset(0 0 42% 0)",
          }, {
            opacity: 1,
            filter: "blur(0px)",
            clipPath: "inset(0 0 0% 0)",
            ease: "power2.out",
            stagger: .08,
            scrollTrigger: { trigger: card, start: "top 86%", end: "top 51%", scrub: .65 },
          });

          if (!card.closest(".final-moment")) {
            gsap.to(revealTargets, {
              opacity: .08,
              filter: "blur(6px)",
              clipPath: "inset(30% 0 30% 0)",
              ease: "power1.in",
              scrollTrigger: { trigger: card, start: "center 46%", end: "bottom 12%", scrub: .65 },
            });
          }
        });

        // 6. SVG Triangle Diagram animations
        const triWrap = document.querySelector(".triangle-wrap");
        if (triWrap) {
          const path = triWrap.querySelector(".tri-draw");
          const buildTl = gsap.timeline()
            .to(path, { strokeDashoffset: 0, duration: 1, ease: "none" })
            .to(".tri-vertex", { opacity: 1, scale: 1, duration: .35, stagger: .15 }, 0.1)
            .to(".tri-node", { opacity: 1, scale: 1, duration: .3, stagger: .08 }, 0.4)
            .to(".tri-center", { opacity: 1, scale: 1, duration: .4, ease: "back.out(1.5)" }, 0.85);

          ScrollTrigger.create({
            trigger: triWrap,
            start: "top 75%",
            end: "top 10%",
            scrub: .6,
            animation: buildTl
          });
        }

        // 7. ASCEND vertical bars rise
        gsap.to(".ascend-bar", {
          scaleY: 1,
          duration: .8,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".ascend-bars", start: "top 85%" }
        });

        // 8. ASCEND letters drop-in
        gsap.fromTo(".ascend-bar .letter", {
          opacity: 0,
          y: -30,
        }, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.5)",
          stagger: 0.1,
          scrollTrigger: { trigger: ".ascend-bars", start: "top 85%" }
        });

        // 9. ASCEND grid cards stagger entrance
        gsap.fromTo(".ascend-card", {
          opacity: 0,
          y: 40,
          rotationX: -10,
        }, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: ".ascend-grid", start: "top 92%" }
        });
      }

      // Initialize secondary motion engines
      initSmoothScroll(gsap, ScrollTrigger).then(() => ScrollTrigger.refresh());
      initScrollMatrix(gsap, ScrollTrigger);
      initTextReveal(gsap, ScrollTrigger);
      const cleanupPointer = initPointerParallax(gsap);
      const cleanupPrism = initPrism(gsap, ScrollTrigger, reducedMotion);

      return () => {
        cleanupPointer();
        cleanupPrism();
      };
    }, rootRef);

    return () => context.revert();
  }, [isLoading]);

  const jumpTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div ref={rootRef} className="site-shell">
      {isLoading && (
        <div id="preloader" aria-hidden="true">
          <svg viewBox="0 0 240 240" width="150" height="150">
            <g className="pl-lines" stroke="#B08D3F" strokeWidth="1" fill="none">
              <line x1="0" y1="36" x2="240" y2="36"/>
              <line x1="0" y1="102" x2="240" y2="102"/>
              <line x1="0" y1="168" x2="240" y2="168"/>
              <line x1="36" y1="0" x2="36" y2="240"/>
              <line x1="102" y1="0" x2="102" y2="240"/>
              <line x1="168" y1="0" x2="168" y2="240"/>
            </g>
            <polygon className="pl-mark" points="120,66 174,120 120,174 66,120" fill="none" stroke="#3355FF" strokeWidth="1.5"/>
          </svg>
          <div className="preloader-pct">00%</div>
          <div className="preloader-insights">
            <div className="pl-line">MAPPING LANDSCAPE DEPENDENCIES</div>
            <div className="pl-line">RECONCILING MASTER DATA OBJECTS</div>
            <div className="pl-line">ALIGNING TO FIT-TO-STANDARD</div>
            <div className="pl-line">PROVISIONING MIGRATION WORKSPACE</div>
          </div>
          <div className="preloader-flash"></div>
        </div>
      )}

      {/* Floating brand prism signature */}
      <div className="prism-stage" aria-hidden="true" style={{ opacity: inValuePrism ? 0 : 0.65, pointerEvents: "none", transition: "opacity 0.4s ease" }}>
        <div className="prism"></div>
      </div>

      <header className="site-header">
        <button className="wordmark" onClick={() => jumpTo("hero")} aria-label="Back to top">
          PRAE<span>·</span>EMINEO
        </button>
        <nav className="top-nav" aria-label="Main Navigation">
          <button onClick={() => jumpTo("practice")}>Practice</button>
          <button onClick={() => jumpTo("methodology")}>Methodology</button>
          <button onClick={() => jumpTo("ascend")}>ASCEND</button>
          <button onClick={() => jumpTo("industries")}>Industries</button>
          <button onClick={() => jumpTo("evidence")}>Evidence</button>
        </nav>

        {/* Dynamic Methodology progress HUD in header */}
        <div className={`stage-status ${inValuePrism ? "visible" : ""}`} aria-live="polite" style={{ opacity: inValuePrism ? 1 : 0, transition: "opacity 0.4s ease" }}>
          <span>{String(activeStage + 1).padStart(2, "0")}</span> / 08 · {stages[activeStage][1]}
        </div>

        <button className="full-prism-link" onClick={() => jumpTo(inValuePrism ? "full-prism" : "contact")}>
          <span className="full-desktop-label">{inValuePrism ? "Full Prism" : "Book consultation"}</span>
          <span className="full-mobile-label">{inValuePrism ? "Prism" : "Book"}</span>
          <i>↗</i>
        </button>
        <i className="reading-progress" aria-hidden="true" />
      </header>

      <main>
        {/* HERO SECTION */}
        <section id="hero" className="hero exhibit">
          <FluidCanvas />
          <div className="hero-veil"></div>
          <div className="spine"></div>
          <div className="wrap">
            <div className="kicker">EX. 01 — THESIS</div>
            <h1 className="headline" data-split-reveal>ECC won't get you to 2030. <em>Neither will a lift-and-shift.</em></h1>
            <p className="hero-sub">Moving to the cloud without changing your processes simply moves your legacy debt to a more expensive server. We run S/4HANA and RISE with SAP transformations that audit, refactor, and streamline the decades of custom workarounds quietly accumulated in your ECC estate.</p>
            <div className="hero-cta">
              <button className="btn btn-primary" onClick={() => jumpTo("contact")}>Book a consultation</button>
              <button className="btn btn-ghost" onClick={() => jumpTo("methodology")}>See how we migrate</button>
            </div>
            <div className="hero-meta">
              <div><b>2027</b>mainstream ECC maintenance ends</div>
              <div><b>200+</b>S/4HANA go-lives led</div>
              <div><b>1</b>partner accountable end to end</div>
            </div>
          </div>
        </section>

        {/* MARQUEE SECTORS */}
        <div className="sectors">
          <div className="wrap">
            <div className="sectors-label">SAP landscapes across</div>
            <div className="marquee">
              <div className="marquee-track">
                <span>Discrete Manufacturing</span>
                <span>Automotive</span>
                <span>Chemical &amp; Process</span>
                <span>CPG &amp; Food and Beverage</span>
                <span>Life Sciences &amp; Healthcare</span>
                <span>Retail</span>
                <span>Wholesale Distribution</span>
                <span>Utilities &amp; Energy</span>
                <span>Discrete Manufacturing</span>
                <span>Automotive</span>
                <span>Chemical &amp; Process</span>
                <span>CPG &amp; Food and Beverage</span>
                <span>Life Sciences &amp; Healthcare</span>
                <span>Retail</span>
                <span>Wholesale Distribution</span>
                <span>Utilities &amp; Energy</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRACTICE DISCIPLES */}
        <section id="practice" className="exhibit">
          <div className="spine"></div>
          <div className="wrap">
            <div className="exhibit-label">EX. 02 — HOW WE'RE BUILT</div>
            <div className="section-head reveal">
              <h2 className="section-title" data-split-reveal>Two disciplines. One accountable team.</h2>
              <p className="section-desc">System integrators hand you a project plan. Hyperscalers hand you infrastructure. We stay until finance closes the books on the new system without a workaround in sight.</p>
            </div>

            <div className="disciplines reveal depth-stage">
              <div className="discipline" data-scroll-x="-50" data-scroll-y="30" data-scroll-z="-40" data-scroll-rotate="-5" data-scroll-rotate-axis="y">
                <span className="num">01 / PROCESS</span>
                <h3>The case for what changes</h3>
                <p>Before a single table converts, we map which processes are riding on twenty years of ECC customization — and which of that customization is actually load-bearing.</p>
                <ul>
                  <li>Fit-to-standard assessment against SAP Best Practices</li>
                  <li>Custom code and Z-table rationalization</li>
                  <li>Business case tied to RISE with SAP licensing</li>
                </ul>
              </div>
              <div className="discipline" data-scroll-x="50" data-scroll-y="30" data-scroll-z="-40" data-scroll-rotate="5" data-scroll-rotate-axis="y">
                <span className="num">02 / PLATFORM</span>
                <h3>The system that stays up</h3>
                <p>We run the technical migration itself — conversion, cloud landscape, and the integrations that quietly kept ECC alive for two decades.</p>
                <ul>
                  <li>Brownfield, greenfield, or selective data transition</li>
                  <li>BTP integration and Business AI (Joule) enablement</li>
                  <li>Cutover, hypercare, and managed operations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* METHODOLOGY: 3D VALUEPRISM PINNED STORY */}
        <section id="methodology" className="valueprism-section">
          <div className="valueprism-sticky">
            <div className="scene-stage">
              <ValuePrismStage />
              <div className="stage-atmosphere" aria-hidden="true" />
              <div className="scene-interface" aria-hidden="true">
                <div className="core-badge">CULTURE OF<br />ETHICS &amp; COMPLIANCE</div>
                <span className="prism-label label-people">People</span>
                <span className="prism-label label-business">Business</span>
                <span className="prism-label label-customer">Customer</span>
                <span className="process-pill pill-design">Design</span>
                <span className="process-pill pill-assess">Assess</span>
                <span className="process-pill pill-implement">Implement</span>
                {methodNodes.map(([number, label], index) => (
                  <span key={number} className={`method-node node-${index + 1}`}><b>{number}</b><em>{label}</em></span>
                ))}
              </div>
            </div>
          </div>

          <div className="scroll-flow">
            <section id="core" className="moment hero-moment" data-stage="01">
              <div className="hero-copy">
                <p className="hero-eyebrow">VALUEPRISM™ METHODOLOGY</p>
                <h1><span className="hero-flow-line"><span>Realize value</span></span><span className="hero-flow-line muted"><span>from the inside out.</span></span></h1>
                <p className="hero-subtitle">A culture of ethics and compliance,<br />refracted through everything you do.</p>
              </div>
              <button className="hero-action" onClick={() => jumpTo("standard")}><span>✦</span> Enter the Core</button>
              <div className="hero-footnote"><span>ETHICS</span><span>PEOPLE</span><span>PERFORMANCE</span><span>CUSTOMER</span></div>
            </section>

            <StoryMoment id="standard" number="02" eyebrow="The Standard" titleLines={["Everything begins", "with what cannot bend."]} align="left">
              <p>The core problem in SAP migrations is process drift and shortcut compliance. True value starts by locking in a clean core: clear rules, bulletproof access control, and compliance embedded in the database schema itself.</p>
            </StoryMoment>

            <StoryMoment id="people" number="03" eyebrow="People" titleLines={["Value starts with", "how people are treated."]} align="right" className="pillar-moment people-moment">
              <p>Even the most advanced cloud architecture fails if users find it too complex. We eliminate shadow workarounds and spreadsheets by training, aligning, and empowering teams to adopt the system natively.</p>
              <span className="micro-proof">THE HUMAN FACE OF VALUE</span>
            </StoryMoment>

            <StoryMoment id="business" number="04" eyebrow="Business" titleLines={["Delivery earns trust", "when discipline is visible."]} align="left" className="pillar-moment business-moment">
              <p>Operational leakage occurs when performance metrics are decoupled from system integrity. We implement real-time process mining, clear KPI dashboards, and structured governance to ensure your RISE investment returns positive cash flow.</p>
              <span className="micro-proof">THE OPERATING FACE OF VALUE</span>
            </StoryMoment>

            <StoryMoment id="customer" number="05" eyebrow="Customer" titleLines={["Partnership becomes", "a value multiplier."]} align="right" className="pillar-moment customer-moment">
              <p>Migrations shouldn't interrupt your supply chain or order execution. We secure external touchpoints, optimize logistics integrations, and enable smooth B2B self-service portals to compound relational value.</p>
              <span className="micro-proof">THE RELATIONAL FACE OF VALUE</span>
            </StoryMoment>

            <StoryMoment id="process" number="06" eyebrow="The Process" titleLines={["Assess. Design.", "Implement. Repeat."]} align="left" className="process-moment">
              <p>The methodology stays alive because it never closes. Every implementation creates the evidence for the next assessment.</p>
              <div className="text-loop"><span>ASSESS</span><i>→</i><span>DESIGN</span><i>→</i><span>IMPLEMENT</span></div>
            </StoryMoment>

            <StoryMoment id="behaviors" number="07" eyebrow="Nine behaviors" titleLines={["Broad principles.", "Observable practice."]} align="right" className="behavior-moment">
              <p>Nine waypoints connect intention to action—from governance and leadership to outstanding service and continuous improvement.</p>
              <div className="behavior-proof"><span>01—03</span> Lead with integrity <span>04—06</span> Build capability <span>07—09</span> Improve outcomes</div>
            </StoryMoment>

            <StoryMoment id="full-prism" number="08" eyebrow="The Full ValuePrism" titleLines={["One core.", "One living system."]} align="left" className="final-moment">
              <p>The core sets the standard. The pillars focus the work. The orbit keeps value moving. Together, culture becomes performance people can feel.</p>
              <blockquote>Value, realized from the inside out.</blockquote>
              <button className="replay-link" onClick={() => jumpTo("core")}>Replay the build <span>↗</span></button>
            </StoryMoment>
          </div>
        </section>

        {/* THE ASCEND METHOD: SVG TRIANGLE DIAGRAM */}
        <section id="ascend" className="exhibit">
          <div className="spine"></div>
          <div className="wrap">
            <div className="exhibit-label">EX. 03 — METHODOLOGY</div>
            <div className="section-head reveal">
              <h2 className="section-title" data-split-reveal>One accountable loop, not a stack of workstreams.</h2>
              <p className="section-desc">Every engagement runs through the same cycle — Process, Platform, and People pulling toward a single point of accountability.</p>
            </div>

            <div className="triangle-wrap reveal">
              <svg className="triangle-diagram" viewBox="0 0 400 380" xmlns="http://www.w3.org/2000/svg">
                <path d="M200,20 L380,340 L20,340 Z"/>
                <path className="tri-draw" d="M200,20 L380,340 L20,340 Z"/>
              </svg>
              <div className="tri-vertex" style={{ left: "50%", top: "5.3%" }}>DESIGN</div>
              <div className="tri-vertex" style={{ left: "5%", top: "89.5%" }}>ASSESS</div>
              <div className="tri-vertex" style={{ left: "95%", top: "89.5%" }}>DELIVER</div>

              <div className="tri-node" style={{ left: "35%", top: "33.4%" }}><span>01</span>Landscape Audit</div>
              <div className="tri-node" style={{ left: "65%", top: "33.4%" }}><span>02</span>Executive Alignment</div>
              <div className="tri-node" style={{ left: "80%", top: "61.5%" }}><span>03</span>Fit-to-Standard Design</div>
              <div className="tri-node" style={{ left: "65%", top: "89.5%" }}><span>04</span>Integration Governance</div>
              <div className="tri-node" style={{ left: "35%", top: "89.5%" }}><span>05</span>Change Adoption</div>
              <div className="tri-node" style={{ left: "20%", top: "61.5%" }}><span>06</span>Hypercare &amp; Tuning</div>

              <div className="tri-center">SINGLE POINT<br/>OF<br/>ACCOUNTABILITY</div>

              <div className="tri-side" style={{ left: "22%", top: "47%", transform: "rotate(-58deg)" }}>PEOPLE</div>
              <div className="tri-side" style={{ left: "78%", top: "47%", transform: "rotate(58deg)" }}>PLATFORM</div>
              <div className="tri-side" style={{ left: "50%", top: "97%", transform: "translateX(-50%)" }}>PROCESS</div>
            </div>

            <div className="ascend-wrap">
              <div className="ascend-head reveal">
                <div className="exhibit-label">THE ASCEND METHOD</div>
                <h3 className="ascend-title" data-split-reveal>Six steps from legacy ECC to a system people trust.</h3>
              </div>

              <div className="ascend-bars">
                <div className="ascend-item">
                  <div className="ascend-bar"><span className="letter">A</span></div>
                  <div className="ascend-item-label">ASSESS</div>
                </div>
                <div className="ascend-item">
                  <div className="ascend-bar"><span className="letter">S</span></div>
                  <div className="ascend-item-label">STREAMLINE</div>
                </div>
                <div className="ascend-item">
                  <div className="ascend-bar"><span className="letter">C</span></div>
                  <div className="ascend-item-label">CONVERT</div>
                </div>
                <div className="ascend-item">
                  <div className="ascend-bar"><span className="letter">E</span></div>
                  <div className="ascend-item-label">EMBED</div>
                </div>
                <div className="ascend-item">
                  <div className="ascend-bar"><span className="letter">N</span></div>
                  <div className="ascend-item-label">NAVIGATE</div>
                </div>
                <div className="ascend-item">
                  <div className="ascend-bar"><span className="letter">D</span></div>
                  <div className="ascend-item-label">DELIVER</div>
                </div>
              </div>

              <div className="ascend-grid depth-stage">
                <div className="ascend-card" data-scroll-x="-20" data-scroll-z="-15" data-scroll-rotate="-3" data-scroll-rotate-axis="x"><span className="letter-tag">A</span><h4>Assess</h4><p>Landscape and custom-code audit against your current ECC or S/4HANA environment, ranked by conversion complexity.</p></div>
                <div className="ascend-card" data-scroll-x="20" data-scroll-z="-15" data-scroll-rotate="3" data-scroll-rotate-axis="x"><span className="letter-tag">S</span><h4>Streamline</h4><p>Fit-to-standard redesign of the processes still riding on twenty years of workarounds.</p></div>
                <div className="ascend-card" data-scroll-x="-20" data-scroll-z="-15" data-scroll-rotate="-3" data-scroll-rotate-axis="x"><span className="letter-tag">C</span><h4>Convert</h4><p>Core system build and data migration, tested against your real transaction volumes.</p></div>
                <div className="ascend-card" data-scroll-x="20" data-scroll-z="-15" data-scroll-rotate="3" data-scroll-rotate-axis="x"><span className="letter-tag">E</span><h4>Embed</h4><p>BTP integration and Business AI (Joule) wired into the processes that need it, not bolted on after.</p></div>
                <div className="ascend-card" data-scroll-x="-20" data-scroll-z="-15" data-scroll-rotate="-3" data-scroll-rotate-axis="x"><span className="letter-tag">N</span><h4>Navigate</h4><p>Change management and training so the new system gets adopted, not quietly routed around.</p></div>
                <div className="ascend-card" data-scroll-x="20" data-scroll-z="-15" data-scroll-rotate="3" data-scroll-rotate-axis="x"><span className="letter-tag">D</span><h4>Deliver</h4><p>Cutover, hypercare, and a managed operations model your team can run without us.</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* INDUSTRIES GRID */}
        <section id="industries" className="exhibit">
          <div className="spine"></div>
          <div className="wrap">
            <div className="exhibit-label">EX. 04 — INDUSTRIES</div>
            <div className="section-head reveal">
              <h2 className="section-title" data-split-reveal>Depth in the industries that run on SAP.</h2>
              <p className="section-desc">Pre-built accelerators and fit-to-standard playbooks for the eight sectors where we operate.</p>
            </div>

            <div className="industry-grid reveal depth-stage">
              <div className="industry-card" data-scroll-x="-30" data-scroll-y="20" data-scroll-z="-25" data-scroll-rotate="-4">
                <h3>Discrete Manufacturing</h3>
                <p>One system of record from engineering change to the shop floor — no shadow spreadsheets closing the gap.</p>
              </div>
              <div className="industry-card" data-scroll-x="26" data-scroll-y="-14" data-scroll-z="-40" data-scroll-rotate="3">
                <h3>Automotive</h3>
                <p>EDI and JIT/JIS sequencing that stays in lock-step with the OEM, even when the release schedule moves overnight.</p>
              </div>
              <div className="industry-card" data-scroll-x="-22" data-scroll-y="28" data-scroll-z="-18" data-scroll-rotate="-3">
                <h3>Chemical &amp; Process</h3>
                <p>Batch and recipe management that holds up to regulatory audit, formula by formula.</p>
              </div>
              <div className="industry-card" data-scroll-x="32" data-scroll-y="-18" data-scroll-z="-32" data-scroll-rotate="4">
                <h3>CPG &amp; Food and Beverage</h3>
                <p>Trade spend and lot traceability visible enough to defend a recall in under an hour.</p>
              </div>
              <div className="industry-card" data-scroll-x="-28" data-scroll-y="16" data-scroll-z="-22" data-scroll-rotate="-3">
                <h3>Life Sciences &amp; Healthcare</h3>
                <p>GxP-validated builds, run by a team that has actually sat through the qualification.</p>
              </div>
              <div className="industry-card" data-scroll-x="24" data-scroll-y="-22" data-scroll-z="-38" data-scroll-rotate="3">
                <h3>Retail</h3>
                <p>Seasonal assortment and pricing decisions made on this week's data, not last quarter's.</p>
              </div>
              <div className="industry-card" data-scroll-x="-34" data-scroll-y="20" data-scroll-z="-24" data-scroll-rotate="-4">
                <h3>Wholesale Distribution</h3>
                <p>Freight, fulfillment speed, and customer-specific pricing reconciled on one P&amp;L.</p>
              </div>
              <div className="industry-card" data-scroll-x="28" data-scroll-y="-16" data-scroll-z="-30" data-scroll-rotate="3">
                <h3>Utilities &amp; Energy</h3>
                <p>Asset-heavy maintenance and plant reliability, engineered into EAM from day one.</p>
              </div>
            </div>
          </div>
        </section>

        {/* EVIDENCE CARDS */}
        <section id="evidence" className="exhibit">
          <div className="spine"></div>
          <div className="wrap">
            <div className="parallax-num" aria-hidden="true" data-scroll-y="-40" data-scroll-z="-20">06</div>
            <div className="exhibit-label">EX. 05 — EVIDENCE</div>
            <div className="section-head reveal">
              <h2 className="section-title" data-split-reveal>Notes from the landscape.</h2>
              <p className="section-desc">Short, specific writing on what actually breaks in an S/4HANA migration — and what to fix before it does.</p>
            </div>

            <div className="evidence-grid reveal depth-stage">
              <div className="card" data-scroll-x="-36" data-scroll-z="-30" data-scroll-rotate="-4" data-scroll-rotate-axis="y">
                <span className="tag">DEADLINE</span>
                <h3>2027 isn't a software problem, it's a budget problem</h3>
                <p>Mainstream ECC maintenance ends in 2027. Every quarter a business waits is a quarter closer to a forced migration on someone else's timeline, at someone else's price.</p>
                <div className="read">6 min read</div>
              </div>
              <div className="card" data-scroll-y="26" data-scroll-z="-46">
                <span className="tag">CUSTOM CODE</span>
                <h3>The Z-table nobody remembers writing still runs payroll</h3>
                <p>Most ECC estates carry a decade of custom code no one can explain anymore. A clean conversion has to decide, table by table, what's load-bearing and what's just debt.</p>
                <div className="read">5 min read</div>
              </div>
              <div className="card" data-scroll-x="36" data-scroll-z="-30" data-scroll-rotate="4" data-scroll-rotate-axis="y">
                <span className="tag">RISE WITH SAP</span>
                <h3>RISE changes the contract, not just the hosting</h3>
                <p>Moving to RISE with SAP resets the commercial relationship as much as the technical one. The migrations that go well treat it as both from day one.</p>
                <div className="read">7 min read</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA CONTACT */}
        <section className="cta-band" id="contact">
          <div className="wrap reveal">
            <div className="row">
              <h2 data-split-reveal>Start with Phase 01 of ASCEND — the landscape audit.</h2>
              <div className="side">Book a 30-minute working session with a partner. We'll map your industry's fit-to-standard accelerators and tell you, within a week, what your ASCEND path actually costs.</div>
            </div>
            <div className="hero-cta">
              <button className="btn btn-primary" onClick={() => jumpTo("contact")}>Book a consultation</button>
              <button className="btn btn-ghost" onClick={() => jumpTo("industries")}>See your industry</button>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="footer-top">
            <div className="logo">PRAE<span>·</span>EMINEO</div>
            <div className="footer-cols">
              <div className="footer-col">
                <h5>FIRM</h5>
                <button onClick={() => jumpTo("practice")}>Practice</button>
                <button onClick={() => jumpTo("industries")}>Industries</button>
                <button onClick={() => jumpTo("methodology")}>Methodology</button>
                <button onClick={() => jumpTo("evidence")}>Evidence</button>
                <button>Careers</button>
              </div>
              <div className="footer-col">
                <h5>SECTORS</h5>
                <button onClick={() => jumpTo("industries")}>Manufacturing</button>
                <button onClick={() => jumpTo("industries")}>Retail &amp; CPG</button>
                <button onClick={() => jumpTo("industries")}>Utilities &amp; Energy</button>
                <button onClick={() => jumpTo("industries")}>Public Sector</button>
              </div>
              <div className="footer-col">
                <h5>CONTACT</h5>
                <button onClick={() => jumpTo("contact")}>Book consultation</button>
                <button>Press</button>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 Praeemineo. All rights reserved.</span>
            <span>Privacy &middot; Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
