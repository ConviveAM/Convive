import { LoginCard } from "../../components/auth/login-card";
import styles from "./page.module.css";

type LoginPageProps = {
  searchParams?: Promise<{
    flow?: "login" | "create" | "join";
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const flow =
    params?.flow === "create" || params?.flow === "join"
      ? params.flow
      : "login";

  return (
    <main className={styles.page}>
      <LoginCard initialFlow={flow} />
    </main>
  );
}
