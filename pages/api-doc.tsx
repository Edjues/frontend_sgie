import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDoc() {
  const [spec, setSpec] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/docs')
      .then((r) => {
        if (!r.ok) throw new Error('No fue posible obtener /api/docs');
        return r.json();
      })
      .then((data) => setSpec(data))
      .catch((e) => setError(String(e.message || e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando documentación...</p>;
  if (error) return <p>Error cargando docs: {error}</p>;
  if (!spec) return <p>No se encontró la especificación de la API.</p>;

  return <SwaggerUI spec={spec as any} />;
}
