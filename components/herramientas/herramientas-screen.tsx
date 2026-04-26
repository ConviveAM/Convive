"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import { useComparador } from "../../hooks/useComparador";
import { useSimulador } from "../../hooks/useSimulador";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import styles from "./herramientas-screen.module.css";

type HerramientasScreenProps = {
  houseCode: string;
  dashboardPath: string;
};

export function HerramientasScreen({
  houseCode,
  dashboardPath,
}: HerramientasScreenProps) {
  const { loading: simulando, respuesta, error: simuladorError, simular } =
    useSimulador(houseCode);
  const {
    loading: comparando,
    data: comparador,
    error: comparadorError,
    comparar,
  } = useComparador(houseCode);

  const categoriaActiva = useMemo(
    () =>
      (comparador?.categoria?.toLowerCase() as "luz" | "agua" | "wifi") ||
      "luz",
    [comparador?.categoria]
  );

  useEffect(() => {
    void comparar("luz");
  }, [comparar]);

  const onSimularEntra = () =>
    simular("entra_alguien", {
      nombre: "Nuevo miembro",
      tamano_habitacion: "mediana",
    });

  const onSimularSale = () => simular("sale_alguien", {});

  const onSimularCambio = () => {
    const descripcion =
      window.prompt("Describe el cambio de condiciones a simular:")?.trim() ||
      "";
    if (!descripcion) {
      return;
    }
    void simular("cambiar_condiciones", { descripcion });
  };

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <Link href={`${dashboardPath}/menu`} className={styles.backLink}>
            <Image
              src="/iconos/flechaatras.svg"
              alt="Volver"
              width={20}
              height={20}
              className={styles.backIcon}
            />
          </Link>
          <div className={styles.headerCenter}>
            <h1 className={styles.title}>Herramientas</h1>
            <p className={styles.subtitle}>Simula cambios y ahorra en gastos</p>
          </div>
          <span />
        </header>

        <div className={styles.content}>
          <Card className={styles.whiteCard}>
            <h2 className={styles.sectionTitle}>Simulador de escenarios</h2>
            <p className={styles.sectionText}>
              Simula como afectaria a los pagos comunes, la entrada o salida de
              personas al piso o incluso el cambio en otros factores.
            </p>

            <div className={styles.actionsRow}>
              <Button
                className={styles.smallButton}
                onClick={onSimularEntra}
                disabled={simulando}
              >
                + Entra alguien
              </Button>
              <Button
                className={styles.smallButton}
                onClick={onSimularSale}
                disabled={simulando}
              >
                - Sale alguien
              </Button>
              <Button
                className={styles.smallButton}
                onClick={onSimularCambio}
                disabled={simulando}
              >
                Cambiar condiciones
              </Button>
            </div>

            {simulando && (
              <p className={styles.helperText}>La IA esta analizando tu piso...</p>
            )}
            {simuladorError && (
              <p className={styles.errorText}>{simuladorError}</p>
            )}
            {respuesta && (
              <Card className={styles.resultCard}>
                <pre className={styles.simulationText}>{respuesta}</pre>
              </Card>
            )}
          </Card>

          <Card className={styles.maroonCard}>
            <h2 className={styles.maroonTitle}>Comparador de gastos</h2>

            <div className={styles.tabsRow}>
              <button
                className={`${styles.tab} ${
                  categoriaActiva === "luz" ? styles.tabActive : ""
                }`}
                onClick={() => void comparar("luz")}
                disabled={comparando}
              >
                Luz
              </button>
              <button
                className={`${styles.tab} ${
                  categoriaActiva === "agua" ? styles.tabActive : ""
                }`}
                onClick={() => void comparar("agua")}
                disabled={comparando}
              >
                Agua
              </button>
              <button
                className={`${styles.tab} ${
                  categoriaActiva === "wifi" ? styles.tabActive : ""
                }`}
                onClick={() => void comparar("wifi")}
                disabled={comparando}
              >
                Wifi
              </button>
            </div>

            {comparando && (
              <p className={styles.helperTextMaroon}>Comparando tarifas...</p>
            )}
            {comparadorError && (
              <p className={styles.errorTextMaroon}>{comparadorError}</p>
            )}

            {comparador && (
              <div className={styles.compareGrid}>
                <Card className={styles.compareCard}>
                  <div className={styles.compareRow}>
                    <div className={styles.vendorLeft}>
                      <Image
                        src="/iconos/building-2-svgrepo-com 1.svg"
                        alt=""
                        width={20}
                        height={20}
                      />
                      <div>
                        <p>
                          {comparador.proveedor_actual?.nombre ||
                            "Proveedor actual"}
                        </p>
                        <small>
                          {comparador.proveedor_actual?.valoracion ||
                            "Referencia actual"}
                        </small>
                      </div>
                    </div>
                    <strong>
                      {Math.round(
                        comparador.proveedor_actual?.importe_mensual || 0
                      )}
                      €
                    </strong>
                  </div>
                  <p className={styles.compareNote}>
                    {comparador.recomendacion ||
                      "Basado en tarifas de referencia del mercado."}
                  </p>
                </Card>

                <Card className={styles.compareCard}>
                  {(comparador.alternativas || []).slice(0, 2).map((item, i) => (
                    <div
                      key={`${item.nombre}-${i}`}
                      className={`${styles.compareRow} ${
                        i > 0 ? styles.compareRowSecond : ""
                      }`}
                    >
                      <div className={styles.vendorLeft}>
                        <Image
                          src="/iconos/building-2-svgrepo-com 1.svg"
                          alt=""
                          width={20}
                          height={20}
                        />
                        <div>
                          <p>{item.nombre}</p>
                        </div>
                      </div>
                      <div className={styles.priceRight}>
                        <strong>{Math.round(item.importe_estimado || 0)}€</strong>
                        <span>↓{Math.round(item.ahorro_mensual || 0)}€</span>
                      </div>
                    </div>
                  ))}

                  <p className={styles.legalNote}>
                    {comparador.nota_legal ||
                      "Basado en tarifas de referencia del mercado."}
                  </p>
                </Card>
              </div>
            )}
          </Card>
        </div>
      </section>
    </main>
  );
}
