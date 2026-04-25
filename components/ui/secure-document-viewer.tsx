"use client";

import { useState, useTransition } from "react";

import type { ActionResult } from "../../app/backend/endpoints/shared/action-result";
import styles from "./secure-document-viewer.module.css";

type SecureDocumentViewerProps = {
  label: string;
  title: string;
  buttonClassName?: string;
  disabled?: boolean;
  loadSignedUrl: () => Promise<ActionResult<{ signedUrl: string }>>;
};

export function SecureDocumentViewer({
  label,
  title,
  buttonClassName,
  disabled = false,
  loadSignedUrl,
}: SecureDocumentViewerProps) {
  const [isPending, startTransition] = useTransition();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openDocument = () => {
    if (disabled || isPending) {
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const result = await loadSignedUrl();

      if (result.success) {
        setSignedUrl(result.data.signedUrl);
        return;
      }

      if ("error" in result) {
        setErrorMessage(result.error);
      }
    });
  };

  const closeDocument = () => {
    setSignedUrl(null);
  };

  return (
    <>
      <button
        type="button"
        className={buttonClassName}
        onClick={openDocument}
        disabled={disabled || isPending}
      >
        {isPending ? "Abriendo..." : label}
      </button>

      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

      {signedUrl ? (
        <div className={styles.overlay} role="presentation" onClick={closeDocument}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(event) => event.stopPropagation()}
          >
            <header className={styles.header}>
              <h2 className={styles.title}>{title}</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeDocument}
                aria-label="Cerrar"
              >
                x
              </button>
            </header>
            <div className={styles.imageWrap}>
              <img src={signedUrl} alt={title} className={styles.image} />
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
