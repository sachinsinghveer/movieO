import Link from "next/link"
import Image from "next/image"

const logo = "/assets/logo.svg"

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-12">

          {/* BRAND */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <Image
                src={logo}
                alt="CineStats"
                width={40}
                height={40}
                priority
              />
              <span className="text-2xl font-semibold tracking-tight text-white">
                CineStats
              </span>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
              CineStats helps you explore movies, ratings, trends, and insights
              with a clean cinematic experience built for movie lovers.
            </p>
          </div>

          {/* LINKS */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <FooterColumn title="Product">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/">Live</FooterLink>
              <FooterLink href="/">Premium</FooterLink>
            </FooterColumn>

            <FooterColumn title="Company">
              <FooterLink href="/">About</FooterLink>
              <FooterLink href="/">Contact</FooterLink>
              <FooterLink href="/">FAQ</FooterLink>
            </FooterColumn>

            <FooterColumn title="Legal">
              <FooterLink href="/">Terms</FooterLink>
              <FooterLink href="/">Privacy</FooterLink>
              <FooterLink href="/">Licenses</FooterLink>
            </FooterColumn>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} CineStats. All rights reserved.
          </p>

          <p className="text-xs text-zinc-500">
            Crafted with precision for cinema lovers 🎬
          </p>
        </div>
      </div>
    </footer>
  )
}


function FooterColumn({ title, children }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
        {title}
      </h4>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-sm text-zinc-400 transition hover:text-white"
    >
      {children}
    </Link>
  )
}


