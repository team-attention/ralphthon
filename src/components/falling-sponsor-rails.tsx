'use client'

type Sponsor = {
  src: string
  alt: string
  h: string
  delay: string
  duration: string
  filter?: string
}

const baseFilter = 'brightness(0.8)'
const lightLogoFilter = 'brightness(0) invert(1) opacity(0.82)'

const LEFT_SPONSORS: Sponsor[] = [
  { src: '/openai-1.png', alt: 'OpenAI', h: 'h-12', delay: '0s', duration: '5s' },
  { src: '/d2sf-2.png', alt: 'D2SF', h: 'h-40', delay: '-1.5s', duration: '4.5s' },
  { src: '/hp-3.png', alt: 'HP', h: 'h-24', delay: '-3s', duration: '5.5s' },
  { src: '/partners/superteam-sg.svg', alt: 'Superteam SG', h: 'h-7', delay: '-0.8s', duration: '4.9s', filter: lightLogoFilter },
  { src: '/partners/petani.png', alt: 'Petani', h: 'h-7', delay: '-2.4s', duration: '5.2s', filter: lightLogoFilter },
  { src: '/partners/network-school.svg', alt: 'Network School', h: 'h-6', delay: '-3.8s', duration: '4.7s', filter: lightLogoFilter },
  { src: '/partners/65labs.png', alt: '65labs', h: 'h-10', delay: '-4.4s', duration: '5.4s', filter: lightLogoFilter },
]

const RIGHT_SPONSORS: Sponsor[] = [
  { src: '/kv-4.png', alt: 'KV', h: 'h-32', delay: '-2s', duration: '4.8s' },
  { src: '/bass-5.png', alt: 'Bass', h: 'h-32', delay: '-0.5s', duration: '5.2s' },
  { src: '/wb-6.svg', alt: 'WB', h: 'h-[2.625rem]', delay: '-3.5s', duration: '4.3s' },
  { src: '/partners/arize-ai.svg', alt: 'Arize AI', h: 'h-7', delay: '-1.2s', duration: '5.1s', filter: lightLogoFilter },
  { src: '/partners/aer-labs.png', alt: 'AER Labs', h: 'h-7', delay: '-2.8s', duration: '4.6s', filter: lightLogoFilter },
  { src: '/partners/ironclaw.png', alt: 'near AI / IronClaw', h: 'h-8', delay: '-4s', duration: '5.3s', filter: lightLogoFilter },
  { src: '/partners/iyuno.png', alt: 'iyuno', h: 'h-7', delay: '-0.4s', duration: '4.8s', filter: lightLogoFilter },
]

function SponsorColumn({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <div className="flex flex-col items-center gap-8 xl:gap-10">
      {sponsors.map((sponsor) => (
        <img
          key={sponsor.src}
          src={sponsor.src}
          alt={sponsor.alt}
          className={`${sponsor.h} w-auto max-w-32 opacity-70 transition-opacity duration-300 hover:opacity-100`}
          style={{
            filter: sponsor.filter ?? baseFilter,
            animation: `float ${sponsor.duration} ease-in-out ${sponsor.delay} infinite`,
          }}
        />
      ))}
    </div>
  )
}

export function FallingSponsorRails() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[12] hidden items-center justify-between px-6 lg:flex xl:px-12">
      <SponsorColumn sponsors={LEFT_SPONSORS} />
      <SponsorColumn sponsors={RIGHT_SPONSORS} />
    </div>
  )
}
