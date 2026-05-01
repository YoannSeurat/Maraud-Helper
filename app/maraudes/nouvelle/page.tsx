import Image from "next/image";
import Link from "next/link";

export default function NouvelleMaraudePage() {
  return (
    <div className="landing-shell">
      <div className="landing-glow" aria-hidden="true" />

      <main className="dashboard">
        <p className="eyebrow">NOUVELLE MARAUDE</p>
        <h1>Creation</h1>

        <section className="board" aria-label="Nouvelle maraude">
          <div className="card" style={{ padding: "18px" }}>
            <p className="label">FORMULAIRE</p>
            <p style={{ margin: "8px 0 14px" }}>
              Cette page est prete pour accueillir le formulaire de creation (nom, lieu, equipes, besoins, horaires).
            </p>
            <Link href="/" className="primary-btn">
              <Image src="/assets/arrow_ltor.svg" alt="" aria-hidden="true" width={14} height={14} className="icon-img back-arrow" />
              Retour aux maraudes
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
