import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiDocs } from '@/lib/swagger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const spec = await getApiDocs();
    return res.status(200).json(spec);
  } catch (error) {
    console.error("Error generating API docs:", error);
    return res.status(500).json({ error: 'No fue posible generar la documentación' });
  }
}
