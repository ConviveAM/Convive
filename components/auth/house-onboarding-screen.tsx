"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  updateHouseMemberSettingsAction,
} from "../../app/backend/endpoints/auth/actions";
import type { ProfileSettingsData } from "../../lib/dashboard-types";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import styles from "./house-onboarding-screen.module.css";

type HouseOnboardingScreenProps = {
  houseCode: string;
  dashboardPath: string;
  settings: ProfileSettingsData;
};

function parseIsoDate(value: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function toIsoDate(value?: Date) {
  if (!value) return "";
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value?: Date) {
  if (!value) return "dd/mm/aaaa";
  const day = `${value.getDate()}`.padStart(2, "0");
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const year = value.getFullYear();
  return `${day}/${month}/${year}`;
}

export function HouseOnboardingScreen({
  houseCode,
  dashboardPath,
  settings,
}: HouseOnboardingScreenProps) {
  const router = useRouter();
  const [roomLabel, setRoomLabel] = useState(
    settings.house_member.room_label ?? ""
  );
  const [roomSize, setRoomSize] = useState(settings.house_member.room_size ?? "");
  const [stayStartDate, setStayStartDate] = useState(
    settings.house_member.stay_start_date ?? ""
  );
  const [stayEndDate, setStayEndDate] = useState(
    settings.house_member.stay_end_date ?? ""
  );
  const stayStartDateValue = useMemo(
    () => parseIsoDate(stayStartDate),
    [stayStartDate]
  );
  const stayEndDateValue = useMemo(() => parseIsoDate(stayEndDate), [stayEndDate]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setFeedbackMessage(null);
    startTransition(async () => {
      const houseResult = await updateHouseMemberSettingsAction({
        houseCode,
        dashboardPath,
        roomLabel,
        roomSize,
        stayStartDate,
        stayEndDate,
      });

      if (!houseResult.success) {
        setFeedbackMessage(
          "error" in houseResult
            ? houseResult.error
            : "No se pudo guardar la configuración del piso."
        );
        return;
      }

      router.push(dashboardPath);
      router.refresh();
    });
  };

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <h1 className={styles.title}>Bienvenido</h1>
        <Image
          src="/Logonegro.webp"
          alt="Logo Convive"
          width={290}
          height={95}
          className={styles.logo}
          priority
        />
        <p className={styles.subtitle}>Configura tu habitación</p>

        <div className={styles.cardWrap}>
          <div className={styles.card}>
            <div className={styles.top}>
              <h2 className={styles.sectionTitle}>Datos de estancia</h2>
              <div className={styles.slot} />
            </div>

            <div className={styles.panel}>
              <div className={styles.grid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Alquiler mensual</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={styles.input}
                    value={roomLabel}
                    onChange={(event) => setRoomLabel(event.target.value)}
                    placeholder="Ej: 450"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Tamaño de habitación</span>
                  <select
                    className={styles.select}
                    value={roomSize}
                    onChange={(event) => setRoomSize(event.target.value)}
                  >
                    <option value="">Selecciona Tamaño</option>
                    <option value="Grande">Grande</option>
                    <option value="Mediana">Mediana</option>
                    <option value="Pequeña">Pequeña</option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Entrada</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button className={styles.dateTrigger}>
                        {formatDate(stayStartDateValue)}
                        <span className={styles.dateArrow} aria-hidden="true" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className={styles.calendarPopover}>
                      <Calendar
                        mode="single"
                        selected={stayStartDateValue}
                        onSelect={(value) => setStayStartDate(toIsoDate(value))}
                        className={styles.calendar}
                      />
                    </PopoverContent>
                  </Popover>
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Salida</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button className={styles.dateTrigger}>
                        {formatDate(stayEndDateValue)}
                        <span className={styles.dateArrow} aria-hidden="true" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className={styles.calendarPopover}>
                      <Calendar
                        mode="single"
                        selected={stayEndDateValue}
                        onSelect={(value) => setStayEndDate(toIsoDate(value))}
                        className={styles.calendar}
                      />
                    </PopoverContent>
                  </Popover>
                </label>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.submit}
                  onClick={handleSubmit}
                  disabled={isPending}
                >
                  {isPending ? "Guardando..." : "Guardar"}
                </button>
              </div>

              {feedbackMessage ? (
                <p className={styles.feedback}>{feedbackMessage}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

