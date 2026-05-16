'use client'

type Sponsor = {
  src: string
  alt: string
  className: string
  delay: string
  duration: string
  filter?: string
  offset?: string
}

const baseFilter = 'brightness(0.8)'
const partnerFilter = 'brightness(0) invert(1) opacity(0.82)'

const LEFT_SPONSORS: Sponsor[] = [
  { src: '/openai-1.png', alt: 'OpenAI', className: 'w-44 xl:w-52', delay: '0s', duration: '5s', offset: '-translate-x-2' },
  { src: '/partners/superteam-sg.svg', alt: 'Superteam SG', className: 'w-32 xl:w-36', delay: '-0.8s', duration: '4.9s', filter: partnerFilter, offset: 'translate-x-10 -rotate-3' },
  { src: '/partners/petani.png', alt: 'Petani', className: 'w-28 xl:w-32', delay: '-2.4s', duration: '5.2s', filter: partnerFilter, offset: 'translate-x-2 rotate-2' },
  { src: '/partners/network-school.svg', alt: 'Network School', className: 'w-36 xl:w-40', delay: '-3.8s', duration: '4.7s', filter: partnerFilter, offset: 'translate-x-12' },
  { src: '/partners/65labs.png', alt: '65labs', className: 'w-20 xl:w-24', delay: '-4.4s', duration: '5.4s', filter: partnerFilter, offset: 'translate-x-4 -rotate-2' },
]

const RIGHT_SPONSORS: Sponsor[] = [
  { src: '/hashed.svg', alt: 'Hashed', className: 'w-32 xl:w-36', delay: '-1s', duration: '4.8s', offset: 'translate-x-2' },
  { src: '/partners/arize-ai.svg', alt: 'Arize AI', className: 'w-32 xl:w-36', delay: '-1.2s', duration: '5.1s', filter: partnerFilter, offset: '-translate-x-10 rotate-2' },
  { src: '/partners/aer-labs.png', alt: 'AER Labs', className: 'w-28 xl:w-32', delay: '-2.8s', duration: '4.6s', filter: partnerFilter, offset: '-translate-x-2 -rotate-2' },
  { src: '/partners/ironclaw.png', alt: 'Ironclaw / nearAI', className: 'w-28 xl:w-32', delay: '-4s', duration: '5.3s', filter: partnerFilter, offset: '-translate-x-12' },
  { src: '/partners/iyuno.png', alt: 'Iyuno', className: 'w-28 xl:w-32', delay: '-0.4s', duration: '4.8s', filter: partnerFilter, offset: '-translate-x-4 rotate-3' },
]

function SponsorColumn({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <div className="flex flex-col items-center gap-9 xl:gap-11">
      {sponsors.map((sponsor) => (
        <img
          key={sponsor.src}
          src={sponsor.src}
          alt={sponsor.alt}
          className={`h-auto object-contain opacity-60 transition-opacity duration-300 hover:opacity-95 ${sponsor.className} ${sponsor.offset ?? ''}`}
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
    <div className="pointer-events-none fixed inset-0 z-[12] hidden items-center justify-between px-4 lg:flex xl:px-10 2xl:px-16">
      <SponsorColumn sponsors={LEFT_SPONSORS} />
      <SponsorColumn sponsors={RIGHT_SPONSORS} />
    </div>
  )
}
