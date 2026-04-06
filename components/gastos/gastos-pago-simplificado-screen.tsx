"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import styles from "./gastos-pago-simplificado-screen.module.css";

type GastosPagoSimplificadoScreenProps = {
  houseCode: string;
};

export function GastosPagoSimplificadoScreen({ houseCode }: GastosPagoSimplificadoScreenProps) {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <Link href={`/dashboard/${houseCode}/gastos/simplificar`} className={styles.backLink}>
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
              <Link href={`/dashboard/${houseCode}/gastos/simplificar`} className={styles.inlineBack} aria-label="Volver a simplificar">
                ←
              </Link>
              <h2 className={styles.cardTitle}>Pago simplificado</h2>
            </div>

            <Card className={styles.resultBox}>
              <div className={styles.flow}>
                <span className={styles.personTag}>
                  <Image src="/images/IconoperfilM.webp" alt="" width={22} height={22} />
                  Laura
                </span>
                <span className={styles.amount}>23€</span>
                <Image src="/iconos/flechapagos.svg" alt="" width={18} height={18} />
                <span className={styles.personTag}>
                  <Image src="/images/IconoperfilH.webp" alt="" width={22} height={22} />
                  Marc
                </span>
                <span className={styles.amount}>23€</span>
                <Image src="/iconos/flechapagos.svg" alt="" width={18} height={18} />
                <span className={styles.personTag}>
                  <Image src="/images/IconoperfilH.webp" alt="" width={22} height={22} />
                  Julian
                </span>
              </div>
              <div className={styles.resultLabel}>Actual</div>
            </Card>

            <Card className={styles.resultBox}>
              <div className={styles.flow}>
                <span className={styles.personTag}>
                  <Image src="/images/IconoperfilM.webp" alt="" width={22} height={22} />
                  Laura
                </span>
                <span className={styles.amount}>23€</span>
                <Image src="/iconos/flechapagos.svg" alt="" width={18} height={18} />
                <span className={styles.personTag}>
                  <Image src="/images/IconoperfilH.webp" alt="" width={22} height={22} />
                  Julian
                </span>
              </div>
              <div className={styles.resultLabel}>Simplificado</div>
            </Card>

            <div className={styles.saveWrap}>
              <Button className={styles.saveButton}>Guardar</Button>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}

