"use client";

import { useState } from "react";

type TipoEscenario = "entra_alguien" | "sale_alguien" | "cambiar_condiciones";

export function useSimulador(pisoId: string) {
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const simular = async (
    tipoEscenario: TipoEscenario,
    parametros: Record<string, unknown>
  ) => {
    setLoading(true);
    setError(null);
    setRespuesta(null);

    try {
      const res = await fetch("/api/simular-escenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pisoId, tipoEscenario, parametros }),
      });

      const payload = (await res.json()) as {
        success: boolean;
        respuesta?: string;
        error?: string;
      };

      if (!res.ok || !payload.success) {
        throw new Error(payload.error || "No se pudo simular el escenario");
      }

      setRespuesta(payload.respuesta ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return { loading, respuesta, error, simular };
}
