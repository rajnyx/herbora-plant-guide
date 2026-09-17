import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Camera, Menu, Search, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import logoAsset from "@/assets/herbora-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [{to:"/",label:"Home"},{to:"/plantopedia",label:"Plantopedia"},{to:"/my-plants",label:"My Plant DB"},{to:"/identify",label:"Identify a Plant"},{to:"/about",label:"About"}] as const;

export function SiteHeader() {
  const [query, setQuery] = useState(""); const [user, setUser] = useState<User | null>(null); const navigate = useNavigate();
  const pathname = useRouterState({ select: s => s.location.pathname });
  useEffect(() => { supabase.auth.getUser().then(({data}) => setUser(data.user)); const {data} = supabase.auth.onAuthStateChange((_e,session)=>setUser(session?.user ?? null)); return () => data.subscription.unsubscribe(); }, []);
  const search = (e: FormEvent) => { e.preventDefault(); navigate({ to: "/plantopedia", search: { q: query } }); };
  return <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
    <div className="mx-auto flex h-20 max-w-6xl items-center justify-center px-4"><Link to="/" aria-label="Herbora home"><img src={logoAsset.url} width={800} height={800} alt="Herbora — Ancient Wisdom, Modern Discovery" className="h-16 w-auto object-contain" /></Link></div>
    <div className="mx-auto flex max-w-6xl items-center gap-3 border-t border-border px-4 py-3">
      <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open menu"><Menu className="size-6" /></Button></SheetTrigger><SheetContent side="left" className="bg-card"><SheetHeader><SheetTitle className="font-serif text-2xl text-primary">Herbora</SheetTitle></SheetHeader><nav className="mt-8 flex flex-col gap-2">{links.map(l=><Link key={l.to} to={l.to} className="rounded-md px-4 py-3 text-base text-foreground hover:bg-secondary" activeProps={{className:"bg-secondary font-semibold"}}>{l.label}</Link>)}</nav></SheetContent></Sheet>
      <form onSubmit={search} className="relative flex-1"><Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={e=>setQuery(e.target.value)} className="h-11 w-full rounded-lg border border-border bg-card pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" placeholder="Search herbs, remedies, wellness..." aria-label="Search Herbora" /></form>
      <Button variant="herboraOutline" size="icon" asChild><Link to="/identify" aria-label="Identify a plant with a photo"><Camera className="size-5" /></Link></Button>
      <Button variant={pathname === "/account" ? "herbora" : "herboraOutline"} size="icon" asChild><Link to={user ? "/account" : "/auth"} aria-label={user ? "Your account" : "Log in"}><UserRound className="size-5" /></Link></Button>
    </div>
  </header>;
}