import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Bot, CalendarDays, Lightbulb, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroAsset from "@/assets/herbora-hero.jpg.asset.json";
import wellnessAsset from "@/assets/herbal-wellness.jpg.asset.json";
import dailyAsset from "@/assets/daily-wellness.jpg.asset.json";
import tipsAsset from "@/assets/herbal-tips.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Herbora — Discover Ayurvedic Plants" },
    { name: "description", content: "Explore medicinal plants, traditional Ayurvedic knowledge, and herbal wellness with Herbora." },
    { property: "og:title", content: "Herbora — Discover Ayurvedic Plants" },
    { property: "og:description", content: "Every herb has a purpose and every learner has a journey." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: HomePage,
});

const features = [
  { title: "Herbal Wellness", text: <>Explore the power of<br />natural herbs for a<br />healthier you.</>, cta: "Explore Herbs", to: "/plantopedia" as const, icon: Leaf, image: wellnessAsset.url, alt: "Mortar, pestle and fresh herbs" },
  { title: "Daily Wellness", text: <>Simple daily habits<br />for a balanced and<br />healthy lifestyle.</>, cta: "Read More", to: "/wellness" as const, icon: CalendarDays, image: dailyAsset.url, alt: "Glass cup of herbal tea" },
  { title: "Herbal Wellness Tips", text: <>Practical tips and natural<br />remedies to support your<br />wellness journey.</>, cta: "Explore Tips", to: "/wellness" as const, icon: Lightbulb, image: tipsAsset.url, alt: "Herbal oil bottle and leaves" },
];

function HomePage() {
  const [assistant, setAssistant] = useState(false);
  const navigate = useNavigate();
  return <main className="overflow-hidden">
    <section className="relative min-h-[460px] border-b border-border bg-card">
      <img src={heroAsset.url} width={1536} height={896} alt="Ayurvedic herbs arranged with a stone mortar and pestle" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="relative mx-auto grid min-h-[460px] max-w-6xl items-center px-6 py-16 md:grid-cols-2 md:px-10">
        <div className="herbora-rise max-w-xl">
          <div className="font-serif text-7xl leading-none text-accent">“</div>
          <h1 className="mt-[-1rem] text-[2.35rem] font-semibold leading-[1.12] text-primary md:text-5xl">Herbora – because<br />every herb has a purpose<br />and every learner has a<br />journey.”</h1>
          <div className="mt-8 flex w-64 items-center gap-3 text-accent"><span className="h-px flex-1 bg-accent" /><Leaf className="size-5" /><span className="h-px flex-1 bg-accent" /></div>
        </div>
      </div>
    </section>
    <section className="relative mx-auto -mt-1 grid max-w-6xl gap-3 px-4 pb-16 md:grid-cols-3 md:px-8">
      {features.map(({ title, text, cta, to, icon: Icon, image, alt }, index) => <article key={title} className="herbora-rise relative min-h-56 overflow-hidden rounded-lg border border-border bg-card shadow-sm" style={{ animationDelay: `${index * 100}ms` }}>
        <img src={image} width={960} height={640} loading="lazy" alt={alt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative z-10 flex h-full min-h-56 w-[58%] flex-col p-5">
          <div className="mb-4 flex items-center gap-3"><span className="grid size-12 place-items-center rounded-full bg-secondary text-primary"><Icon className="size-6" /></span><h2 className="text-xl font-semibold leading-tight">{title}</h2></div>
          <p className="text-sm leading-relaxed text-foreground/80">{text}</p>
          <Button variant="herbora" size="sm" className="mt-auto w-fit" onClick={() => navigate({ to })}>{cta}<ArrowRight /></Button>
        </div>
      </article>)}
    </section>
    {assistant && <div className="fixed bottom-24 right-5 z-40 w-72 rounded-lg border border-border bg-card p-5 shadow-lg"><h2 className="text-xl font-semibold">Herbora Assistant</h2><p className="mt-2 text-sm text-muted-foreground">The assistant is coming soon. For now, explore Plantopedia or identify a plant.</p><div className="mt-4 flex gap-2"><Button size="sm" asChild><Link to="/plantopedia">Explore plants</Link></Button><Button size="sm" variant="outline" onClick={() => setAssistant(false)}>Close</Button></div></div>}
    <Button aria-label="Open Herbora assistant" title="Herbora assistant" size="icon" onClick={() => setAssistant(v => !v)} className="fixed bottom-5 right-5 z-40 size-14 rounded-full border-4 border-secondary shadow-lg"><Bot className="size-6" /></Button>
  </main>;
}