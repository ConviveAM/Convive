"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createPendingInvoiceExpenseAction } from "../../app/actions/invoice-actions";
import type { AddInvoiceFormOptions } from "../../lib/dashboard-types";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import styles from "./facturas-add-screen.module.css";

type FacturasAddScreenProps = {
  houseCode: string;
  dashboardPath: string;
  formOptions: AddInvoiceFormOptions;
};

function formatDate(date?: Date) {
  if (!date) return "Selecciona una fecha";
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function toIsoDate(date?: Date) {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeManualCategory(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function FacturasAddScreen({
  houseCode,
  dashboardPath,
  formOptions,
}: FacturasAddScreenProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    formOptions.categories[0]?.category_id ?? null
  );
  const [manualCategoryName, setManualCategoryName] = useState("");
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(
    formOptions.members.map((member) => member.profile_id)
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const basePath = dashboardPath;
  const hasMembers = formOptions.members.length > 0;

  const toggleParticipant = (profileId: string) => {
    setSelectedParticipantIds((current) =>
      current.includes(profileId)
        ? current.filter((item) => item !== profileId)
        : [...current, profileId]
    );
  };

  const selectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setManualCategoryName("");
  };

  const resetForm = () => {
    setDate(new Date());
    setTitle("");
    setTotalAmount("");
    setNotes("");
    setSelectedCategoryId(formOptions.categories[0]?.category_id ?? null);
    setManualCategoryName("");
    setSelectedParticipantIds(
      formOptions.members.map((member) => member.profile_id)
    );
    setErrorMessage(null);
  };

  const handleSaveInvoice = () => {
    const normalizedTitle = title.trim();
    const invoiceDate = toIsoDate(date);
    const parsedTotalAmount = Number(totalAmount.replace(",", "."));
    const normalizedManualCategory =
      normalizeManualCategory(manualCategoryName);
    const invoiceCategoryId = normalizedManualCategory
      ? null
      : selectedCategoryId;
    const customCategoryName = normalizedManualCategory || null;

    if (!normalizedTitle) {
      setErrorMessage("Introduce un titulo para la factura.");
      return;
    }

    if (!invoiceDate) {
      setErrorMessage("Selecciona la fecha de factura.");
      return;
    }

    if (!Number.isFinite(parsedTotalAmount) || parsedTotalAmount <= 0) {
      setErrorMessage("Introduce un importe total valido.");
      return;
    }

    if (!invoiceCategoryId && !customCategoryName) {
      setErrorMessage("Selecciona un tipo de factura o escribe uno manual.");
      return;
    }

    if (!hasMembers) {
      setErrorMessage("No hay participantes disponibles en este piso.");
      return;
    }

    if (!selectedParticipantIds.length) {
      setErrorMessage("Selecciona al menos un miembro del piso.");
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const result = await createPendingInvoiceExpenseAction({
        houseCode,
        dashboardPath: basePath,
        title: normalizedTitle,
        invoiceDate,
        totalAmount: parsedTotalAmount,
        participantProfileIds: selectedParticipantIds,
        invoiceCategoryId,
        customCategoryName,
        notes: notes.trim() ? notes : null,
        paidByProfileId: null,
        invoiceFilePath: null,
      });

      if (result.success) {
        resetForm();
        router.push(`${basePath}/facturas`);
        router.refresh();
        return;
      }

      if ("error" in result) {
        setErrorMessage(result.error);
      }
    });
  };

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <Link href={`${basePath}/facturas`} className={styles.backLink}>
            <Image
              src="/iconos/flechaatras.svg"
              alt="Volver"
              width={20}
              height={20}
              className={styles.backIcon}
            />
          </Link>
          <div className={styles.headerCenter}>
            <h1 className={styles.title}>Facturas</h1>
            <p className={styles.subtitle}>Gestiona las facturas del piso de forma clara</p>
          </div>
          <span />
        </header>

        <div className={styles.content}>
          <Card className={styles.card}>
            <div className={styles.cardTop}>
              <Link
                href={`${basePath}/facturas`}
                className={styles.inlineBack}
                aria-label="Volver a facturas"
              >
                <Image src="/iconos/flechaatras.svg" alt="" width={32} height={32} />
              </Link>
              <h2 className={styles.cardTitle}>Anadir factura</h2>
            </div>

            <section className={styles.block}>
              <h3 className={styles.blockTitle}>1 - Adjunta la factura</h3>
              <div className={styles.uploadBox}>
                <Image
                  src="/iconos/Escanearimagen.svg"
                  alt="Subir imagen"
                  width={48}
                  height={48}
                />
              </div>
              <div className={styles.fieldsGrid}>
                <label className={styles.fieldGroup}>
                  <span className={styles.fieldLabel}>Titulo</span>
                  <input
                    className={styles.fieldInput}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Factura mensual"
                  />
                </label>
                <label className={styles.fieldGroup}>
                  <span className={styles.fieldLabel}>Importe total</span>
                  <input
                    className={styles.fieldInput}
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={totalAmount}
                    onChange={(event) => setTotalAmount(event.target.value)}
                    placeholder="0,00"
                  />
                </label>
              </div>
            </section>

            <section className={styles.block}>
              <h3 className={styles.blockTitle}>2 - Elige que tipo de factura es</h3>
              {formOptions.categories.length ? (
                <div className={styles.typesRow}>
                  {formOptions.categories.map((category) => (
                    <label key={category.category_id} className={styles.typeItem}>
                      <Checkbox
                        className={styles.checkbox}
                        checked={
                          selectedCategoryId === category.category_id &&
                          !manualCategoryName.trim()
                        }
                        onCheckedChange={() => selectCategory(category.category_id)}
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyCopy}>No hay categorias configuradas.</p>
              )}
              <label className={styles.manualCategory}>
                <span className={styles.fieldLabel}>Categoria manual</span>
                <input
                  className={styles.fieldInput}
                  value={manualCategoryName}
                  onChange={(event) => setManualCategoryName(event.target.value)}
                  placeholder="Otra factura"
                />
              </label>
            </section>

            <section className={styles.block}>
              <h3 className={styles.blockTitle}>3 - Selecciona los miembros del piso</h3>
              {hasMembers ? (
                <div className={styles.membersCol}>
                  {formOptions.members.map((member) => (
                    <label key={member.profile_id} className={styles.memberRow}>
                      <Checkbox
                        className={styles.checkbox}
                        checked={selectedParticipantIds.includes(member.profile_id)}
                        onCheckedChange={() => toggleParticipant(member.profile_id)}
                      />
                      <Image
                        src="/images/IconoperfilM.webp"
                        alt=""
                        width={22}
                        height={22}
                      />
                      <span>{member.display_name}</span>
                      <span className={styles.memberRole}>{member.role}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyCopy}>No hay participantes disponibles.</p>
              )}
            </section>

            <section className={styles.block}>
              <h3 className={styles.blockTitle}>4 - Fecha de factura</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button className={styles.dateTrigger}>
                    {formatDate(date)}
                    <Image
                      src="/iconos/flechascalendario.svg"
                      alt=""
                      width={14}
                      height={14}
                      className={styles.dateArrow}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className={styles.calendarPopover}>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className={styles.calendar}
                  />
                </PopoverContent>
              </Popover>
            </section>

            <section className={styles.block}>
              <h3 className={styles.blockTitle}>Notas</h3>
              <textarea
                className={styles.fieldTextarea}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Anade un contexto util para el piso"
                rows={3}
              />
            </section>

            {errorMessage ? (
              <p className={styles.feedbackMessage}>{errorMessage}</p>
            ) : null}

            <div className={styles.saveWrap}>
              <Button
                className={styles.saveButton}
                onClick={handleSaveInvoice}
                disabled={isPending}
              >
                {isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
