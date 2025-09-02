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
            <h2 className="text-2xl font-semibold mt-8 mb-4">Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)</h2>
            <p className="mb-4">
              Lukas Zangerl<br />
              Stapper Weg 214<br />
              41199 Mönchengladbach<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Kontakt</h2>
            <p className="mb-4">
              Telefon: +49 151 26718443<br />
              E-Mail: lukas@zangerlcoachingdynamics.com<br />
              Website: www.socialtransformer.de
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Verantwortlich für den Inhalt nach § 18 MStV</h2>
            <p className="mb-4">
              Lukas Zangerl<br />
              Stapper Weg 214<br />
              41199 Mönchengladbach<br />
              Deutschland
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
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 DDG für eigene Inhalte auf diesen Seiten nach den 
              allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht 
              verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen 
              zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p className="mb-4">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen 
              Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt 
              der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden 
              Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Haftung für Links</h3>
            <p className="mb-4">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
              Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten 
              Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten 
              wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren 
              zum Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
            <p className="mb-4">
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte 
              einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige 
              Links umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Urheberrecht</h2>
            <p className="mb-4">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen 
              Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
              Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. 
              Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
            <p className="mb-4">
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte 
              Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem 
              auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. 
              Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-muted-foreground">
              Stand: September 2025
            </p>
          </div>
        </div>
      </main>

      <FooterBar />
    </div>
  );
}