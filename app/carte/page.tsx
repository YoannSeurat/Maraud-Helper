import Image from "next/image";
import Link from "next/link";

export default function CartePage() {
  return (
    <div className="landing-shell">
      <div className="landing-glow" aria-hidden="true" />

      <main className="dashboard">
        <p className="eyebrow">VUE</p>
        <h1>Carte de la maraude</h1>

        <section className="board" aria-label="Vue Carte">
          <div className="card" style={{ padding: "18px" }}>
            <div className="map-fake" aria-hidden="true" style={{ height: "320px" }} />
            <p style={{ margin: "12px 0 0" }}>
              Zone de carte reservee: tu pourras brancher ici une vraie carte (Leaflet, Mapbox, Google Maps).
            </p>
            <div className="meeting-actions" style={{ marginTop: "14px" }}>
              <Link href="/" className="primary-btn">
                <Image src="/assets/arrow_ltor.svg" alt="" aria-hidden="true" width={14} height={14} className="icon-img back-arrow" />
                Retour aux maraudes
              </Link>
              <Link href="/gestion-stock" className="primary-btn">
                <Image src="/assets/arrow_ltor.svg" alt="" aria-hidden="true" width={14} height={14} className="icon-img" />
                Aller au stock
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
