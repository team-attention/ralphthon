'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

export type SponsorLogo = {
  src: string
  alt: string
  href: string
  group: 'Partner' | 'Sponsor'
  width: number
  height: number
  logoClassName?: string
  surface?: 'dark' | 'light'
  delay: string
  duration: string
}

export const PARTNER_LOGOS: SponsorLogo[] = [
  {
    src: '/partners/superteam-sg.svg',
    alt: 'Superteam SG',
    href: 'https://superteam.sg/?utm_source=luma',
    group: 'Partner',
    width: 135,
    height: 32,
    logoClassName: 'max-h-7',
    delay: '0s',
    duration: '5s',
  },
  {
    src: '/partners/petani.png',
    alt: 'Petani',
    href: 'https://petaniai.com/?utm_source=luma',
    group: 'Partner',
    width: 624,
    height: 181,
    logoClassName: 'max-h-7',
    surface: 'light',
    delay: '-1.4s',
    duration: '4.8s',
  },
  {
    src: '/partners/network-school.svg',
    alt: 'Network School',
    href: 'https://ns.com/?utm_source=luma',
    group: 'Partner',
    width: 176,
    height: 32,
    logoClassName: 'max-h-6',
    surface: 'light',
    delay: '-2.8s',
    duration: '5.4s',
  },
  {
    src: '/partners/65labs.png',
    alt: '65labs',
    href: 'https://www.65labs.org/?utm_source=luma',
    group: 'Partner',
    width: 4040,
    height: 1611,
    logoClassName: 'max-h-8',
    delay: '-3.6s',
    duration: '5.1s',
  },
  {
    src: '/partners/aer-labs.png',
    alt: 'AER Labs',
    href: 'https://aerlabs.tech/?utm_source=luma',
    group: 'Partner',
    width: 859,
    height: 282,
    logoClassName: 'max-h-7',
    surface: 'light',
    delay: '-0.8s',
    duration: '4.7s',
  },
]

export const SPONSOR_LOGOS: SponsorLogo[] = [
  {
    src: '/partners/arize-ai.svg',
    alt: 'Arize AI',
    href: 'https://arize.com/?utm_source=luma',
    group: 'Sponsor',
    width: 148,
    height: 32,
    logoClassName: 'max-h-7',
    delay: '-2s',
    duration: '4.9s',
  },
  {
    src: '/partners/ironclaw.png',
    alt: 'near AI / IronClaw',
    href: 'https://www.ironclaw.com/?utm_source=luma',
    group: 'Sponsor',
    width: 675,
    height: 245,
    logoClassName: 'max-h-8',
    delay: '-0.5s',
    duration: '5.2s',
  },
  {
    src: '/partners/iyuno.png',
    alt: 'iyuno',
    href: 'https://iyuno.com/?utm_source=luma',
    group: 'Sponsor',
    width: 2378,
    height: 894,
    logoClassName: 'max-h-7',
    surface: 'light',
    delay: '-3.1s',
    duration: '4.5s',
  },
]

export const ALL_LOGOS = [...PARTNER_LOGOS, ...SPONSOR_LOGOS]

const LEFT_RAIL_LOGOS = [
  PARTNER_LOGOS[0],
  PARTNER_LOGOS[1],
  PARTNER_LOGOS[2],
  PARTNER_LOGOS[3],
]

const RIGHT_RAIL_LOGOS = [
  SPONSOR_LOGOS[0],
  PARTNER_LOGOS[4],
  SPONSOR_LOGOS[1],
  SPONSOR_LOGOS[2],
]

export function SponsorLogoCard({
  sponsor,
  mounted = true,
  compact = false,
  floating = true,
  className,
}: {
  sponsor: SponsorLogo
  mounted?: boolean
  compact?: boolean
  floating?: boolean
  className?: string
}) {
  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={sponsor.alt}
      className={cn(
        'group relative flex items-center justify-center overflow-hidden rounded-2xl border transition-all duration-300',
        sponsor.surface === 'light'
          ? 'border-[rgba(255,217,15,0.22)] bg-[rgba(255,255,255,0.88)] shadow-[0_0_26px_rgba(255,217,15,0.08)]'
          : 'border-[rgba(255,217,15,0.22)] bg-[rgba(10,10,26,0.52)] shadow-[0_0_24px_rgba(0,0,0,0.18)]',
        'backdrop-blur-md',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_30%_0%,rgba(255,217,15,0.12),transparent_55%)]',
        'after:pointer-events-none after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[rgba(255,217,15,0.45)] after:to-transparent',
        compact ? 'h-11 w-28 px-3' : 'h-14 w-36 px-4',
        'opacity-90 hover:scale-[1.03] hover:border-[rgba(255,217,15,0.34)] hover:opacity-100 hover:shadow-[0_0_30px_rgba(255,217,15,0.10)]',
        className
      )}
      style={{
        animation:
          mounted && floating
            ? `float ${sponsor.duration} ease-in-out ${sponsor.delay} infinite, fadeInUp 0.5s ease-out`
            : undefined,
      }}
    >
      <Image
        src={sponsor.src}
        alt={sponsor.alt}
        width={sponsor.width}
        height={sponsor.height}
        className={cn('relative z-10 h-auto w-auto max-w-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.12)]', sponsor.logoClassName)}
      />
      <span className="sr-only">{sponsor.group}</span>
    </a>
  )
}

function SponsorColumn({ sponsors, side }: { sponsors: SponsorLogo[]; side: 'left' | 'right' }) {
  return (
    <div className={cn('flex flex-col items-center gap-5', side === 'right' && '-translate-y-8')}>
      <div className="font-mono text-[10px] uppercase tracking-[0.34em] text-[rgba(255,217,15,0.55)] [writing-mode:vertical-rl]">
        {side === 'left' ? 'Partners' : 'Sponsors'}
      </div>
      {sponsors.map((sponsor) => (
        <SponsorLogoCard key={sponsor.src} sponsor={sponsor} compact />
      ))}
    </div>
  )
}

export function FallingSponsorRails() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[12] hidden items-center justify-between px-5 lg:flex xl:px-10">
      <div className="pointer-events-auto">
        <SponsorColumn sponsors={LEFT_RAIL_LOGOS} side="left" />
      </div>
      <div className="pointer-events-auto">
        <SponsorColumn sponsors={RIGHT_RAIL_LOGOS} side="right" />
      </div>
    </div>
  )
}
