"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { SharedExpense } from "../../lib/dashboard-types";
import {
  formatCurrency,
  formatMonthLabel,
  formatShortDate,
} from "../../lib/dashboard-presenters";
import { Card } from "../ui/card";
import styles from "./gastos-division-screen.module.css";

type GastosDivisionScreenProps = {
  houseCode: string;
  dashboardPath: string;
  sharedExpenses?: SharedExpense[];
};

function matchesSearch(expense: SharedExpense, searchTerm: string) {
  const haystack = [
    expense.title,
    expense.paid_by_name,
    expense.participants_text,
    expense.expense_type,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchTerm);
}

function formatSettlementStatus(status: string | null) {
  if (status === "settled") {
    return "Liquidado";
  }

  if (status === "partial") {
    return "Parcial";
  }

  return "Pendiente de liquidar";
}

export function GastosDivisionScreen({
  houseCode: _houseCode,
  dashboardPath,
  sharedExpenses = [],
}: GastosDivisionScreenProps) {
  const [searchValue, setSearchValue] = useState("");
  const basePath = dashboardPath;
  const normalizedSearchValue = searchValue.trim().toLowerCase();

  const groupedExpenses = sharedExpenses
    .filter((expense) =>
      normalizedSearchValue ? matchesSearch(expense, normalizedSearchValue) : true
    )
    .reduce<Array<{ month: string; rows: SharedExpense[] }>>((groups, expense) => {
      const month = formatMonthLabel(expense.expense_date);
      const currentGroup = groups.find((group) => group.month === month);

      if (currentGroup) {
        currentGroup.rows.push(expense);
        return groups;
      }

      groups.push({ month, rows: [expense] });
      return groups;
    }, []);

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <Link href={`${basePath}/menu`} className={styles.backLink}>
            <Image
              src="/iconos/flechaatras.svg"
              alt="Volver"
              width={20}
              height={20}
              className={styles.backIcon}
            />
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
                <Link
                  href={`${basePath}/gastos`}
                  className={styles.inlineBack}
                  aria-label="Volver a gastos"
                >
                  <Image
                    src="/iconos/flechaatras.svg"
                    alt=""
                    width={34}
                    height={34}
                  />
                </Link>
                <h2 className={styles.cardTitle}>Division de gastos</h2>
              </div>
              <div className={styles.searchWrap}>
                <input
                  className={styles.searchInput}
                  placeholder="Buscar"
                  aria-label="Buscar gastos"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                />
                <Image src="/iconos/Lupa.svg" alt="" width={14} height={14} />
              </div>
            </div>

            <div className={styles.listWrap}>
              {groupedExpenses.length ? (
                groupedExpenses.map((group) => (
                  <section key={group.month} className={styles.monthBlock}>
                    <h3 className={styles.monthTitle}>{group.month}</h3>
                    <div className={styles.monthRows}>
                      {group.rows.map((expense) => (
                        <div key={expense.expense_id} className={styles.row}>
                          <div className={styles.left}>
                            <Image
                              src="/iconos/building-2-svgrepo-com 1.svg"
                              alt=""
                              width={20}
                              height={20}
                            />
                            <div>
                              <p className={styles.main}>{expense.title}</p>
                              <p className={styles.sub}>
                                {formatShortDate(expense.expense_date)} - Pago{" "}
                                {expense.paid_by_name}
                              </p>
                              <p className={styles.meta}>
                                Participantes:{" "}
                                {expense.participants_text || "Sin participantes"}
                              </p>
                              <p className={styles.statusLine}>
                                Estado general:{" "}
                                {formatSettlementStatus(expense.settlement_status)}
                              </p>
                            </div>
                          </div>
                          <p className={styles.amount}>
                            {formatCurrency(expense.total_amount, expense.currency)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <p className={styles.emptyState}>
                  No hay gastos compartidos visibles ahora mismo.
                </p>
              )}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
