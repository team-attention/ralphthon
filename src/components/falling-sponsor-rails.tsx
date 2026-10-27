'use client'

type Sponsor = {
  src: string
  alt: string
  className: string
  delay: string
  duration: string
  offset?: string
}

const baseFilter = 'brightness(0.8)'

const LEFT_SPONSORS: Sponsor[] = [
  { src: '/openai-1.png', alt: 'OpenAI', className: 'w-[8.8rem] xl:w-[10.4rem]', delay: '0s', duration: '5s', offset: '-translate-x-2' },
]

const RIGHT_SPONSORS: Sponsor[] = [
  { src: '/ralphthon.png', alt: 'Ralphthon', className: 'w-32 xl:w-36', delay: '-1s', duration: '4.8s', offset: 'translate-x-2' },
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
            filter: baseFilter,
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
