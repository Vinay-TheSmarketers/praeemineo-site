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
  ["01", "Governance and Leadership"],
  ["02", "Be Fair and Ethical"],
  ["03", "Be a Value Add for our Clients"],
  ["04", "Training and Communications"],
  ["05", "Learning and Encouraging"],
  ["06", "Customer Focused"],
  ["07", "Result Focused"],
  ["08", "Outstanding Customer Service"],
  ["09", "Continuous Improvement"],
];

const practices = [
  {
    num: "01",
    tag: "ValuePrism™ Design + Implement",
    title: "Implementation Services",
    desc: "Stand up SAP the right way the first time.",
    link: "#contact"
  },
  {
    num: "02",
    tag: "ValuePrism™ Transform",
    title: "Process Optimization",
    desc: "Make the SAP you already own work harder.",
    link: "#contact"
  },
  {
    num: "03",
    tag: "ValuePrism™ Migrate",
    title: "Upgrades & Migrations",
    desc: "S/4HANA before 2027 — without the drama.",
    link: "#contact"
  },
  {
    num: "04",
    tag: "ValuePrism™ Manage",
    title: "Application Managed Services",
    desc: "SAP that runs while you sleep — and improves while it runs.",
    link: "#contact"
  }
];

const staticSteps = [
  { num: "01", name: "Business Process Understanding", desc: "Align technology with your strategic goals. Walk the real processes — not the documented ones." },
  { num: "02", name: "Re-engineering Assessment", desc: "Identify and transform key processes for future growth. Decide what stays, what changes, what retires." },
  { num: "03", name: "Innovation Analysis", desc: "Benchmark against industry best practices and SAP's latest capabilities to uncover opportunities for differentiation." },
  { num: "04", name: "Digitalization Strategy", desc: "Build a roadmap to maximise your SAP transformation — phased, defendable, value-aligned." },
  { num: "05", name: "Governance Framework", desc: "Ensure compliance, clear communication, and project alignment — including risk, value tracking, and stage-gate approvals." },
  { num: "06", name: "Execution Excellence", desc: "Deliver precise implementation with ongoing support and optimisation. Senior consultants, end-to-end." }
];

const industries = [
  { title: "Discrete Manufacturing", desc: "One truthful operating system from engineering to the shop floor." },
  { title: "Automotive", desc: "Stay in lock-step with the OEM — even when the forecast moves at 2 a.m." },
  { title: "Chemical Processing", desc: "Compliance-ready SAP, recipe by recipe, batch by batch." },
  { title: "CPG / Food & Beverage", desc: "Recall-ready in under an hour. Margin protected, shelf by shelf." },
  { title: "Consumer Packaged Goods", desc: "Make every dollar of trade-promotion spend visible, attributable, and accountable." },
  { title: "Health & Life Sciences", desc: "GxP-validated SAP — and a partner with hands-on regulated experience." },
  { title: "Retail & Fashion", desc: "This season's decisions, on this season's data." },
  { title: "Wholesale Distribution", desc: "Three levers, one P&L: pick speed, freight cost, customer-specific pricing." }
];

const accelerators = [
  {
    num: "01",
    name: "ScanIQ",
    tag: "Warehouse Optimization",
    desc: "Templates auto-converted to RF screens for warehouse process optimization.",
    stat: "75% faster RF onboarding",
    tech: "SAP EAM / WM / EWM"
  },
  {
    num: "02",
    name: "ClearIQ",
    tag: "Payment Reconciliation",
    desc: "Lockbox processing for payment exceptions, reconciliation, and posting.",
    stat: "99.4% auto-match rate",
    tech: "FI-CA / Treasury / BTP"
  },
  {
    num: "03",
    name: "InvoiceX",
    tag: "AP Automation & AI",
    desc: "AI-based document processing of invoices for AP automation.",
    stat: "Sub-second OCR extraction",
    tech: "SAP Document AI / Joule"
  },
  {
    num: "04",
    name: "MDG+",
    tag: "Master Data Governance",
    desc: "Framework for SAP MDG adoption with prescriptive build-and-manage.",
    stat: "Pre-built domain models",
    tech: "SAP MDG & Datasphere"
  }
];

function FlowTitle({ lines }) {
  return lines.map((line) => (
    <span className="flow-line" key={line}><span>{line}</span></span>
  ));
}

function StoryMoment({ id, number, eyebrow, title, children, align = "left", className = "" }) {
  return (
    <section id={id} className={`moment align-${align} ${className}`} data-stage={number}>
      <div className="story-card">
        <div className="story-index"><span>{number}</span><i /><span>{eyebrow}</span></div>
        <h2>{title}</h2>
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
  const [isLightMode, setIsLightMode] = useState(true); // Default to light mode (white and blue)
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [activeAccIndex, setActiveAccIndex] = useState(0);

  // Toggle theme class on document element
  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.remove("dark-mode");
      document.documentElement.classList.add("light-mode");
    } else {
      document.documentElement.classList.remove("light-mode");
      document.documentElement.classList.add("dark-mode");
    }
  }, [isLightMode]);

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
      duration: 1.8,
      ease: "power1.inOut",
      onUpdate: () => {
        if (pctEl) pctEl.textContent = String(Math.round(pctState.v)).padStart(2, "0") + "%";
      }
    });

    const lineTl = gsap.timeline();
    document.querySelectorAll(".pl-line").forEach((el, i) => {
      lineTl.to(el, { opacity: 1, duration: 0.2 }, i * 0.38)
            .to(el, { opacity: 0, duration: 0.2 }, i * 0.38 + 0.28);
    });

    const tl = gsap.timeline({
      onComplete: () => {
        setIsLoading(false);
        document.body.classList.remove("loading");
        ScrollTrigger.refresh();
      },
      defaults: { ease: "power2.inOut" }
    });

    tl.to(".pl-lines line", { opacity: 0.85, duration: 0.4, stagger: 0.05 })
      .to(".pl-mark", { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" }, "+=0.6")
      .to(".preloader-flash", { opacity: 1, duration: 0.1 })
      .to(".preloader-flash", { opacity: 0, duration: 0.25 })
      .to("#preloader", { yPercent: -100, duration: 0.6, ease: "power3.inOut" }, "-=.05");

    const timeout = setTimeout(() => {
      setIsLoading(false);
      document.body.classList.remove("loading");
      ScrollTrigger.refresh();
    }, 3500);

    return () => clearTimeout(timeout);
  }, []);

  // Motion Initializations & ScrollTriggers
  useLayoutEffect(() => {
    if (isLoading) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      // 0. Scroll reveal handler for all .reveal elements
      gsap.utils.toArray(".reveal").forEach((el) => {
        if (reducedMotion) {
          el.classList.add("in");
        } else {
          ScrollTrigger.create({
            trigger: el,
            start: "top 92%",
            onEnter: () => el.classList.add("in"),
          });
        }
      });

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
            scrollTrigger: { trigger: card, start: "top 88%", end: "top 55%", scrub: .65 },
          });

          if (!card.closest(".final-moment")) {
            gsap.to(revealTargets, {
              opacity: 0,
              filter: "blur(5px)",
              ease: "power1.inOut",
              scrollTrigger: { trigger: card, start: "top 20%", end: "top -15%", scrub: .85 },
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

        // 7. BRIDGE vertical bars rise
        gsap.to(".ascend-bar", {
          scaleY: 1,
          duration: .8,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".ascend-bars", start: "top 85%" }
        });

        // 8. BRIDGE letters drop-in
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

        // 9. BRIDGE grid cards stagger entrance
        gsap.fromTo(".ascend-card", {
          opacity: 0,
          y: 35,
          rotationX: -8,
        }, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: ".ascend-grid", start: "top 90%" }
        });

        // 10. Accelerators cards stagger
        gsap.fromTo(".accelerator-card", {
          opacity: 0,
          y: 28,
        }, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: ".accelerators-grid", start: "top 88%" }
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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput) {
      setSubscribed(true);
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
          <button onClick={() => jumpTo("practice")}>Practices</button>
          <button onClick={() => jumpTo("methodology")}>Methodology</button>
          <button onClick={() => jumpTo("industries")}>Industries</button>
          <button onClick={() => jumpTo("accelerators")}>Accelerators</button>
        </nav>

        {/* Dynamic Methodology progress HUD in header */}
        <div className={`stage-status ${inValuePrism ? "visible" : ""}`} aria-live="polite" style={{ opacity: inValuePrism ? 1 : 0, transition: "opacity 0.4s ease" }}>
          <span>{String(activeStage + 1).padStart(2, "0")}</span> / 08 · {stages[activeStage][1]}
        </div>

        <button className="theme-toggle" onClick={() => setIsLightMode(!isLightMode)} aria-label="Toggle theme">
          {isLightMode ? "☽ Dark" : "☉ Light"}
        </button>
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
          <FluidCanvas isLightMode={isLightMode} />
          <div className="hero-veil"></div>
          <div className="spine"></div>
          <div className="wrap">
            <div className="kicker">EX. 01 — THESIS</div>
            <h1 className="headline" data-split-reveal>
              <span>ECC won't get you to 2030.</span>
              <em className="highlight-em">Neither will a lift-and-shift.</em>
            </h1>
            <p className="hero-sub">Moving to the cloud without changing your processes simply moves your legacy debt to a more expensive server. We run S/4HANA and RISE with SAP transformations that audit, refactor, and streamline the decades of custom workarounds quietly accumulated in your ECC estate.</p>
            <div className="hero-cta">
              <button className="btn btn-primary" onClick={() => jumpTo("contact")}>Book a consultation ↗</button>
              <button className="btn btn-ghost" onClick={() => jumpTo("practice")}>Explore practices</button>
            </div>
            <div className="hero-meta">
              <div><b>2027</b>mainstream ECC maintenance ends</div>
              <div><b>200+</b>S/4HANA go-lives led</div>
              <div><b>1</b>partner accountable end to end</div>
            </div>
          </div>
        </section>

        {/* FOUR CORE PRACTICES SECTION */}
        <section id="practice" className="exhibit">
          <div className="spine"></div>
          <div className="wrap">
            <div className="exhibit-label">EX. 02 — FOUR PRACTICES, ONE LIFECYCLE</div>
            <div className="section-head reveal">
              <h2 className="section-title" data-split-reveal>Our Core SAP® Practices</h2>
              <p className="section-desc">Stand up, optimize, migrate, and manage SAP with senior consultants who've done it before.</p>
            </div>

            <div className="practices-grid reveal depth-stage">
              {practices.map((p) => (
                <div key={p.num} className="practice-card" data-scroll-x="-20" data-scroll-z="-15" data-scroll-rotate="-3">
                  <span className="practice-num">{p.num}</span>
                  <span className="practice-tag">{p.tag}</span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <button className="practice-link" onClick={() => jumpTo("contact")}>
                    <span>Explore practice</span>
                    <i>↗</i>
                  </button>
                </div>
              ))}
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
                <span>Chemical Processing</span>
                <span>CPG / Food &amp; Beverage</span>
                <span>Consumer Packaged Goods</span>
                <span>Health &amp; Life Sciences</span>
                <span>Retail &amp; Fashion</span>
                <span>Wholesale Distribution</span>
                <span>Discrete Manufacturing</span>
                <span>Automotive</span>
                <span>Chemical Processing</span>
                <span>CPG / Food &amp; Beverage</span>
                <span>Consumer Packaged Goods</span>
                <span>Health &amp; Life Sciences</span>
                <span>Retail &amp; Fashion</span>
                <span>Wholesale Distribution</span>
              </div>
            </div>
          </div>
        </div>

        {/* METHODOLOGY: 3D VALUEPRISM PINNED STORY */}
        <section id="methodology" className="valueprism-section">
          <div className="valueprism-sticky">
            <div className="scene-stage">
              <ValuePrismStage isLightMode={isLightMode} />
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
                <h1><span className="hero-flow-line"><span>ValuePrism™ Methodology</span></span><span className="hero-flow-line muted"><span>Realize value from the inside out.</span></span></h1>
                <p className="hero-subtitle">A value-realization framework, refracted through three pillars.</p>
              </div>
              <button className="hero-action" onClick={() => jumpTo("standard")}><span>✦</span> Enter the Core</button>
              <div className="hero-footnote"><span>ETHICS</span><span>PEOPLE</span><span>PERFORMANCE</span><span>CUSTOMER</span></div>
            </section>

            <StoryMoment id="standard" number="02" eyebrow="The Standard" title="Everything begins with a clean core that cannot bend." align="left">
              <p>The core problem in SAP migrations is process drift and shortcut compliance. True value starts by locking in a clean core: clear rules, bulletproof access control, and compliance embedded in the database schema itself.</p>
            </StoryMoment>

            <StoryMoment id="people" number="03" eyebrow="People Pillar" title="Human adoption transforms system capability into daily practice." align="right" className="pillar-moment people-moment">
              <p>How we treat our team and yours. Built on training and communications, learning and encouraging, and a culture of ethics and compliance that eliminates shadow spreadsheets.</p>
              <span className="micro-proof">THE HUMAN FACE OF VALUE</span>
            </StoryMoment>

            <StoryMoment id="business" number="04" eyebrow="Business Pillar" title="Operational discipline converts performance metrics into measurable cash flow." align="left" className="pillar-moment business-moment">
              <p>How we deliver. Built on result-focus, governance and leadership, and continuous improvement that connects system integrity directly to financial performance.</p>
              <span className="micro-proof">THE OPERATING FACE OF VALUE</span>
            </StoryMoment>

            <StoryMoment id="customer" number="05" eyebrow="Customer Pillar" title="Seamless B2B execution turns supply chain trust into a value multiplier." align="right" className="pillar-moment customer-moment">
              <p>How we partner. Built on customer focus, outstanding customer service, being fair and ethical, and being a value-add for our clients across every fulfillment touchpoint.</p>
              <span className="micro-proof">THE RELATIONAL FACE OF VALUE</span>
            </StoryMoment>

            <StoryMoment id="process" number="06" eyebrow="The Process" title="Continuous assessment, fit-to-standard design, and precise implementation." align="left" className="process-moment">
              <p>The methodology stays alive because it never closes. Every implementation creates the empirical evidence for the next stage of optimization.</p>
              <div className="text-loop"><span>ASSESS</span><i>→</i><span>DESIGN</span><i>→</i><span>IMPLEMENT</span></div>
            </StoryMoment>

            <StoryMoment id="behaviors" number="07" eyebrow="Nine Behaviors" title="Nine observable actions connecting ethical intention to operational results." align="right" className="behavior-moment">
              <p>Nine waypoints connect leadership vision to day-to-day execution—from governance and ethical practice to outstanding service and continuous improvement.</p>
              <div className="behavior-proof"><span>01—03</span> Lead with integrity <span>04—06</span> Build capability <span>07—09</span> Improve outcomes</div>
            </StoryMoment>

            <StoryMoment id="full-prism" number="08" eyebrow="The Full ValuePrism" title="One core, three pillars, one living operating system." align="left" className="final-moment">
              <p>The core sets the standard. The pillars focus the work. The orbit keeps value moving. Together, culture becomes performance people can feel.</p>
              <blockquote>Value, realized from the inside out.</blockquote>
              <button className="replay-link" onClick={() => jumpTo("core")}>Replay the build <span>↗</span></button>
            </StoryMoment>
          </div>
        </section>

        {/* STATIC 6-STEP METHODOLOGY EXECUTION */}
        <section id="execution" className="exhibit">
          <div className="spine"></div>
          <div className="wrap">
            <div className="exhibit-label">EX. 04 — METHODOLOGY EXECUTION</div>
            <div className="section-head reveal">
              <h2 className="section-title" data-split-reveal>Six steps from real-world process to measurable execution.</h2>
              <p className="section-desc">A structured, proven path connecting strategic objectives to precise technical implementation.</p>
            </div>

            <div className="steps-grid reveal depth-stage">
              {staticSteps.map((s) => (
                <div key={s.num} className="step-card">
                  <span className="step-num">{s.num}</span>
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INDUSTRIES GRID */}
        <section id="industries" className="exhibit">
          <div className="spine"></div>
          <div className="wrap">
            <div className="exhibit-label">EX. 05 — INDUSTRIES</div>
            <div className="section-head reveal">
              <h2 className="section-title" data-split-reveal>Industries</h2>
              <p className="section-desc">Industry depth, not industry tourism. Eight industries we know inside-out. Pre-built ValuePrism™ playbooks, accelerators, and audit packs — so we start halfway, not at zero.</p>
            </div>

            <div className="industry-grid reveal depth-stage">
              {industries.map((ind, idx) => (
                <div key={ind.title} className="industry-card" data-scroll-x={idx % 2 === 0 ? "-25" : "25"} data-scroll-z="-20">
                  <h3>{ind.title}</h3>
                  <p>{ind.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCT ACCELERATORS */}
        <section id="accelerators" className="exhibit">
          <div className="spine"></div>
          <div className="wrap">
            <div className="exhibit-label">EX. 06 — PROPRIETARY IP</div>
            <div className="section-head reveal">
              <h2 className="section-title" data-split-reveal>Product Accelerators</h2>
              <p className="section-desc">Our IP turns months into weeks.</p>
            </div>

            <div className="accelerators-accordion reveal">
              {accelerators.map((acc, index) => {
                const isOpen = activeAccIndex === index;
                return (
                  <div key={acc.num} className={`acc-accordion-item ${isOpen ? "open" : ""}`}>
                    <button
                      className="acc-accordion-header"
                      onClick={() => setActiveAccIndex(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                    >
                      <div className="acc-header-left">
                        <span className="acc-num">{acc.num}</span>
                        <h3>{acc.name}</h3>
                      </div>
                      <div className="acc-header-right">
                        <span className="acc-tag">{acc.tag}</span>
                        <span className="acc-toggle-icon">{isOpen ? "−" : "+"}</span>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="acc-accordion-body">
                        <p>{acc.desc}</p>
                        <div className="acc-meta">
                          <span className="acc-stat">⚡ {acc.stat}</span>
                          <span className="acc-tech">Stack: {acc.tech}</span>
                        </div>
                        <button className="acc-btn" onClick={() => jumpTo("contact")}>
                          <span>Request demo</span>
                          <i>↗</i>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA CONTACT & NEWSLETTER BAND */}
        <section className="cta-band" id="contact">
          <div className="wrap reveal">
            <div className="row">
              <h2 data-split-reveal>Ready to RISE calmly?</h2>
              <div className="side">Book a 30-min architecture review with a senior solution architect. No slideshows. Just a working session.</div>
            </div>
            <div className="hero-cta">
              <button className="btn btn-primary" onClick={() => jumpTo("contact")}>Book a review ↗</button>
              <button className="btn btn-ghost" onClick={() => jumpTo("industries")}>See customer stories</button>
            </div>

            {/* Stay Informed Newsletter Section */}
            <div className="stay-informed-box">
              <div className="stay-informed-text">
                <h3>Stay informed</h3>
                <p>Practical SAP perspectives, written by people who deliver them.</p>
              </div>
              <form onSubmit={handleSubscribe} className="subscribe-form">
                {subscribed ? (
                  <div className="subscribe-success">✓ Thank you for subscribing!</div>
                ) : (
                  <>
                    <input
                      type="email"
                      required
                      placeholder="Enter your work email..."
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="subscribe-input"
                    />
                    <button type="submit" className="btn btn-primary subscribe-btn">Subscribe</button>
                  </>
                )}
              </form>
            </div>
            <p className="privacy-disclaimer">By subscribing you agree to our Privacy Policy.</p>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="logo">PRAE<span>·</span>EMINEO</div>
              <p className="footer-tagline">Senior, partner-led SAP firm for manufacturing-anchored mid-market clients.</p>
            </div>
            <div className="footer-cols">
              <div className="footer-col">
                <h5>SERVICES</h5>
                <button onClick={() => jumpTo("practice")}>Implementation Services</button>
                <button onClick={() => jumpTo("practice")}>Process Optimization</button>
                <button onClick={() => jumpTo("practice")}>Upgrades &amp; Migrations</button>
                <button onClick={() => jumpTo("practice")}>Application Managed Services</button>
              </div>
              <div className="footer-col">
                <h5>SOLUTIONS</h5>
                <button onClick={() => jumpTo("practice")}>RISE with SAP</button>
                <button onClick={() => jumpTo("practice")}>GROW with SAP</button>
                <button onClick={() => jumpTo("practice")}>S/4HANA Migration</button>
                <button onClick={() => jumpTo("practice")}>SAP Business AI &amp; Joule</button>
                <button onClick={() => jumpTo("practice")}>SAP BTP &amp; Datasphere</button>
                <button onClick={() => jumpTo("accelerators")}>ValuePrism™ Products</button>
                <button onClick={() => jumpTo("industries")}>ValuePrism™ Industry</button>
              </div>
              <div className="footer-col">
                <h5>INDUSTRIES</h5>
                <button onClick={() => jumpTo("industries")}>Discrete Manufacturing</button>
                <button onClick={() => jumpTo("industries")}>Automotive</button>
                <button onClick={() => jumpTo("industries")}>Chemical Processing</button>
                <button onClick={() => jumpTo("industries")}>CPG / Food &amp; Beverage</button>
                <button onClick={() => jumpTo("industries")}>Consumer Packaged Goods</button>
                <button onClick={() => jumpTo("industries")}>Health &amp; Life Sciences</button>
              </div>
              <div className="footer-col">
                <h5>COMPANY</h5>
                <button onClick={() => jumpTo("practice")}>Why Praeemineo</button>
                <button onClick={() => jumpTo("methodology")}>Methodology</button>
                <button onClick={() => jumpTo("contact")}>Careers</button>
                <button onClick={() => jumpTo("contact")}>Contact</button>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 Praeemineo. All rights reserved. SAP, S/4HANA, and other SAP products are trademarks of SAP SE.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
