"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import styles from "./gastos-tickets-screen.module.css";

type GastosTicketsScreenProps = {
  houseCode: string;
};

const monthlyTickets = [
  {
    month: "Enero 2026",
    rows: [
      { concept: "Laura - Compra Mercadona - 30€", date: "2/01/2026" },
      { concept: "Laura - Compra Mercadona - 30€", date: "2/01/2026" },
      { concept: "Laura - Compra Mercadona - 30€", date: "2/01/2026" },
    ],
  },
  {
    month: "Diciembre 2025",
    rows: [
      { concept: "Laura - Compra Mercadona - 30€", date: "2/01/2026" },
      { concept: "Laura - Compra Mercadona - 30€", date: "2/01/2026" },
      { concept: "Laura - Compra Mercadona - 30€", date: "2/01/2026" },
      { concept: "Laura - Compra Mercadona - 30€", date: "2/01/2026" },
      { concept: "Laura - Compra Mercadona - 30€", date: "2/01/2026" },
      { concept: "Laura - Compra Mercadona - 30€", date: "2/01/2026" },
    ],
  },
];

export function GastosTicketsScreen({ houseCode }: GastosTicketsScreenProps) {
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
          <Card className={styles.ticketsCard}>
            <div className={styles.cardTop}>
              <div className={styles.cardTitleWrap}>
                <Link href={`/dashboard/${houseCode}/gastos`} className={styles.inlineBack} aria-label="Volver a gastos">
                  <Image src="/iconos/flechaatras.svg" alt="" width={42} height={42} />
                </Link>
                <h2 className={styles.cardTitle}>Tickets de compra</h2>
              </div>

              <div className={styles.searchWrap}>
                <input className={styles.searchInput} placeholder="Buscar" />
                <Image src="/iconos/Lupa.svg" alt="" width={14} height={14} className={styles.searchIcon} />
              </div>
            </div>

            <div className={styles.listWrap}>
              {monthlyTickets.map((group) => (
                <section key={group.month} className={styles.monthBlock}>
                  <h3 className={styles.monthTitle}>{group.month}</h3>
                  <div className={styles.monthRows}>
                    {group.rows.map((ticket, index) => (
                      <div className={styles.ticketRow} key={`${group.month}-${index}`}>
                        <div className={styles.ticketLeft}>
                          <Image src="/images/IconoperfilM.webp" alt="" width={20} height={20} />
                          <div>
                            <p className={styles.ticketMain}>{ticket.concept}</p>
                            <p className={styles.ticketDate}>{ticket.date}</p>
                          </div>
                        </div>
                        <Button className={styles.ticketButton}>Ver ticket</Button>
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





