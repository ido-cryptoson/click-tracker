import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let slug = ''
  for (let i = 0; i < 6; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return slug
}

export async function GET() {
  const { data: links, error } = await supabase
    .from('links')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const linksWithCounts = await Promise.all(
    links.map(async (link) => {
      const { count } = await supabase
        .from('clicks')
        .select('*', { count: 'exact', head: true })
        .eq('link_id', link.id)

      return { ...link, click_count: count || 0 }
    })
  )

  return NextResponse.json(linksWithCounts)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { url } = body

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  let slug = generateSlug()
  let attempts = 0

  while (attempts < 5) {
    const { data: existing } = await supabase
      .from('links')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!existing) break
    slug = generateSlug()
    attempts++
  }

  const { data: link, error } = await supabase
    .from('links')
    .insert({ slug, original_url: url })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(link)
}
