import { NextRequest, NextResponse } from 'next/server'
import { Polar } from '@polar-sh/sdk'

const polar = new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN! })

const PRICE_IDS: Record<string, string | undefined> = {
  s1: process.env.POLAR_S1_PRICE_ID,
  s2: process.env.POLAR_S2_PRICE_ID,
  s3: process.env.POLAR_S3_PRICE_ID,
  s4: process.env.POLAR_S4_PRICE_ID,
}

export async function POST(request: NextRequest) {
  const { tier } = await request.json()

  const priceId = PRICE_IDS[tier]
  if (!priceId) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  const checkout = await polar.checkouts.create({
    products: [priceId],
    successUrl: `${request.nextUrl.origin}/support?success=true`,
  })

  return NextResponse.json({ url: checkout.url })
}
