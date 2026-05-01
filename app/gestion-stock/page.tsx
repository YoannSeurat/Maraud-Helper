import Image from "next/image";
import Link from "next/link";

export default function GestionStockPage() {
  return (
    <div className="landing-shell">
      <div className="landing-glow" aria-hidden="true" />

      <main className="dashboard">
        <p className="eyebrow">VUE</p>
        <h1>Gestion du stock</h1>

        <section className="board" aria-label="Vue Gestion du stock">
          <div className="card" style={{ padding: "18px" }}>
            <p className="label">STOCKS</p>
            <p style={{ margin: "8px 0 14px" }}>
              Cette page est prete pour gerer les entrees/sorties, les seuils bas et la repartition des categories.
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
