import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data: link, error: linkError } = await supabase
    .from('links')
    .select('*')
    .eq('slug', slug)
    .single()

  if (linkError || !link) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 })
  }

  const { data: clicks, error: clicksError } = await supabase
    .from('clicks')
    .select('*')
    .eq('link_id', link.id)
    .order('clicked_at', { ascending: false })

  if (clicksError) {
    return NextResponse.json({ error: clicksError.message }, { status: 500 })
  }

  const totalClicks = clicks?.length || 0
  const countryStats: Record<string, number> = {}
  const browserStats: Record<string, number> = {}
  const deviceStats: Record<string, number> = {}
  const clicksOverTime: Record<string, number> = {}

  clicks?.forEach((click) => {
    const country = click.country || 'Unknown'
    countryStats[country] = (countryStats[country] || 0) + 1

    const browser = click.browser || 'Unknown'
    browserStats[browser] = (browserStats[browser] || 0) + 1

    const device = click.device_type || 'Unknown'
    deviceStats[device] = (deviceStats[device] || 0) + 1

    const date = new Date(click.clicked_at).toISOString().split('T')[0]
    clicksOverTime[date] = (clicksOverTime[date] || 0) + 1
  })

  return NextResponse.json({
    link,
    totalClicks,
    countryStats,
    browserStats,
    deviceStats,
    clicksOverTime,
    recentClicks: clicks?.slice(0, 10) || [],
  })
}
