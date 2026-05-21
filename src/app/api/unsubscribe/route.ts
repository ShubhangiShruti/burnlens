import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const unsubscribeHtml = `<html><body style="font-family:sans-serif;max-width:500px;margin:60px auto;text-align:center">
  <h1>Unsubscribed</h1>
  <p>You will no longer receive pricing change notifications from BurnLens.</p>
  <a href="https://burnlens.vercel.app">Return to BurnLens</a>
  </body></html>`

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (email) {
    await supabase.from('audits').update({ unsubscribed: true }).eq('user_email', email)
  }

  return new NextResponse(unsubscribeHtml, {
    headers: {
      'content-type': 'text/html',
    },
  })
}
