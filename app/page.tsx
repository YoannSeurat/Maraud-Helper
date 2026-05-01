import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="landing-shell">
      <div className="landing-glow" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <Image
            src="/assets/logo.svg"
            alt="maraud logo"
            aria-hidden="true"
            width={18} 
            height={18} 
            className="brand-mark"
            style={{ width: "26px", height: "auto" }}
          />
          <p className="brand-text">Maraud <span>Helper</span></p>
        </div>

        <div className="profile-pill">
          <Image
            src="/assets/pfp%20Merouane.png"
            alt="Photo de profil de Merouane SADI"
            width={44}
            height={44}
            className="profile-avatar"
          />
          <div>
            <p className="profile-name">Merouane SADI</p>
            <p className="profile-role">Gestionnaire</p>
          </div>
          <button type="button" aria-label="Parametres" className="icon-button">
            <Image src="/assets/settings.svg" alt="" aria-hidden="true" width={16} height={16} className="icon-img" />
          </button>
          <button type="button" aria-label="Deconnexion" className="icon-button">
            <Image src="/assets/signout.svg" alt="" aria-hidden="true" width={16} height={16} className="icon-img" />
          </button>
        </div>
      </header>

      <main className="dashboard">
        <Link href="/tableau-de-bord" className="back-link" aria-label="Retour">
          <Image src="/assets/arrow_ltor.svg" alt="" aria-hidden="true" width={14} height={14} className="icon-img back-arrow" />
        </Link>

        <p className="eyebrow">NOUVELLE MARAUDE</p>
        <h1>Maraude Nord</h1>

        <section className="board" aria-label="Tableau de bord">
          <h2>Tableau de bord</h2>

          <div className="board-grid">
            <article className="meeting-card card">
              <div className="map-fake" aria-hidden="true" />
              <p className="label">POINT DE RENDEZ VOUS</p>
              <p className="meeting-address">30-32 avenue de la Republique, Villejuif</p>
              <p className="meeting-note">Pour acceder au batiment, il faut rentrer le code 458 sur l&apos;interphone</p>
              <div className="meeting-actions">
                <button type="button" className="square-btn" aria-label="Parametres lieu">
                  <Image src="/assets/settings.svg" alt="" aria-hidden="true" width={16} height={16} className="icon-img" />
                </button>
                <Link href="/carte" className="primary-btn">
                  <Image src="/assets/arrow_ltor.svg" alt="" aria-hidden="true" width={14} height={14} className="icon-img" />
                  Acceder a la carte
                </Link>
              </div>
            </article>

            <div className="manager-stack card">
              <section>
                <h3>Gestionnaire de taches</h3>
                <div className="dual-cards">
                  <article className="mini-card">
                    <p>Preparation des sacs</p>
                    <div className="mini-row">
                      <span className="avatars" aria-label="Membres assignes">
                        <Image src="/assets/pfp%20random%201.png" alt="" aria-hidden="true" width={24} height={24} className="avatar-mini" />
                        <Image src="/assets/pfp%20random%202.png" alt="" aria-hidden="true" width={24} height={24} className="avatar-mini overlap" />
                        <span className="avatar-count">+8</span>
                      </span>
                      <button type="button" className="square-btn" aria-label="Regler preparation">
                        <Image src="/assets/settings.svg" alt="" aria-hidden="true" width={16} height={16} className="icon-img" />
                      </button>
                    </div>
                  </article>
                  <article className="mini-card">
                    <p>Achats</p>
                    <div className="mini-row">
                      <span className="avatars" aria-label="Membres assignes">
                        <Image src="/assets/pfp%20random%203.png" alt="" aria-hidden="true" width={24} height={24} className="avatar-mini" />
                        <Image src="/assets/pfp%20random%204.png" alt="" aria-hidden="true" width={24} height={24} className="avatar-mini overlap" />
                      </span>
                      <button type="button" className="square-btn" aria-label="Regler achats">
                        <Image src="/assets/settings.svg" alt="" aria-hidden="true" width={16} height={16} className="icon-img" />
                      </button>
                    </div>
                  </article>
                </div>
              </section>

              <section>
                <h3>Gestionnaire des stocks</h3>
                <div className="dual-cards">
                  <article className="mini-card stock">
                    <p className="label">ALIMENTAIRE</p>
                    <p>Sac de nourriture</p>
                    <div className="mini-row">
                      <button type="button" className="square-btn" aria-label="Regler stock alimentaire">
                        <Image src="/assets/settings.svg" alt="" aria-hidden="true" width={16} height={16} className="icon-img" />
                      </button>
                      <Link href="/gestion-stock" className="primary-btn">
                        <Image src="/assets/arrow_ltor.svg" alt="" aria-hidden="true" width={14} height={14} className="icon-img" />
                        Afficher dans stocks
                      </Link>
                    </div>
                  </article>
                  <article className="mini-card stock">
                    <p className="label">TEXTILE</p>
                    <p>Vetements</p>
                    <div className="mini-row">
                      <button type="button" className="square-btn" aria-label="Regler stock textile">
                        <Image src="/assets/settings.svg" alt="" aria-hidden="true" width={16} height={16} className="icon-img" />
                      </button>
                      <Link href="/gestion-stock" className="primary-btn">
                        <Image src="/assets/arrow_ltor.svg" alt="" aria-hidden="true" width={14} height={14} className="icon-img" />
                        Afficher dans stocks
                      </Link>
                    </div>
                  </article>
                </div>
              </section>
            </div>

            <Link href="/maraudes/nouvelle" className="add-card">
              <span>+</span>
              {" "}
              Ajouter
            </Link>
          </div>
        </section>
      </main>

    </div>
  );
}
