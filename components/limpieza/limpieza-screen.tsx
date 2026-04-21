"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  completeCleaningTaskAction,
  createCleaningTaskAction,
  loadCleaningTaskHistoryAction,
  rotateCleaningTasksAction,
} from "../../app/actions/cleaning-actions";
import type {
  AddCleaningTaskFormOptions,
  CleaningTask,
  CleaningZoneSection,
} from "../../lib/dashboard-types";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import styles from "./limpieza-screen.module.css";

type LimpiezaScreenProps = {
  houseCode: string;
  dashboardPath: string;
  zones: CleaningZoneSection[];
  formOptions: AddCleaningTaskFormOptions;
};

function formatDate(date?: Date) {
  if (!date) return "Selecciona una fecha";
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTaskDate(dateValue: string) {
  if (!dateValue) {
    return "Sin fecha";
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

function formatCompletedAt(dateValue: string | null) {
  if (!dateValue) {
    return null;
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
  const formattedTime = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);

  return `Hecha el ${formattedDate} a las ${formattedTime}`;
}

function formatStatus(status: string) {
  if (status === "done") {
    return "Hecha";
  }

  if (status === "archived") {
    return "Archivada";
  }

  return "Pendiente";
}

function normalizeManualZone(value: string) {
  return value.trim().replace(/\s+/g, " ");
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

export function LimpiezaScreen({
  houseCode,
  dashboardPath,
  zones,
  formOptions,
}: LimpiezaScreenProps) {
  const router = useRouter();
  const basePath = dashboardPath;
  const [isPending, startTransition] = useTransition();
  const [isHistoryPending, startHistoryTransition] = useTransition();
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRotateOpen, setIsRotateOpen] = useState(false);
  const [historyTitle, setHistoryTitle] = useState<string | null>(null);
  const [historyTasks, setHistoryTasks] = useState<CleaningTask[]>([]);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CleaningTask | null>(null);
  const [title, setTitle] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState(
    formOptions.zones[0]?.zone_id ?? ""
  );
  const [manualZoneName, setManualZoneName] = useState("");
  const [assignedProfileId, setAssignedProfileId] = useState(
    formOptions.members[0]?.profile_id ?? ""
  );
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");
  const [rotateNote, setRotateNote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasMembers = formOptions.members.length > 0;

  const resetAddForm = () => {
    setTitle("");
    setSelectedZoneId(formOptions.zones[0]?.zone_id ?? "");
    setManualZoneName("");
    setAssignedProfileId(formOptions.members[0]?.profile_id ?? "");
    setDate(new Date());
    setNotes("");
    setErrorMessage(null);
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((current) => {
      if (current.includes(taskId)) {
        return current.filter((item) => item !== taskId);
      }

      return [...current, taskId].slice(-2);
    });
  };

  const handleOpenTask = (task: CleaningTask) => {
    setSelectedTask(task);
    setErrorMessage(null);
  };

  const handleSaveTask = () => {
    const normalizedTitle = title.trim();
    const dueDate = toIsoDate(date);
    const normalizedManualZone = normalizeManualZone(manualZoneName);
    const zoneId = normalizedManualZone ? null : selectedZoneId || null;
    const customZoneName = normalizedManualZone || null;

    if (!normalizedTitle) {
      setErrorMessage("Introduce un titulo para la tarea.");
      return;
    }

    if (!zoneId && !customZoneName) {
      setErrorMessage("Selecciona una zona o escribe una zona manual.");
      return;
    }

    if (!hasMembers || !assignedProfileId) {
      setErrorMessage("Selecciona una persona asignada.");
      return;
    }

    if (!dueDate) {
      setErrorMessage("Selecciona la fecha de la tarea.");
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const result = await createCleaningTaskAction({
        houseCode,
        dashboardPath: basePath,
        title: normalizedTitle,
        dueDate,
        assignedProfileId,
        zoneId,
        customZoneName,
        notes: notes.trim() ? notes : null,
      });

      if (result.success) {
        resetAddForm();
        setIsAddOpen(false);
        router.refresh();
        return;
      }

      if ("error" in result) {
        setErrorMessage(result.error);
      }
    });
  };

  const handleRotateTasks = () => {
    if (selectedTaskIds.length !== 2) {
      setErrorMessage("Selecciona exactamente 2 tareas para rotar.");
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const result = await rotateCleaningTasksAction({
        houseCode,
        dashboardPath: basePath,
        taskAId: selectedTaskIds[0],
        taskBId: selectedTaskIds[1],
        note: rotateNote.trim() ? rotateNote : null,
      });

      if (result.success) {
        setSelectedTaskIds([]);
        setRotateNote("");
        setIsRotateOpen(false);
        router.refresh();
        return;
      }

      if ("error" in result) {
        setErrorMessage(result.error);
      }
    });
  };

  const handleCompleteTask = () => {
    if (!selectedTask?.task_id) {
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const result = await completeCleaningTaskAction({
        houseCode,
        dashboardPath: basePath,
        taskId: selectedTask.task_id,
      });

      if (result.success) {
        setSelectedTask(null);
        setSelectedTaskIds((current) =>
          current.filter((taskId) => taskId !== result.data.taskId)
        );
        router.refresh();
        return;
      }

      if ("error" in result) {
        setErrorMessage(result.error);
      }
    });
  };

  const handleOpenHistory = (zone: CleaningZoneSection | null) => {
    setHistoryTitle(zone ? zone.zone_name : "Historial");
    setHistoryTasks([]);
    setHasLoadedHistory(false);
    setErrorMessage(null);

    startHistoryTransition(async () => {
      const result = await loadCleaningTaskHistoryAction({
        houseCode,
        zoneId: zone?.zone_id ?? null,
        zoneName: zone?.zone_name ?? null,
      });

      if (result.success) {
        setHistoryTasks(result.data);
        setHasLoadedHistory(true);
        return;
      }

      if ("error" in result) {
        setErrorMessage(result.error);
      }

      setHasLoadedHistory(true);
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
            <h1 className={styles.title}>Limpieza</h1>
            <p className={styles.subtitle}>Tareas del piso por zona</p>
          </div>
          <span />
        </header>

        <div className={styles.content}>
          <div className={styles.leftCol}>
            <div className={styles.topActions}>
              <Button className={styles.topButton} onClick={() => setIsAddOpen(true)}>
                + Anadir tarea
              </Button>
              <Button
                className={styles.topButton}
                onClick={() => {
                  setIsRotateOpen(true);
                  setErrorMessage(null);
                }}
              >
                Rotar
              </Button>
              <Button className={styles.topButton} onClick={() => handleOpenHistory(null)}>
                Ver todo
              </Button>
            </div>
            <div className={styles.groupsScroll}>
              {zones.length ? (
                zones.map((zone) => (
                  <Card
                    key={`${zone.zone_id ?? "custom"}-${zone.zone_name}`}
                    className={styles.groupCard}
                  >
                    <div className={styles.groupHeader}>
                      <h2 className={styles.groupTitle}>{zone.zone_name}</h2>
                      <button
                        type="button"
                        className={styles.viewAllButton}
                        onClick={() => handleOpenHistory(zone)}
                      >
                        Ver todo
                      </button>
                    </div>
                    <div className={styles.groupRows}>
                      {zone.tasks.length ? (
                        zone.tasks.map((task) => (
                          <div key={task.task_id} className={styles.taskRow}>
                            <Checkbox
                              className={styles.taskCheckbox}
                              checked={selectedTaskIds.includes(task.task_id)}
                              onCheckedChange={() => toggleTaskSelection(task.task_id)}
                              disabled={!task.task_id}
                            />
                            <button
                              type="button"
                              className={styles.taskDetailsButton}
                              onClick={() => handleOpenTask(task)}
                            >
                              <div className={styles.taskLeft}>
                                <Image
                                  src="/images/IconoperfilM.webp"
                                  alt=""
                                  width={22}
                                  height={22}
                                />
                                <div>
                                  <p>{task.title}</p>
                                  <small>{formatTaskDate(task.due_date)}</small>
                                </div>
                              </div>
                              <span className={styles.taskOwner}>
                                {task.assigned_to_name || "Sin asignar"}
                              </span>
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className={styles.emptyText}>No hay tareas en esta zona.</p>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <p className={styles.emptyText}>No hay tareas de limpieza.</p>
              )}
            </div>
          </div>

          <div className={styles.floorWrap}>
            <div className={styles.floorImageWrap}>
              <Image
                src="/images/limpieza/piso.webp"
                alt="Plano del piso"
                fill
                sizes="(max-width: 900px) 100vw, 55vw"
                unoptimized
                className={styles.floorImage}
              />
            </div>
          </div>
        </div>
      </section>

      {selectedTask ? (
        <div className={styles.modalBackdrop}>
          <Card className={styles.modalCard}>
            <div className={styles.modalTop}>
              <h2 className={styles.modalTitle}>{selectedTask.title}</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => {
                  setSelectedTask(null);
                  setErrorMessage(null);
                }}
              >
                Cerrar
              </button>
            </div>

            <dl className={styles.taskInfoList}>
              <div>
                <dt>Notas</dt>
                <dd>{selectedTask.notes || "Sin notas"}</dd>
              </div>
              <div>
                <dt>Zona</dt>
                <dd>{selectedTask.zone_name || "Sin zona"}</dd>
              </div>
              <div>
                <dt>Fecha</dt>
                <dd>{formatTaskDate(selectedTask.due_date)}</dd>
              </div>
              <div>
                <dt>Persona asignada</dt>
                <dd>{selectedTask.assigned_to_name || "Sin asignar"}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{formatStatus(selectedTask.status)}</dd>
              </div>
            </dl>

            {errorMessage ? (
              <p className={styles.feedbackMessage}>{errorMessage}</p>
            ) : null}

            <div className={styles.modalActions}>
              <Button
                className={styles.saveButton}
                onClick={handleCompleteTask}
                disabled={isPending || selectedTask.status !== "pending"}
              >
                {isPending ? "Marcando..." : "Marcar como hecha"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {isAddOpen ? (
        <div className={styles.modalBackdrop}>
          <Card className={styles.modalCard}>
            <div className={styles.modalTop}>
              <h2 className={styles.modalTitle}>Anadir tarea</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => {
                  setIsAddOpen(false);
                  setErrorMessage(null);
                }}
              >
                Cerrar
              </button>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Titulo</span>
                <input
                  className={styles.fieldInput}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>

              <label className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Zona existente</span>
                <select
                  className={styles.fieldSelect}
                  value={selectedZoneId}
                  onChange={(event) => {
                    setSelectedZoneId(event.target.value);
                    setManualZoneName("");
                  }}
                >
                  <option value="">Selecciona una zona</option>
                  {formOptions.zones.map((zone) => (
                    <option key={zone.zone_id} value={zone.zone_id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Zona manual</span>
                <input
                  className={styles.fieldInput}
                  value={manualZoneName}
                  onChange={(event) => setManualZoneName(event.target.value)}
                />
              </label>

              <label className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Persona asignada</span>
                <select
                  className={styles.fieldSelect}
                  value={assignedProfileId}
                  onChange={(event) => setAssignedProfileId(event.target.value)}
                  disabled={!hasMembers}
                >
                  <option value="">Selecciona una persona</option>
                  {formOptions.members.map((member) => (
                    <option key={member.profile_id} value={member.profile_id}>
                      {member.display_name}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Fecha</span>
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
              </div>

              <label className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Notas</span>
                <textarea
                  className={styles.fieldTextarea}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                />
              </label>
            </div>

            {errorMessage ? (
              <p className={styles.feedbackMessage}>{errorMessage}</p>
            ) : null}

            <div className={styles.modalActions}>
              <Button
                className={styles.saveButton}
                onClick={handleSaveTask}
                disabled={isPending}
              >
                {isPending ? "Guardando..." : "Guardar tarea"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {isRotateOpen ? (
        <div className={styles.modalBackdrop}>
          <Card className={styles.modalCard}>
            <div className={styles.modalTop}>
              <h2 className={styles.modalTitle}>Rotar tareas</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => {
                  setIsRotateOpen(false);
                  setErrorMessage(null);
                }}
              >
                Cerrar
              </button>
            </div>
            <p className={styles.modalCopy}>
              Seleccionadas: {selectedTaskIds.length}/2
            </p>
            <label className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Nota</span>
              <textarea
                className={styles.fieldTextarea}
                value={rotateNote}
                onChange={(event) => setRotateNote(event.target.value)}
                rows={3}
              />
            </label>
            {errorMessage ? (
              <p className={styles.feedbackMessage}>{errorMessage}</p>
            ) : null}
            <div className={styles.modalActions}>
              <Button
                className={styles.saveButton}
                onClick={handleRotateTasks}
                disabled={isPending || selectedTaskIds.length !== 2}
              >
                {isPending ? "Rotando..." : "Confirmar rotacion"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {historyTitle ? (
        <div className={styles.modalBackdrop}>
          <Card className={styles.modalCard}>
            <div className={styles.modalTop}>
              <h2 className={styles.modalTitle}>{historyTitle}</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => {
                  setHistoryTitle(null);
                  setHistoryTasks([]);
                  setHasLoadedHistory(false);
                }}
              >
                Cerrar
              </button>
            </div>
            {errorMessage ? (
              <p className={styles.feedbackMessage}>{errorMessage}</p>
            ) : null}
            <div className={styles.historyList}>
              {isHistoryPending || !hasLoadedHistory ? (
                <p className={styles.emptyModalText}>Cargando historial...</p>
              ) : historyTasks.length ? (
                historyTasks.map((task) => (
                  <div key={task.task_id} className={styles.historyRow}>
                    <div>
                      <p>{task.title}</p>
                      <small>
                        {task.zone_name} - {formatTaskDate(task.due_date)}
                      </small>
                      <small>
                        {task.assigned_to_name || "Sin asignar"} -{" "}
                        {formatStatus(task.status)}
                      </small>
                      {task.notes ? <small>{task.notes}</small> : null}
                      {task.status === "done" && task.completed_at ? (
                        <small>{formatCompletedAt(task.completed_at)}</small>
                      ) : null}
                    </div>
                    <span>{formatStatus(task.status)}</span>
                  </div>
                ))
              ) : (
                <p className={styles.emptyModalText}>No hay historial.</p>
              )}
            </div>
          </Card>
        </div>
      ) : null}
    </main>
  );
}
