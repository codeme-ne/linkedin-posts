import { useNavigate } from "react-router-dom";
import { FooterBar } from "@/components/landing/FooterBar";
import { HeaderBar } from "@/components/landing/HeaderBar";

export default function Imprint() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="container mx-auto px-4">
        <HeaderBar 
          isVisible={true}
          onSignup={() => navigate('/')}
        />
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Impressum</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Angaben gemäß § 5 TMG</h2>
            <p className="mb-4">
              Social Transformer<br />
              [Firmenname / Ihr Name]<br />
              [Straße und Hausnummer]<br />
              [PLZ Ort]<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Kontakt</h2>
            <p className="mb-4">
              Telefon: [Telefonnummer]<br />
              E-Mail: support@socialtransformer.de<br />
              Website: www.socialtransformer.de
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Vertreten durch</h2>
            <p className="mb-4">
              [Vor- und Nachname des Geschäftsführers/Inhabers]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Registereintrag</h2>
            <p className="mb-4">
              Eintragung im Handelsregister.<br />
              Registergericht: [Amtsgericht]<br />
              Registernummer: [HRB-Nummer]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Umsatzsteuer-ID</h2>
            <p className="mb-4">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
              [DE + Nummer]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Berufsbezeichnung und berufsrechtliche Regelungen</h2>
            <p className="mb-4">
              Berufsbezeichnung: [falls zutreffend]<br />
              Zuständige Kammer: [falls zutreffend]<br />
              Verliehen in: Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p className="mb-4">
              [Vor- und Nachname]<br />
              [Straße und Hausnummer]<br />
              [PLZ Ort]<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">EU-Streitschlichtung</h2>
            <p className="mb-4">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:<br />
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://ec.europa.eu/consumers/odr/
              </a><br />
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
            <p className="mb-4">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Haftungsausschluss</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Haftung für Inhalte</h3>
            <p className="mb-4">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
              allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
              verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen 
              zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Haftung für Links</h3>
            <p className="mb-4">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
              Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten 
              Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Urheberrecht</h2>
            <p className="mb-4">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen 
              Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
              Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-muted-foreground">
              Stand: Januar 2025
            </p>
          </div>
        </div>
      </main>

      <FooterBar />
    </div>
  );
}