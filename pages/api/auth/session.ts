import type { NextApiRequest, NextApiResponse } from 'next'
import { auth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false })

  try {
    // Normalize headers to plain object to avoid issues
    const headersObj = Object.fromEntries(Object.entries(req.headers)) as Record<string, string>
    const session = await auth.api.getSession({ headers: headersObj as any })

    if (!session) {
      return res.status(401).json({ ok: false })
    }

    return res.status(200).json({ ok: true, session })
  } catch (err) {
    console.error('Error validating session', err)
    return res.status(500).json({ ok: false, error: 'internal' })
  }
}
