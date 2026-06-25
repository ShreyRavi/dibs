import Link from "next/link";
import { Stamp } from "./Stamp";

// The Dibs brand mark: lime stamp + wordmark. Used as a header on list pages and
// on the homepage. `parent` appends "by Kansoboard" (linked) when true.
export function DibsLogo({
  parent = false,
  size = 24,
  href = "/",
}: {
  parent?: boolean;
  size?: number;
  href?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Link href={href} aria-label="Dibs home" className="flex items-center gap-2.5">
        <Stamp size={size} />
        <span className="font-display text-[15px] font-bold text-text">Dibs</span>
      </Link>
      {parent && (
        <span className="font-body text-[13px] text-text-40">
          by{" "}
          <a
            href="https://kansoboard.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-50 underline underline-offset-2 hover:text-text"
          >
            Kansoboard
          </a>
        </span>
      )}
    </div>
  );
}
