import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function parseUserAgent(ua: string): { browser: string; device_type: string } {
  let browser = 'Unknown'
  let device_type = 'desktop'

  if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Edg')) browser = 'Edge'
  else if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari')) browser = 'Safari'
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera'

  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    device_type = /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile'
  }

  return { browser, device_type }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data: link, error } = await supabase
    .from('links')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !link) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 })
  }

  const userAgent = request.headers.get('user-agent') || ''
  const { browser, device_type } = parseUserAgent(userAgent)

  const country = request.headers.get('x-vercel-ip-country') ||
                  request.headers.get('cf-ipcountry') ||
                  null

  const referrer = request.headers.get('referer') || null

  supabase.from('clicks').insert({
    link_id: link.id,
    referrer,
    country,
    device_type,
    browser,
    user_agent: userAgent,
  }).then(() => {})

  return NextResponse.redirect(link.original_url, { status: 302 })
}
