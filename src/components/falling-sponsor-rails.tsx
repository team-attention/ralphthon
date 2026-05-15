'use client'

type Sponsor = {
  src: string
  alt: string
  h: string
  delay: string
  duration: string
}

const LEFT_SPONSORS: Sponsor[] = [
  { src: '/openai-1.png', alt: 'OpenAI', h: 'h-12', delay: '0s', duration: '5s' },
  { src: '/d2sf-2.png', alt: 'D2SF', h: 'h-40', delay: '-1.5s', duration: '4.5s' },
  { src: '/hp-3.png', alt: 'HP', h: 'h-24', delay: '-3s', duration: '5.5s' },
]

const RIGHT_SPONSORS: Sponsor[] = [
  { src: '/kv-4.png', alt: 'KV', h: 'h-32', delay: '-2s', duration: '4.8s' },
  { src: '/bass-5.png', alt: 'Bass', h: 'h-32', delay: '-0.5s', duration: '5.2s' },
  { src: '/wb-6.svg', alt: 'WB', h: 'h-[2.625rem]', delay: '-3.5s', duration: '4.3s' },
]

function SponsorColumn({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <div className="flex flex-col items-center gap-14">
      {sponsors.map((sponsor) => (
        <img
          key={sponsor.src}
          src={sponsor.src}
          alt={sponsor.alt}
          className={`${sponsor.h} w-auto opacity-70 transition-opacity duration-300 hover:opacity-100`}
          style={{
            filter: 'brightness(0.8)',
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
