"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import styles from "./gastos-division-screen.module.css";

type GastosDivisionScreenProps = {
  houseCode: string;
};

const monthlySplits = [
  {
    month: "Enero 2026",
    rows: [
      { concept: "Compra Mercadona", date: "2/01/2026", meta: "Participantes: Lucia, Claudia, Samuel y Esteban", amount: "23€" },
      { concept: "Factura del wifi", date: "2/01/2026", meta: "Participantes: Lucia, Claudia, Samuel y Esteban", amount: "23€" },
      { concept: "Compra Mercadona", date: "2/01/2026", meta: "Participantes: Lucia, Claudia, Samuel y Esteban", amount: "23€" },
      { concept: "Factura del wifi", date: "2/01/2026", meta: "Participantes: Lucia, Claudia, Samuel y Esteban", amount: "23€" },
    ],
  },
  {
    month: "Diciembre 2025",
    rows: [
      { concept: "Compra Mercadona", date: "2/01/2026", meta: "Participantes: Lucia, Claudia, Samuel y Esteban", amount: "23€" },
      { concept: "Factura del wifi", date: "2/01/2026", meta: "Participantes: Lucia, Claudia, Samuel y Esteban", amount: "23€" },
      { concept: "Compra Mercadona", date: "2/01/2026", meta: "Participantes: Lucia, Claudia, Samuel y Esteban", amount: "23€" },
      { concept: "Factura del wifi", date: "2/01/2026", meta: "Participantes: Lucia, Claudia, Samuel y Esteban", amount: "23€" },
      { concept: "Compra Mercadona", date: "2/01/2026", meta: "Participantes: Lucia, Claudia, Samuel y Esteban", amount: "23€" },
      { concept: "Factura del wifi", date: "2/01/2026", meta: "Participantes: Lucia, Claudia, Samuel y Esteban", amount: "23€" },
    ],
  },
];

export function GastosDivisionScreen({ houseCode }: GastosDivisionScreenProps) {
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
                  <Image src="/iconos/flechaatras.svg" alt="" width={42} height={42} />
                </Link>
                <h2 className={styles.cardTitle}>Division de gastos</h2>
              </div>
              <div className={styles.searchWrap}>
                <input className={styles.searchInput} placeholder="Buscar" />
                <Image src="/iconos/Lupa.svg" alt="" width={14} height={14} />
              </div>
            </div>

            <div className={styles.listWrap}>
              {monthlySplits.map((group) => (
                <section key={group.month} className={styles.monthBlock}>
                  <h3 className={styles.monthTitle}>{group.month}</h3>
                  <div className={styles.monthRows}>
                    {group.rows.map((item, idx) => (
                      <div key={`${group.month}-${idx}`} className={styles.row}>
                        <div className={styles.left}>
                          <Image src="/iconos/building-2-svgrepo-com 1.svg" alt="" width={20} height={20} />
                          <div>
                            <p className={styles.main}>{item.concept}</p>
                            <p className={styles.sub}>{item.date}</p>
                            <p className={styles.meta}>{item.meta}</p>
                          </div>
                        </div>
                        <p className={styles.amount}>{item.amount}</p>
                        <Button className={styles.button}>Ver reparto</Button>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}





