"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import styles from "./login-card.module.css";
import { signInWithEmail, signUpWithEmail } from "../../app/actions/auth-actions";
import { createHouseAction, joinHouseAction } from "../../app/actions/house-actions";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Introduce un correo válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "El correo es obligatorio")
      .email("Introduce un correo válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z
      .string()
      .min(8, "La verificación debe tener al menos 8 caracteres"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

const createHomeSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  people: z
    .string()
    .min(1, "El número de personas es obligatorio")
    .regex(/^\d+$/, "Introduce solo números"),
});

const joinHomeSchema = z.object({
  code: z
    .string()
    .min(1, "El código es obligatorio")
    .regex(/^\d+$/, "Introduce solo números"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type CreateHomeFormValues = z.infer<typeof createHomeSchema>;
type JoinHomeFormValues = z.infer<typeof joinHomeSchema>;

type LoginCardProps = {
  initialFlow?: "login" | "create" | "join";
};

export function LoginCard({ initialFlow = "login" }: LoginCardProps) {
  const preferredHomeAction = initialFlow === "join" ? "join" : "create";
  const [showSetupStep, setShowSetupStep] = useState(false);
  const [homeAction, setHomeAction] = useState<"create" | "join">(preferredHomeAction);
  const [globalError, setGlobalError] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const createHomeForm = useForm<CreateHomeFormValues>({
    resolver: zodResolver(createHomeSchema),
    defaultValues: {
      name: "",
      people: "",
    },
  });

  const joinHomeForm = useForm<JoinHomeFormValues>({
    resolver: zodResolver(joinHomeSchema),
    defaultValues: {
      code: "",
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    setGlobalError("");
    setGlobalSuccess("");

    startTransition(async () => {
      const result = await signInWithEmail({
        ...values,
        redirectTo: initialFlow === "login" ? "/dashboard" : undefined,
      });

      if (result?.error) {
        setGlobalError(result.error);
        return;
      }

      if (initialFlow !== "login") {
        setGlobalSuccess("Sesion iniciada. Ahora ya puedes crear o unirte a un piso.");
        setShowSetupStep(true);
        setHomeAction(preferredHomeAction);
      }
    });
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    setGlobalError("");
    setGlobalSuccess("");

    startTransition(async () => {
      const result = await signUpWithEmail({
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        setGlobalError(result.error);
        return;
      }

      setGlobalSuccess("Cuenta creada correctamente. Ahora crea o únete a un piso.");
      setShowSetupStep(true);
      setHomeAction(preferredHomeAction);
    });
  };

  const onCreateHomeSubmit = (values: CreateHomeFormValues) => {
    setGlobalError("");
    setGlobalSuccess("");

    startTransition(async () => {
      const result = await createHouseAction(values);

      if (result?.error) {
        setGlobalError(result.error);
      }
    });
  };

  const onJoinHomeSubmit = (values: JoinHomeFormValues) => {
    setGlobalError("");
    setGlobalSuccess("");

    startTransition(async () => {
      const result = await joinHouseAction(values);

      if (result?.error) {
        setGlobalError(result.error);
      }
    });
  };

  if (showSetupStep) {
    return (
      <div className={styles.card}>
        <div className={styles.top}>
          <div className={`${styles.tabsShell} ${styles.setupTabsShell}`}>
            <div className={styles.modeTabs}>
              <button
                type="button"
                onClick={() => setHomeAction("create")}
                className={`${styles.modeTab} ${
                  homeAction === "create" ? styles.modeTabActive : ""
                }`.trim()}
                disabled={isPending}
              >
                Crear piso
              </button>

              <button
                type="button"
                onClick={() => setHomeAction("join")}
                className={`${styles.modeTab} ${
                  homeAction === "join" ? styles.modeTabActive : ""
                }`.trim()}
                disabled={isPending}
              >
                Unirse a un piso
              </button>
            </div>
          </div>
          <div className={styles.slot} />
        </div>

        <div className={styles.panel}>
          {globalError ? <p className={styles.error}>{globalError}</p> : null}
          {globalSuccess ? <p className={styles.success}>{globalSuccess}</p> : null}

          {homeAction === "create" ? (
            <form
              className={styles.form}
              onSubmit={createHomeForm.handleSubmit(onCreateHomeSubmit)}
              noValidate
            >
              <div className={styles.field}>
                <div className={styles.inputWrap}>
                  <Image
                    src="/iconos/building-svgrepo-com 1.svg"
                    alt="Icono de edificio"
                    width={16}
                    height={16}
                    className={`${styles.icon} ${styles.setupIcon}`}
                  />
                  <Input
                    type="text"
                    className={styles.input}
                    placeholder="Nombre"
                    disabled={isPending}
                    {...createHomeForm.register("name")}
                  />
                </div>
                {createHomeForm.formState.errors.name && (
                  <p className={styles.error}>
                    {createHomeForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <div className={styles.inputWrap}>
                  <Image
                    src="/iconos/persons-svgrepo-com 1.svg"
                    alt="Icono de personas"
                    width={16}
                    height={16}
                    className={`${styles.icon} ${styles.setupIcon}`}
                  />
                  <Input
                    type="text"
                    inputMode="numeric"
                    className={styles.input}
                    placeholder="Nº de personas en el piso"
                    disabled={isPending}
                    {...createHomeForm.register("people")}
                  />
                </div>
                {createHomeForm.formState.errors.people && (
                  <p className={styles.error}>
                    {createHomeForm.formState.errors.people.message}
                  </p>
                )}
              </div>

              <Button type="submit" className={styles.submit} disabled={isPending}>
                {isPending ? "Creando..." : "Entrar"}
              </Button>
            </form>
          ) : (
            <form
              className={styles.form}
              onSubmit={joinHomeForm.handleSubmit(onJoinHomeSubmit)}
              noValidate
            >
              <div className={styles.field}>
                <div className={styles.inputWrap}>
                  <Image
                    src="/iconos/building-svgrepo-com 1.svg"
                    alt="Icono de código"
                    width={16}
                    height={16}
                    className={`${styles.icon} ${styles.setupIcon}`}
                  />
                  <Input
                    type="text"
                    inputMode="numeric"
                    className={styles.input}
                    placeholder="Código"
                    disabled={isPending}
                    {...joinHomeForm.register("code")}
                  />
                </div>
                {joinHomeForm.formState.errors.code && (
                  <p className={styles.error}>
                    {joinHomeForm.formState.errors.code.message}
                  </p>
                )}
              </div>

              <Button type="submit" className={styles.submit} disabled={isPending}>
                {isPending ? "Uniéndome..." : "Unirme"}
              </Button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <Tabs defaultValue={initialFlow === "login" ? "login" : "register"}>
        <div className={styles.top}>
          <div className={styles.tabsShell}>
            <TabsList className={styles.tabs}>
              <TabsTrigger value="login" className={styles.tab}>
                Iniciar sesión
              </TabsTrigger>
              <TabsTrigger value="register" className={styles.tab}>
                Registrarse
              </TabsTrigger>
            </TabsList>
          </div>
          <div className={styles.slot} />
        </div>

        <div className={styles.panel}>
          {globalError ? <p className={styles.error}>{globalError}</p> : null}
          {globalSuccess ? <p className={styles.success}>{globalSuccess}</p> : null}

          <TabsContent value="login">
            <form
              className={styles.form}
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              noValidate
            >
              <div className={styles.field}>
                <div className={styles.inputWrap}>
                  <Image
                    src="/iconos/SVGRepo_iconCarrier.svg"
                    alt="Icono de correo"
                    width={16}
                    height={16}
                    className={styles.icon}
                  />
                  <Input
                    type="email"
                    className={styles.input}
                    placeholder="Correo"
                    autoComplete="email"
                    disabled={isPending}
                    {...loginForm.register("email")}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className={styles.error}>
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <div className={styles.inputWrap}>
                  <Image
                    src="/iconos/key-svgrepo-com 1.svg"
                    alt="Icono de contraseña"
                    width={16}
                    height={16}
                    className={`${styles.icon} ${styles.keyIcon}`}
                  />
                  <Input
                    type="password"
                    className={styles.input}
                    placeholder="Contraseña"
                    autoComplete="current-password"
                    disabled={isPending}
                    {...loginForm.register("password")}
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className={styles.error}>
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button type="button" className={styles.forgot} disabled={isPending}>
                ¿Olvidaste tu contraseña?
              </button>

              <Button type="submit" className={styles.submit} disabled={isPending}>
                {isPending ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form
              className={styles.form}
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              noValidate
            >
              <div className={styles.field}>
                <div className={styles.inputWrap}>
                  <Image
                    src="/iconos/SVGRepo_iconCarrier.svg"
                    alt="Icono de correo"
                    width={16}
                    height={16}
                    className={styles.icon}
                  />
                  <Input
                    type="email"
                    className={styles.input}
                    placeholder="Correo"
                    autoComplete="email"
                    disabled={isPending}
                    {...registerForm.register("email")}
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className={styles.error}>
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <div className={styles.inputWrap}>
                  <Image
                    src="/iconos/key-svgrepo-com 1.svg"
                    alt="Icono de contraseña"
                    width={16}
                    height={16}
                    className={`${styles.icon} ${styles.keyIcon}`}
                  />
                  <Input
                    type="password"
                    className={styles.input}
                    placeholder="Contraseña"
                    autoComplete="new-password"
                    disabled={isPending}
                    {...registerForm.register("password")}
                  />
                </div>
                {registerForm.formState.errors.password && (
                  <p className={styles.error}>
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <div className={styles.inputWrap}>
                  <Image
                    src="/iconos/key-svgrepo-com 1.svg"
                    alt="Icono de verificar contraseña"
                    width={16}
                    height={16}
                    className={`${styles.icon} ${styles.keyIcon}`}
                  />
                  <Input
                    type="password"
                    className={styles.input}
                    placeholder="Verificar contraseña"
                    autoComplete="new-password"
                    disabled={isPending}
                    {...registerForm.register("confirmPassword")}
                  />
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className={styles.error}>
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className={styles.submit} disabled={isPending}>
                {isPending ? "Creando cuenta..." : "Siguiente"}
              </Button>
            </form>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
