export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function toActionError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Ha ocurrido un error inesperado.";
}
