import logoMark from "../../assets/logo-mark.svg";
import styles from "./PageLoader.module.css";

type PageLoaderProps = {
  leaving?: boolean;
};

export default function PageLoader({ leaving = false }: PageLoaderProps) {
  return (
    <div className={styles.overlay} data-leaving={leaving || undefined} role="status" aria-live="polite">
      <img src={logoMark} alt="" width={56} height={56} className={styles.mark} />
      <span className={styles.srOnly}>Loading page</span>
    </div>
  );
}
