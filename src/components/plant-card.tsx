import { Link } from "@tanstack/react-router";
import { BookmarkPlus, Leaf } from "lucide-react";
import type { Plant } from "@/lib/plants";
import { Button } from "@/components/ui/button";

export function PlantCard({plant,onSave,saved=false}:{plant:Plant;onSave?:(p:Plant)=>void;saved?:boolean}) { return <article className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
  <div className="grid aspect-[16/9] place-items-center bg-secondary text-primary">{plant.image_url ? <img src={plant.image_url} alt={plant.common_name} loading="lazy" className="h-full w-full object-cover" /> : <Leaf className="size-14 opacity-60" />}</div>
  <div className="p-5"><span className="text-xs font-semibold uppercase text-muted-foreground">{plant.category}</span><h2 className="mt-1 text-2xl font-semibold">{plant.common_name}</h2><p className="italic text-muted-foreground">{plant.scientific_name}</p>{plant.ayurvedic_name && <p className="mt-1 text-sm font-medium text-primary">Ayurvedic name: {plant.ayurvedic_name}</p>}<p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/80">{plant.description}</p><div className="mt-5 flex flex-wrap gap-2"><Button variant="herbora" size="sm" asChild><Link to="/plants/$slug" params={{slug:plant.slug}}>View details</Link></Button>{onSave && <Button variant="herboraOutline" size="sm" onClick={()=>onSave(plant)}><BookmarkPlus />{saved ? "Saved" : "Save plant"}</Button>}</div></div>
  </article>; }