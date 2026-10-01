import { Link } from "react-router-dom";
import logoMark from "../../assets/logo-mark.svg";
import styles from "./Logo.module.css";

export default function Logo() {
  return (
    <Link to="/" className={styles.logo} aria-label="Papertrail home">
      <img src={logoMark} alt="" width={44.3371} height={44.3371} className={styles.mark} />
      <span className={styles.wordmark}>Papertrail</span>
    </Link>
  );
}
