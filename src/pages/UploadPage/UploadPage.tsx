import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Dropzone from "../../components/Dropzone/Dropzone";
import LanguageCard from "../../components/LanguageCard/LanguageCard";
import NavBar from "../../components/NavBar/NavBar";
import OutputOptions, { type OutputPreference } from "../../components/OutputOptions/OutputOptions";
import styles from "./UploadPage.module.css";

export default function UploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [preference, setPreference] = useState<OutputPreference>("english");

  return (
    <div className={styles.page}>
      <NavBar />

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Document Upload</h1>
          <p className={styles.subtitle}>Upload your files and manage language outputs seamlessly.</p>
        </header>

        <div className={styles.stack}>
          <Dropzone files={files} onFilesChange={setFiles} />
          <LanguageCard language="Japanese" confidence="98.4%" documentId="PT-8392" />
        </div>

        <OutputOptions value={preference} onChange={setPreference} />

        <footer className={styles.footer}>
          <p className={styles.estimate}>Estimated processing time: 2-5 minutes</p>
          <div className={styles.actions}>
            <Button variant="outline" className={styles.return} onClick={() => navigate(-1)}>
              Return
            </Button>
            <Button
              variant="primary"
              className={styles.create}
              disabled={files.length === 0}
              onClick={() => navigate("/dashboard")}
            >
              Create
            </Button>
          </div>
        </footer>
      </main>
    </div>
  );
}
