"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "../ui/card";
import styles from "./gastos-simplificar-screen.module.css";

type GastosSimplificarScreenProps = {
  houseCode: string;
};

const rows = [
  { from: "Laura", mid: "Marc", to: "Julian", amount: "23€", twoWay: false },
  { from: "Laura", mid: "Marc", to: "", amount: "23€", twoWay: true },
  { from: "Laura", mid: "Marc", to: "Julian", amount: "23€", twoWay: false },
  { from: "Laura", mid: "Marc", to: "", amount: "23€", twoWay: true },
];

export function GastosSimplificarScreen({ houseCode }: GastosSimplificarScreenProps) {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <Link href={`/dashboard/${houseCode}/gastos`} className={styles.backLink}>
            <Image src="/iconos/flechaatras.svg" alt="Volver" width={20} height={20} className={styles.backIcon} />
          </Link>
          <div className={styles.headerCenter}>
            <h1 className={styles.title}>Gastos</h1>
            <p className={styles.subtitle}>Compras, imprevistos y gastos compartidos</p>
          </div>
          <span />
        </header>

        <div className={styles.content}>
          <Card className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.titleWrap}>
                <Link href={`/dashboard/${houseCode}/gastos`} className={styles.inlineBack} aria-label="Volver a gastos">
                  ←
                </Link>
                <h2 className={styles.cardTitle}>Simplificar pagos</h2>
              </div>
            </div>

            <h3 className={styles.monthTitle}>Enero 2026</h3>

            <div className={styles.rows}>
              {rows.map((row, idx) => (
                <div key={`${row.from}-${row.mid}-${idx}`} className={styles.row}>
                  <div className={styles.flow}>
                    <span className={styles.personTag}>
                      <Image src="/images/IconoperfilM.webp" alt="" width={18} height={18} />
                      {row.from}
                    </span>
                    <span className={styles.smallAmount}>{row.amount}</span>
                    <Image
                      src={row.twoWay ? "/iconos/flechasdosdirecciones.svg" : "/iconos/flechapagos.svg"}
                      alt=""
                      width={18}
                      height={18}
                    />
                    <span className={styles.personTag}>
                      <Image src="/images/IconoperfilH.webp" alt="" width={18} height={18} />
                      {row.mid}
                    </span>
                    <span className={styles.smallAmount}>{row.amount}</span>
                    {row.to ? (
                      <>
                        <Image src="/iconos/flechapagos.svg" alt="" width={18} height={18} />
                        <span className={styles.personTag}>
                          <Image src="/images/IconoperfilH.webp" alt="" width={18} height={18} />
                          {row.to}
                        </span>
                      </>
                    ) : null}
                  </div>
                  <Link href={`/dashboard/${houseCode}/gastos/simplificar/pago-simplificado`} className={`convive-button ${styles.button}`}>
                    Optimizar
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
