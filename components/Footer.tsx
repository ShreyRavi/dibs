// Footer with copyright + the deployed build version (short commit SHA).
const COMMIT = (process.env.NEXT_PUBLIC_COMMIT || "dev").slice(0, 7);

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 text-center font-body text-[11px] text-text-40">
      © Dibs by Kansoboard {year} · {COMMIT}
    </footer>
  );
}
