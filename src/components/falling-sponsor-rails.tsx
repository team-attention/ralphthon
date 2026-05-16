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
const partnerFilter = 'brightness(0) invert(1) opacity(0.82)'

const LEFT_SPONSORS: Sponsor[] = [
  { src: '/openai-1.png', alt: 'OpenAI', h: 'h-12', delay: '0s', duration: '5s' },
  { src: '/partners/superteam-sg.svg', alt: 'Superteam SG', h: 'h-7', delay: '-0.8s', duration: '4.9s', filter: partnerFilter },
  { src: '/partners/petani.png', alt: 'Petani', h: 'h-7', delay: '-2.4s', duration: '5.2s', filter: partnerFilter },
  { src: '/partners/network-school.svg', alt: 'Network School', h: 'h-6', delay: '-3.8s', duration: '4.7s', filter: partnerFilter },
  { src: '/partners/65labs.png', alt: '65labs', h: 'h-10', delay: '-4.4s', duration: '5.4s', filter: partnerFilter },
]

const RIGHT_SPONSORS: Sponsor[] = [
  { src: '/hashed.svg', alt: 'Hashed', h: 'h-10', delay: '-1s', duration: '4.8s' },
  { src: '/partners/arize-ai.svg', alt: 'Arize AI', h: 'h-7', delay: '-1.2s', duration: '5.1s', filter: partnerFilter },
  { src: '/partners/aer-labs.png', alt: 'AER Labs', h: 'h-7', delay: '-2.8s', duration: '4.6s', filter: partnerFilter },
  { src: '/partners/ironclaw.png', alt: 'Ironclaw / nearAI', h: 'h-8', delay: '-4s', duration: '5.3s', filter: partnerFilter },
  { src: '/partners/iyuno.png', alt: 'Iyuno', h: 'h-7', delay: '-0.4s', duration: '4.8s', filter: partnerFilter },
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
