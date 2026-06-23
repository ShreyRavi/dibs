import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Complete screen placeholder — pixel-accurate payoff (seal, stat chips, crew,
// confetti) is T6c / P4. This stub keeps the wrap-up button from 404ing.
export default async function CompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: list } = await supabaseAdmin()
    .from("dibs_lists")
    .select("title")
    .eq("id", id)
    .single();
  if (!list) notFound();

  return (
    <main className="screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-[40px]">🎉</div>
      <h1 className="mt-3 font-display text-[30px] font-extrabold">{list.title}</h1>
      <p className="mt-2 font-body text-[14px] text-text-50">event complete (P4 polish pending)</p>
      <Link
        href={`/l/${id}`}
        className="mt-6 inline-flex min-h-11 items-center rounded-full border border-hairline-strong px-5 font-display text-[15px] font-bold text-text"
      >
        Back to the list
      </Link>
    </main>
  );
}
