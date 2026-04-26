"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  updateHouseMemberSettingsAction,
  updateProfileSettingsAction,
} from "../../app/backend/endpoints/auth/actions";
import type { ProfileSettingsData } from "../../lib/dashboard-types";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import styles from "./ajustes-screen.module.css";

type AjustesScreenProps = {
  houseCode: string;
  dashboardPath: string;
  isAdmin: boolean;
  settings: ProfileSettingsData;
};

const PROFILE_AVATARS = ["/images/IconoperfilM.webp", "/images/IconoperfilH.webp"];

function splitFullName(fullName: string | null) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

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

export function AjustesScreen({
  houseCode,
  dashboardPath,
  isAdmin,
  settings,
}: AjustesScreenProps) {
  const router = useRouter();
  const basePath = dashboardPath;
  const initialName = useMemo(
    () => splitFullName(settings.profile.full_name),
    [settings.profile.full_name]
  );
  const initialAvatarIndex = Math.max(
    0,
    PROFILE_AVATARS.findIndex((avatar) => avatar === settings.profile.avatar_url)
  );
  const [firstName, setFirstName] = useState(initialName.firstName);
  const [lastName, setLastName] = useState(initialName.lastName);
  const [email, setEmail] = useState(settings.profile.email ?? "");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatarIndex);
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
  const [avatarPopoverOpen, setAvatarPopoverOpen] = useState(false);
  const [avatarDragging, setAvatarDragging] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [avatarFileName, setAvatarFileName] = useState<string | null>(null);
  const [contractPopoverOpen, setContractPopoverOpen] = useState(false);
  const [contractDragging, setContractDragging] = useState(false);
  const [contractUploadError, setContractUploadError] = useState<string | null>(
    null
  );
  const [contractFileName, setContractFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const contractInputRef = useRef<HTMLInputElement>(null);
  const visibleCount = 3;
  const selectedAvatarUrl =
    PROFILE_AVATARS[selectedAvatar] ?? PROFILE_AVATARS[0];
  const profileDisplayName =
    [firstName, lastName].filter(Boolean).join(" ").trim() || "Perfil";
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const initialFirstName = initialName.firstName.trim();
  const initialLastName = initialName.lastName.trim();
  const initialEmail = (settings.profile.email ?? "").trim().toLowerCase();
  const initialRoomLabel = (settings.house_member.room_label ?? "").trim();
  const initialRoomSize = (settings.house_member.room_size ?? "").trim();
  const initialStayStartDate = settings.house_member.stay_start_date ?? "";
  const initialStayEndDate = settings.house_member.stay_end_date ?? "";

  const hasProfileChanges =
    trimmedFirstName !== initialFirstName ||
    trimmedLastName !== initialLastName ||
    normalizedEmail !== initialEmail ||
    selectedAvatar !== initialAvatarIndex ||
    password.trim().length > 0;

  const hasHouseChanges =
    roomLabel.trim() !== initialRoomLabel ||
    roomSize.trim() !== initialRoomSize ||
    stayStartDate !== initialStayStartDate ||
    stayEndDate !== initialStayEndDate;

  const goPrevAvatar = () =>
    setSelectedAvatar(
      (prev) => (prev - 1 + PROFILE_AVATARS.length) % PROFILE_AVATARS.length
    );
  const goNextAvatar = () =>
    setSelectedAvatar((prev) => (prev + 1) % PROFILE_AVATARS.length);

  const handleAvatarFile = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarUploadError("Solo se permiten imágenes JPG, PNG o WEBP.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setAvatarUploadError("La imagen supera el límite de 10MB.");
      return;
    }

    setAvatarUploadError(null);
    setAvatarFileName(file.name);
    setAvatarPopoverOpen(false);
  };

  const handleContractFile = (file: File) => {
    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setContractUploadError("Solo se permiten archivos PDF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setContractUploadError("El archivo PDF supera el límite de 10MB.");
      return;
    }

    setContractUploadError(null);
    setContractFileName(file.name);
    setContractPopoverOpen(false);
  };

  useEffect(() => {
    const refreshedName = splitFullName(settings.profile.full_name);
    const refreshedAvatarIndex = Math.max(
      0,
      PROFILE_AVATARS.findIndex(
        (avatar) => avatar === settings.profile.avatar_url
      )
    );

    setFirstName(refreshedName.firstName);
    setLastName(refreshedName.lastName);
    setEmail(settings.profile.email ?? "");
    setSelectedAvatar(refreshedAvatarIndex);
    setRoomLabel(settings.house_member.room_label ?? "");
    setRoomSize(settings.house_member.room_size ?? "");
    setStayStartDate(settings.house_member.stay_start_date ?? "");
    setStayEndDate(settings.house_member.stay_end_date ?? "");
  }, [
    settings.profile.full_name,
    settings.profile.email,
    settings.profile.avatar_url,
    settings.house_member.room_label,
    settings.house_member.room_size,
    settings.house_member.stay_start_date,
    settings.house_member.stay_end_date,
  ]);

  const handleProfileSave = () => {
    setFeedbackMessage(null);
    startTransition(async () => {
      const result = await updateProfileSettingsAction({
        houseCode,
        dashboardPath: basePath,
        firstName,
        lastName,
        email,
        password,
        avatarUrl: selectedAvatarUrl,
      });

      if (result.success) {
        setPassword("");
        setEmail(result.data.email ?? email);
        setFeedbackMessage(null);
        router.refresh();
      } else if ("error" in result) {
        setFeedbackMessage(result.error);
      }
    });
  };

  const handleHouseSettingsSave = () => {
    setFeedbackMessage(null);
    startTransition(async () => {
      const result = await updateHouseMemberSettingsAction({
        houseCode,
        dashboardPath: basePath,
        roomLabel,
        roomSize,
        stayStartDate,
        stayEndDate,
      });

      if (result.success) {
        setFeedbackMessage(null);
        router.refresh();
      } else if ("error" in result) {
        setFeedbackMessage(result.error);
      }
    });
  };

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
            <h1 className={styles.title}>Perfil</h1>
            <p className={styles.subtitle}>Gestiona tu información personal</p>
          </div>
          <Popover open={contractPopoverOpen} onOpenChange={setContractPopoverOpen}>
            <PopoverTrigger asChild>
              <button type="button" className={styles.headerContractButton}>
                Ver contrato
              </button>
            </PopoverTrigger>
            <PopoverContent className={styles.avatarUploadPopover} side="bottom" align="end">
              <div
                className={`${styles.avatarDropzone} ${
                  contractDragging ? styles.avatarDropzoneActive : ""
                }`}
                onClick={() => contractInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setContractDragging(true);
                }}
                onDragLeave={() => setContractDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setContractDragging(false);
                  const file = event.dataTransfer.files?.[0];
                  if (file) {
                    handleContractFile(file);
                  }
                }}
              >
                <Image
                  src="/iconos/Escanearimagen.svg"
                  alt=""
                  width={26}
                  height={26}
                  className={styles.avatarDropIcon}
                />
                <p className={styles.avatarDropTitle}>Sube o arrastra un PDF</p>
                <p className={styles.avatarDropHint}>PDF - Max 10MB</p>
              </div>
              <input
                ref={contractInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className={styles.avatarUploadInput}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    handleContractFile(file);
                  }
                }}
              />
              {contractFileName ? (
                <p className={styles.avatarFileName}>{contractFileName}</p>
              ) : null}
              {contractUploadError ? (
                <p className={styles.avatarUploadError}>{contractUploadError}</p>
              ) : null}
            </PopoverContent>
          </Popover>
        </header>

        <div className={styles.content}>
          <div className={styles.topGrid}>
            <Card className={`${styles.block} ${styles.personalBlock}`}>
              <h2 className={styles.blockTitle}>Información personal</h2>
              <div className={styles.personalFields}>
                <div className={styles.inputLike}>
                  <input
                    className={styles.inlineInput}
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    aria-label="Nombre"
                  />
                  <span className={styles.fieldLabel}>Nombre</span>
                </div>
                <div className={styles.inputLike}>
                  <input
                    className={styles.inlineInput}
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    aria-label="Apellidos"
                  />
                  <span className={styles.fieldLabel}>Apellidos</span>
                </div>
                <div className={styles.inputLike}>
                  <input
                    className={styles.inlineInput}
                    value={email}
                    type="email"
                    onChange={(event) => setEmail(event.target.value)}
                    aria-label="Email"
                  />
                  <span className={styles.fieldLabel}>Email</span>
                </div>
                <div className={styles.inputLike}>
                  <input
                    className={styles.inlineInput}
                    value={password}
                    type="password"
                    onChange={(event) => setPassword(event.target.value)}
                    aria-label="Nueva contraseña"
                  />
                  <span className={styles.fieldLabel}>Contraseña</span>
                </div>
              </div>
              <div className={styles.actionSlot}>
                <button
                  type="button"
                  className={`${styles.saveButton} ${
                    hasProfileChanges ? "" : styles.hiddenActionButton
                  }`}
                  onClick={handleProfileSave}
                  disabled={isPending || !hasProfileChanges}
                  aria-hidden={!hasProfileChanges}
                >
                  Actualizar
                </button>
              </div>
            </Card>

            <Card className={`${styles.block} ${styles.profileBlock}`}>
              <Popover open={avatarPopoverOpen} onOpenChange={setAvatarPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={styles.avatarBadgeButton}
                    aria-label="Subir imagen de avatar"
                  >
                    <div className={styles.avatarBadge}>
                      <Image
                        src={selectedAvatarUrl}
                        alt="Avatar principal"
                        width={44}
                        height={44}
                      />
                      <span className={styles.avatarOverlay} aria-hidden="true">
                        <Image
                          src="/iconos/Escanearimagen.svg"
                          alt=""
                          width={22}
                          height={22}
                          className={styles.avatarOverlayIcon}
                        />
                      </span>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className={styles.avatarUploadPopover} side="bottom" align="center">
                  <div
                    className={`${styles.avatarDropzone} ${
                      avatarDragging ? styles.avatarDropzoneActive : ""
                    }`}
                    onClick={() => avatarInputRef.current?.click()}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setAvatarDragging(true);
                    }}
                    onDragLeave={() => setAvatarDragging(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setAvatarDragging(false);
                      const file = event.dataTransfer.files?.[0];
                      if (file) {
                        handleAvatarFile(file);
                      }
                    }}
                  >
                    <Image
                      src="/iconos/Escanearimagen.svg"
                      alt=""
                      width={26}
                      height={26}
                      className={styles.avatarDropIcon}
                    />
                    <p className={styles.avatarDropTitle}>Sube o arrastra una imagen</p>
                    <p className={styles.avatarDropHint}>JPG, PNG o WEBP - Max 10MB</p>
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    className={styles.avatarUploadInput}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        handleAvatarFile(file);
                      }
                    }}
                  />
                  {avatarFileName ? (
                    <p className={styles.avatarFileName}>{avatarFileName}</p>
                  ) : null}
                  {avatarUploadError ? (
                    <p className={styles.avatarUploadError}>{avatarUploadError}</p>
                  ) : null}
                </PopoverContent>
              </Popover>
              <h2 className={styles.profileName}>{profileDisplayName.toUpperCase()}</h2>
              <div className={styles.avatarRow}>
                <button
                  type="button"
                  className={styles.navArrow}
                  onClick={goPrevAvatar}
                  aria-label="Avatar anterior"
                >
                  <Image
                    src="/iconos/flechascalendario.svg"
                    alt="Anterior"
                    width={24}
                    height={24}
                    className={styles.navArrowIcon}
                  />
                </button>
                <div className={styles.avatarSliderBox}>
                  <div className={styles.avatarList}>
                    {Array.from({ length: visibleCount }).map((_, offset) => {
                      const index =
                        (selectedAvatar + offset) % PROFILE_AVATARS.length;
                      const avatar = PROFILE_AVATARS[index];
                      return (
                        <button
                          key={`avatar-${offset}-${index}`}
                          type="button"
                          className={`${styles.avatarDotButton} ${
                            offset === 0 ? styles.avatarDotButtonActive : ""
                          }`}
                          onClick={() => setSelectedAvatar(index)}
                          aria-label={`Seleccionar avatar ${index + 1}`}
                        >
                          <Image src={avatar} alt="" width={34} height={34} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.navArrow}
                  onClick={goNextAvatar}
                  aria-label="Siguiente avatar"
                >
                  <Image
                    src="/iconos/flechascalendario.svg"
                    alt="Siguiente"
                    width={24}
                    height={24}
                    className={`${styles.navArrowIcon} ${styles.navArrowIconRight}`}
                  />
                </button>
              </div>
            </Card>

            <Card className={`${styles.block} ${styles.houseBlock}`}>
              <h2 className={styles.sectionTitle}>Configuración del piso</h2>
              <div className={styles.settingRow}>
                <span className={styles.settingLabel}>Alquiler mensual</span>
                <div className={styles.settingInputWithIcon}>
                  <input
                    className={styles.settingInput}
                    type="text"
                    inputMode="decimal"
                    value={roomLabel}
                    onChange={(event) => setRoomLabel(event.target.value)}
                    aria-label="Alquiler mensual"
                  />
                  <Image
                    src="/iconos/euro.svg"
                    alt=""
                    width={16}
                    height={16}
                    className={styles.settingInputIcon}
                  />
                </div>
              </div>
              <div className={styles.settingRow}>
                <span className={styles.settingLabel}>Tamaño de habitación</span>
                <select
                  className={styles.settingSelect}
                  value={roomSize}
                  onChange={(event) => setRoomSize(event.target.value)}
                  aria-label="Tamaño de habitación"
                >
                  <option value="">Selecciona Tamaño</option>
                  <option value="Grande">Grande</option>
                  <option value="Mediana">Mediana</option>
                  <option value="Pequeña">Pequeña</option>
                </select>
              </div>
              <div className={styles.settingRow}>
                <span className={styles.settingLabel}>Entrada</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className={styles.settingDateTrigger}>
                      {formatDate(stayStartDateValue)}
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
                      selected={stayStartDateValue}
                      onSelect={(value) => setStayStartDate(toIsoDate(value))}
                      className={styles.calendar}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className={styles.settingRow}>
                <span className={styles.settingLabel}>Salida</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className={styles.settingDateTrigger}>
                      {formatDate(stayEndDateValue)}
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
                      selected={stayEndDateValue}
                      onSelect={(value) => setStayEndDate(toIsoDate(value))}
                      className={styles.calendar}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className={styles.actionSlot}>
                <button
                  type="button"
                  className={`${styles.houseSaveButton} ${
                    hasHouseChanges ? "" : styles.hiddenActionButton
                  }`}
                  onClick={handleHouseSettingsSave}
                  disabled={isPending || !hasHouseChanges}
                  aria-hidden={!hasHouseChanges}
                >
                  Actualizar
                </button>
              </div>
              {feedbackMessage ? (
                <p className={styles.feedbackMessage}>{feedbackMessage}</p>
              ) : null}
            </Card>
          </div>

        </div>
      </section>
    </main>
  );
}


