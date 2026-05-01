import Image from "next/image";
import Link from "next/link";

export default function TableauDeBordPage() {
  return (
    <div className="landing-shell">
      <div className="landing-glow" aria-hidden="true" />

      <main className="dashboard">
        <p className="eyebrow">VUE</p>
        <h1>Tableau de bord</h1>

        <section className="board" aria-label="Vue Tableau de bord">
          <div className="card" style={{ padding: "18px" }}>
            <p className="label">APERCU</p>
            <p style={{ margin: "8px 0 14px" }}>
              Cette page est prete pour accueillir les KPIs, les prochaines maraudes et les alertes prioritaires.
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
