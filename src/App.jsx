import { useEffect, useState } from "react";

import "@/app.css";
import { PilotConversation } from "@/components/pilot-conversation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  ["What we do", "/what-we-do"],
  ["How it works", "/how-it-works"],
  ["AI workforce", "/ai-workforce"],
  ["Control", "/control"],
];

const capabilities = [
  { title: "Executive operations", copy: "Inbox triage, meeting preparation, research, coordination, reminders, and the administrative work that crowds out leadership." },
  { title: "Sales", copy: "Lead research, qualification, follow-up preparation, CRM upkeep, proposal support, and clearer pipeline momentum." },
  { title: "Customer retention", copy: "Account monitoring, churn signals, re-engagement opportunities, customer follow-up, and consistent relationship context." },
  { title: "Marketing", copy: "Campaign assistance, content operations, segmentation, performance analysis, and launch coordination across the team." },
  { title: "Customer support", copy: "Request classification, context retrieval, response preparation, escalation, and support operations with clear ownership." },
  { title: "Finance operations", copy: "Reporting preparation, document organisation, recurring administration, and appropriately controlled financial workflows." },
];

const journey = [
  { number: "01", title: "Understand", copy: "We learn how the company runs: its people, systems, bottlenecks, risks, and the work that keeps falling between them." },
  { number: "02", title: "Design", copy: "We turn that operating picture into an AI operations plan, prioritised by real business value rather than novelty." },
  { number: "03", title: "Pilot", copy: "We begin with one focused paid pilot so your team can test the system in the real business without a huge first commitment." },
  { number: "04", title: "Operate", copy: "When the pilot proves useful, Second Chair stays to run, monitor, maintain, and improve the deployment with your team." },
  { number: "05", title: "Expand", copy: "We add further capabilities, integrations, functions, and locations only when the evidence supports the next step." },
];

const faqs = [
  ["Is Second Chair an automation agency?", "No. A focused workflow may be where an engagement begins, but the product is the managed operating relationship: the Second Chair platform, a tailored AI workforce, integrations, implementation, monitoring, support, and continuous improvement."],
  ["Do we have to replace our current tools?", "The intention is the opposite. Second Chair is designed around the systems your team already uses. The exact integrations and data access are agreed as part of discovery and scoped deployment."],
  ["Does every action require approval forever?", "No. Second Chair operates according to customer-defined control policies. High-risk or consequential work can require review, while approved low-risk routines can become more automated when the customer is ready."],
  ["What happens after a successful pilot?", "We agree a managed deployment, keep the proven capability operating, and build the next part of the AI operations roadmap. Second Chair remains responsible for maintaining and improving what it deploys."],
];

function Wordmark() {
  return <span className="wordmark">Second Chair<span>.</span></span>;
}

function Header({ currentPath }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="site-header">
    <a href="/" aria-label="Second Chair home"><Wordmark /></a>
    <nav className="desktop-nav" aria-label="Main navigation">{navigation.map(([label, href]) => <a aria-current={currentPath === href ? "page" : undefined} href={href} key={href}>{label}</a>)}</nav>
    <div className="header-actions">
      <Button asChild className="primary-cta hidden-mobile" size="lg"><a href="/contact">Contact us</a></Button>
      <Sheet modal={false} open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild><Button className="mobile-menu" variant="outline" aria-label="Open menu">Menu</Button></SheetTrigger>
        <SheetContent className="mobile-nav-panel !w-full !max-w-none !border-l-0" id="mobile-navigation">
          <SheetHeader className="mobile-nav-header"><SheetTitle><Wordmark /></SheetTitle><SheetDescription className="sr-only">Navigate the Second Chair website.</SheetDescription></SheetHeader>
          <nav aria-label="Mobile navigation">{navigation.map(([label, href]) => <a aria-current={currentPath === href ? "page" : undefined} href={href} key={href}>{label}</a>)}<Button asChild className="primary-cta" size="lg"><a href="/contact">Contact us</a></Button></nav>
        </SheetContent>
      </Sheet>
    </div>
  </header>;
}

function PageIntro({ title, copy }) {
  return <header className="page-intro" data-reveal><h1>{title}</h1><p>{copy}</p></header>;
}

function OperatingView() {
  return <Card className="operating-view" aria-label="Illustration of a managed Second Chair operating view">
    <CardHeader className="operating-view__header"><CardTitle>A coordinated operating view</CardTitle><CardDescription>Illustrative work prepared across the business, with review kept where it matters.</CardDescription></CardHeader>
    <CardContent className="operating-view__content">
      <div className="signal-grid"><div className="signal-card"><span>Sales</span><strong>12</strong><small>follow-ups prepared</small></div><div className="signal-card"><span>Support</span><strong>8</strong><small>requests resolved</small></div><div className="signal-card signal-card--accent"><span>Executive</span><strong>3</strong><small>decisions surfaced</small></div></div>
      <div className="activity-list">
        <div className="activity-row"><div><strong>Account research prepared</strong><small>Fourteen approved sources checked for the sales owner.</small></div></div>
        <div className="activity-row activity-row--focus"><div><strong>Customer response awaiting review</strong><small>The control policy requires a manager before anything is sent.</small></div></div>
        <div className="activity-row"><div><strong>Weekly operating brief updated</strong><small>Executive context reconciled across six approved systems.</small></div></div>
      </div>
      <div className="managed-line"><p>Your team retains the final decision when consequence or confidence calls for review.</p></div>
    </CardContent>
  </Card>;
}

function HomePage() {
  return <>
    <section className="hero"><div className="hero__content" data-reveal><h1>Build an AI workforce around the business you already run<span>.</span></h1><p className="hero__lede">Second Chair brings managed AI operations into your company: learning how the business works, designing the right capabilities, connecting them to your systems, and improving the deployment with you.</p><div className="hero__actions"><Button asChild className="primary-cta" size="lg"><a href="/contact">Contact us</a></Button><Button asChild className="quiet-cta" size="lg" variant="ghost"><a href="/how-it-works">See how it works</a></Button></div><p className="hero__footnote">Start with a focused paid pilot. Expand only when the system proves useful inside your business.</p></div><div data-reveal="delayed"><OperatingView /></div></section>
    <section className="promise-bar" aria-label="Second Chair operating promise" data-reveal><p>Designed around your business</p><Separator orientation="vertical" /><p>Connected to your systems</p><Separator orientation="vertical" /><p>Operated with you</p></section>
    <section className="home-directory" aria-label="Explore Second Chair" data-reveal><a href="/what-we-do"><strong>What we do</strong><p>The managed relationship behind the work.</p></a><a href="/how-it-works"><strong>How it works</strong><p>From understanding to a proven deployment.</p></a><a href="/ai-workforce"><strong>AI workforce</strong><p>Capabilities coordinated around your operation.</p></a><a href="/control"><strong>Control</strong><p>Review and authority proportionate to risk.</p></a></section>
    <section className="home-contact" data-reveal><div><h2>Bring us the work that keeps getting stuck.</h2><p>We will help identify a useful first pilot and tell you candidly whether Second Chair is the right fit.</p></div><Button asChild className="primary-cta" size="lg"><a href="/contact">Contact us</a></Button></section>
  </>;
}

function WhatWeDoPage() {
  return <div className="page-shell"><PageIntro title="Managed AI operations, built around your business." copy="Growing businesses do not need another AI tool to configure. They need someone to understand the operation, build the right system, and remain accountable for making it work." />
    <section className="thesis-grid" data-reveal><Card><CardHeader><CardTitle>Understand the operation</CardTitle></CardHeader><CardContent><p>We map the people, processes, systems, handoffs, constraints, and opportunities that make your business distinct.</p></CardContent></Card><Card><CardHeader><CardTitle>Build the workforce</CardTitle></CardHeader><CardContent><p>We configure a tailored AI workforce and connect it to the tools and context your team already depends on.</p></CardContent></Card><Card className="thesis-card--accent"><CardHeader><CardTitle>Stay responsible</CardTitle></CardHeader><CardContent><p>We operate, monitor, maintain, support, and improve what we deploy instead of handing over a brittle experiment.</p></CardContent></Card></section>
    <section className="service-model" aria-label="What customers buy" data-reveal><h2>One managed relationship.</h2><div><p>Second Chair platform</p><p>Tailored AI workforce</p><p>Integrations and implementation</p><p>Ongoing management</p></div></section>
  </div>;
}

function HowItWorksPage() {
  return <div className="page-shell"><PageIntro title="A focused beginning. A much broader destination." copy="We understand the operation, design the right system, prove it through a pilot, then operate and expand only what earns the next step." />
    <section className="journey-list" data-reveal>{journey.map((item) => <article className="journey-row" key={item.number}><span className="journey-number">{item.number}</span><div><h2>{item.title}</h2><p>{item.copy}</p></div></article>)}</section>
    <section className="page-section" data-reveal><Card className="pilot-card"><CardContent><div className="pilot-copy"><h2>The pilot is the doorway, not the product.</h2><p>We choose one high-value area to prove Second Chair inside the real company before you commit to more.</p></div><div className="pilot-outcomes"><p><span>01</span> A clearly scoped operating problem</p><p><span>02</span> Agreed control and success measures</p><p><span>03</span> A working deployment in the business</p><p><span>04</span> Evidence to stop, continue, or expand</p></div></CardContent></Card></section>
    <section className="managed-grid" data-reveal><div><h3>Operate</h3><p>Keep the deployment running in the real rhythm of the business.</p></div><div><h3>Maintain</h3><p>Monitor integrations, failures, controls, configuration, and service health.</p></div><div><h3>Improve</h3><p>Refine performance as the operation evolves.</p></div><div><h3>Expand</h3><p>Add functions and workflows when value is proven.</p></div></section>
  </div>;
}

function WorkforcePage() {
  return <div className="page-shell"><PageIntro title="Different capabilities. One Second Chair." copy="Your employees work through Second Chair, while the right capability, context, and control policy are coordinated behind the scenes." />
    <section className="capability-grid" data-reveal>{capabilities.map(({ title, copy }) => <Card className="capability-card" key={title}><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><p>{copy}</p></CardContent></Card>)}</section>
    <section className="platform-section page-section" data-reveal><div className="platform-copy"><h2>Every deployment makes the next one stronger.</h2><p>The same Second Chair platform carries reusable connectors, workflow components, control policies, monitoring, and deployment knowledge into each carefully scoped expansion.</p><ul><li>A single coordinator across specialist capabilities</li><li>Business context shaped around the customer</li><li>Approval, execution, audit, and measurement built in</li></ul></div><Card className="system-map"><CardHeader><CardTitle>From employee intent to controlled execution</CardTitle><CardDescription>One managed path connects the team, the coordinator, approved capabilities, and business systems.</CardDescription></CardHeader><CardContent><p><strong>Your team</strong><span>Sets intent and keeps decision authority.</span></p><p><strong>Second Chair</strong><span>Coordinates context, capabilities, and policy.</span></p><p><strong>Specialist capabilities</strong><span>Support sales, service, finance, and operations.</span></p><p><strong>Business systems</strong><span>Provide the approved context and execution boundary.</span></p></CardContent></Card></section>
  </div>;
}

function ControlPage() {
  return <div className="page-shell"><PageIntro title="Not unrestricted. Not approval theatre." copy="Second Chair operates according to customer-defined control policies. Human review follows the consequence and confidence of the action." />
    <section className="control-stack" data-reveal><Card className="control-card control-card--review"><CardHeader><CardTitle>High consequence or customer-facing</CardTitle></CardHeader><CardContent><p>Important communication, ambiguous changes, sensitive operations, and other high-risk actions can require a named reviewer.</p></CardContent></Card><Card className="control-card"><CardHeader><CardTitle>Routine and explicitly authorised</CardTitle></CardHeader><CardContent><p>Approved low-risk routines can move with less friction when the customer’s policy and evidence support it.</p></CardContent></Card><Card className="control-card"><CardHeader><CardTitle>Context, monitoring, and preparation</CardTitle></CardHeader><CardContent><p>Reading approved context, surfacing exceptions, and preparing work can stay useful without pretending every step is an external action.</p></CardContent></Card></section>
    <section className="faq-section page-section" data-reveal><header><h2>Questions a careful operator should ask.</h2></header><Accordion className="faq-list" collapsible type="single">{faqs.map(([question, answer], index) => <AccordionItem key={question} value={`item-${index}`}><AccordionTrigger>{question}</AccordionTrigger><AccordionContent>{answer}</AccordionContent></AccordionItem>)}</Accordion></section>
  </div>;
}

function ContactPage() {
  return <div className="page-shell contact-page"><PageIntro title="Show us how your business actually works." copy="We’ll look for where AI can create real operating value, identify a sensible first pilot, and tell you honestly whether Second Chair is the right fit." /><div className="contact-layout" data-reveal><div className="contact-note"><h2>Contact us</h2><p>Keep the first note high level. Do not include credentials, customer records, or confidential information.</p><a href="mailto:support@chair02.com">support@chair02.com</a></div><PilotConversation /></div></div>;
}

const pages = new Map([
  ["/", HomePage], ["/index.html", HomePage], ["/what-we-do", WhatWeDoPage],
  ["/how-it-works", HowItWorksPage], ["/ai-workforce", WorkforcePage],
  ["/control", ControlPage], ["/contact", ContactPage],
]);

function App({ pathname = globalThis.location?.pathname ?? "/" }) {
  const Page = pages.get(pathname) ?? HomePage;
  useRevealMotion();
  return <div className="site-shell"><a className="skip-link" href="#main">Skip to content</a><Header currentPath={pathname} /><main id="main"><Page /><RelatedGuides pathname={pathname} /></main><footer className="site-footer"><div><Wordmark /><p>The managed AI operating layer for growing businesses.</p></div><nav aria-label="Footer navigation"><a href="/about">About</a><a href="/workflows">Workflows</a><a href="/insights">Insights</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/contact">Contact us</a></nav><p className="footer-meta">Validation-stage service in Singapore. <a href="mailto:support@chair02.com">support@chair02.com</a></p></footer></div>;
}

const discoveryLinks = {
  "/": [["AI workflow examples", "/workflows"], ["Choosing your first AI workflow", "/insights/choose-one-workflow"], ["Lead research with human review", "/workflows/lead-research"]],
  "/what-we-do": [["Explore workflow pilot examples", "/workflows"], ["Why managed operations come before scale", "/insights/concierge-before-automation"]],
  "/how-it-works": [["Choose a first AI workflow", "/insights/choose-one-workflow"], ["Define a useful pilot result", "/insights/what-counts-as-validation"]],
  "/ai-workforce": [["Lead research and qualification", "/workflows/lead-research"], ["Sales follow-up preparation", "/workflows/sales-follow-through"], ["Operating reports and briefs", "/workflows/reporting-cadence"]],
  "/control": [["Design human approval before action", "/insights/human-approval-before-action"], ["Measure preparation and review time", "/insights/measure-coordination-drag"]],
};

function RelatedGuides({ pathname }) {
  const links = discoveryLinks[pathname];
  if (!links) return null;
  return <section className="page-shell related-guides" aria-labelledby="related-guides-title">
    <h2 id="related-guides-title">{pathname === "/" ? "Managed AI operations for growing businesses" : "Plan a useful first deployment"}</h2>
    <p>{pathname === "/" ? "Second Chair is a validation-stage managed AI service in Singapore. Start with a defined operating problem, agreed access, and a named reviewer. These guides show how to choose and measure a focused pilot." : "Use these practical guides to define scope, review responsibilities, and the evidence for a next step."}</p>
    <div className="home-directory">{links.map(([label, href]) => <a href={href} key={href}><strong>{label}</strong></a>)}</div>
  </section>;
}

function useRevealMotion() {
  useEffect(() => {
    const elements = [...document.querySelectorAll("[data-reveal]")];
    const reducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in globalThis)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    document.documentElement.classList.add("motion-ready");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);
}

export default App;
