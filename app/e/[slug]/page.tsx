import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClubPage from "@/components/ClubPage";
import { EPISODES, getEpisode } from "@/lib/club";

export const dynamicParams = false;

export function generateStaticParams() {
  return EPISODES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ep = getEpisode(slug);
  if (!ep) return {};
  return {
    title: `“${ep.hook}” · The Backchannel`,
    description: `Conversation Nº ${String(ep.number).padStart(3, "0")}. Take a side, claim a seat, speak in private.`,
  };
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ep = getEpisode(slug);
  if (!ep) notFound();
  return <ClubPage episode={ep} />;
}
