"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import styles from "./gastos-screen.module.css";

type GastosScreenProps = {
  houseCode: string;
};

const ticketRows = [
  { person: "Laura", concept: "Compra Mercadona", date: "2/01/2026", amount: "23€" },
  { person: "Laura", concept: "Compra papel", date: "2/01/2026", amount: "25€" },
];

const splitRows = [
  {
    concept: "Compra Mercadona",
    meta: "Participantes: Lucia, Claudia, Samuel y Esteban",
    date: "2/01/2026",
    amount: "23€",
  },
  {
    concept: "Factura del wifi",
    meta: "Participantes: Lucia, Claudia, Samuel y Esteban",
    date: "2/01/2026",
    amount: "23€",
  },
];

export function GastosScreen({ houseCode }: GastosScreenProps) {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <Link href={`/dashboard/${houseCode}/menu`} className={styles.backLink}>
            <Image src="/iconos/flechaatras.svg" alt="Volver" width={20} height={20} className={styles.backIcon} />
          </Link>
          <div className={styles.headerCenter}>
            <h1 className={styles.title}>Gastos</h1>
            <p className={styles.subtitle}>Compras, imprevistos y gastos compartidos</p>
          </div>
          <span />
        </header>

        <div className={styles.content}>
          <Card className={`${styles.maroonSection} ${styles.ticketsSection}`}>
            <div className={styles.sectionTop}>
              <div className={styles.sectionTitleWrap}>
                <Link href={`/dashboard/${houseCode}/gastos/anadir-ticket`} className={styles.plusLink} aria-label="Añadir ticket">
                  <Image src="/iconos/A%C3%B1adir.svg" alt="" width={24} height={24} className={styles.plusIcon} />
                </Link>
                <h2 className={styles.sectionTitle}>Tickets de compra</h2>
              </div>
              <Link href={`/dashboard/${houseCode}/gastos/tickets`} className={styles.viewAll}>
                <span className={styles.viewAllContent}>
                  Ver todo
                  <Image src="/iconos/flechascalendario.svg" alt="" width={14} height={14} className={styles.viewAllArrow} />
                </span>
              </Link>
            </div>
            <Card className={`${styles.innerPaper} ${styles.ticketsPaper}`}>
              {ticketRows.map((row) => (
                <div key={`${row.person}-${row.concept}`} className={styles.innerRow}>
                  <div className={styles.leftInfo}>
                    <Image src="/images/IconoperfilM.webp" alt="" width={20} height={20} />
                    <div>
                      <p className={styles.mainText}>
                        {row.person} - {row.concept}
                      </p>
                      <p className={styles.subText}>{row.date}</p>
                    </div>
                  </div>
                  <p className={styles.amount}>{row.amount}</p>
                  <Button className={styles.actionButton}>Ver ticket</Button>
                </div>
              ))}
            </Card>
            <div className={styles.ticketsFooter} aria-hidden="true" />
          </Card>

          <Card className={`${styles.maroonSection} ${styles.divisionSection}`}>
            <div className={styles.sectionTop}>
              <h2 className={styles.sectionTitle}>Division de gastos</h2>
              <Link href={`/dashboard/${houseCode}/gastos/division`} className={styles.viewAll}>
                <span className={styles.viewAllContent}>
                  Ver todo
                  <Image src="/iconos/flechascalendario.svg" alt="" width={14} height={14} className={styles.viewAllArrow} />
                </span>
              </Link>
            </div>
            <Card className={`${styles.innerPaper} ${styles.divisionPaper}`}>
              {splitRows.map((row) => (
                <div key={row.concept} className={styles.innerRow}>
                  <div className={styles.leftInfo}>
                    <Image src="/iconos/building-2-svgrepo-com 1.svg" alt="" width={20} height={20} />
                    <div>
                      <p className={styles.mainText}>{row.concept}</p>
                      <p className={styles.subText}>{row.date}</p>
                      <p className={styles.metaText}>{row.meta}</p>
                    </div>
                  </div>
                  <p className={styles.amount}>{row.amount}</p>
                  <Button className={styles.actionButton}>Ver reparto</Button>
                </div>
              ))}
            </Card>
            <div className={styles.divisionFooter} aria-hidden="true" />
          </Card>

          <Card className={styles.simpleCard}>
            <div className={styles.sectionTop}>
              <div>
                <h2 className={styles.simpleTitle}>Simplificar pagos</h2>
                <p className={styles.simpleSub}>Reducir pagos innecesarios entre companeros de piso</p>
              </div>
              <Link href={`/dashboard/${houseCode}/gastos/simplificar`} className={`${styles.viewAll} ${styles.viewAllRed}`}>
                <span className={styles.viewAllContent}>
                  Ver todo
                  <Image src="/iconos/flechascalendario.svg" alt="" width={14} height={14} className={styles.viewAllArrow} />
                </span>
              </Link>
            </div>

            <div className={styles.payRows}>
              <div className={styles.payRow}>
                <div className={styles.flow}>
                  <span className={styles.personTag}>
                    <Image src="/images/IconoperfilM.webp" alt="" width={16} height={16} />
                    Laura
                  </span>
                  <span className={styles.smallAmount}>23€</span>
                  <Image src="/iconos/flechaderecha.svg" alt="" width={16} height={16} />
                  <span className={styles.personTag}>
                    <Image src="/images/IconoperfilH.webp" alt="" width={16} height={16} />
                    Marc
                  </span>
                  <span className={styles.smallAmount}>23€</span>
                  <Image src="/iconos/flechaderecha.svg" alt="" width={16} height={16} />
                  <span className={styles.personTag}>
                    <Image src="/images/IconoperfilH.webp" alt="" width={16} height={16} />
                    Julian
                  </span>
                </div>
                <Link
                  href={`/dashboard/${houseCode}/gastos/simplificar/pago-simplificado`}
                  className={`convive-button ${styles.actionButton}`}
                >
                  Optimizar
                </Link>
              </div>

              <div className={styles.payRow}>
                <div className={styles.flow}>
                  <span className={styles.personTag}>
                    <Image src="/images/IconoperfilM.webp" alt="" width={16} height={16} />
                    Laura
                  </span>
                  <span className={styles.smallAmount}>23€</span>
                  <Image src="/iconos/flechasdosdirecciones.svg" alt="" width={18} height={18} />
                  <span className={styles.smallAmount}>23€</span>
                  <span className={styles.personTag}>
                    <Image src="/images/IconoperfilH.webp" alt="" width={16} height={16} />
                    Marc
                  </span>
                </div>
                <Link
                  href={`/dashboard/${houseCode}/gastos/simplificar/pago-simplificado`}
                  className={`convive-button ${styles.actionButton}`}
                >
                  Optimizar
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}



