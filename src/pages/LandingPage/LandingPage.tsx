import CtaSection from "../../components/CtaSection/CtaSection";
import Hero from "../../components/Hero/Hero";
import IntegrationSection from "../../components/IntegrationSection/IntegrationSection";
import NavBar from "../../components/NavBar/NavBar";
import PrivacySection from "../../components/PrivacySection/PrivacySection";
import Reveal from "../../components/Reveal/Reveal";
import ReviewSection from "../../components/ReviewSection/ReviewSection";
import TrustSection from "../../components/TrustSection/TrustSection";
import WorkflowSection from "../../components/WorkflowSection/WorkflowSection";
import styles from "./LandingPage.module.css";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.aboveFold}>
        <NavBar />
        <main className={styles.heroMain}>
          <Hero />
        </main>
      </div>
      <div className={styles.sections}>
        <Reveal>
          <WorkflowSection />
        </Reveal>
        <Reveal delayMs={60}>
          <TrustSection />
        </Reveal>
        <Reveal delayMs={60}>
          <PrivacySection />
        </Reveal>
        <Reveal delayMs={60}>
          <IntegrationSection />
        </Reveal>
        <Reveal delayMs={60}>
          <ReviewSection />
        </Reveal>
        <Reveal delayMs={80}>
          <CtaSection />
        </Reveal>
      </div>
    </div>
  );
}
