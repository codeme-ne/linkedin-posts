import { useNavigate } from "react-router-dom";
import { FooterBar } from "@/components/landing/FooterBar";
import { HeaderBar } from "@/components/landing/HeaderBar";

export default function Terms() {
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
        <h1 className="text-4xl font-bold mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">§ 1 Geltungsbereich</h2>
            <p className="mb-4">
              (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") gelten für alle Verträge zwischen 
              Social Transformer (nachfolgend "Anbieter") und dem Kunden über die Nutzung der Social Transformer 
              Plattform und zugehörigen Dienstleistungen.
            </p>
            <p className="mb-4">
              (2) Abweichende, entgegenstehende oder ergänzende AGB des Kunden werden nur dann und insoweit 
              Vertragsbestandteil, als der Anbieter ihrer Geltung ausdrücklich zugestimmt hat.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">§ 2 Vertragsgegenstand</h2>
            <p className="mb-4">
              (1) Der Anbieter stellt dem Kunden eine webbasierte Software-as-a-Service (SaaS) Lösung zur 
              Verfügung, die es ermöglicht, Newsletter und Blog-Inhalte in Social Media Posts für verschiedene 
              Plattformen umzuwandeln.
            </p>
            <p className="mb-4">
              (2) Der genaue Funktionsumfang ergibt sich aus der aktuellen Leistungsbeschreibung auf der Website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">§ 3 Vertragsschluss</h2>
            <p className="mb-4">
              (1) Die Darstellung der Produkte auf unserer Website stellt kein rechtlich bindendes Angebot, 
              sondern eine Aufforderung zur Bestellung dar.
            </p>
            <p className="mb-4">
              (2) Durch die Registrierung und Auswahl eines Tarifs gibt der Kunde ein verbindliches Angebot 
              zum Abschluss eines Nutzungsvertrags ab.
            </p>
            <p className="mb-4">
              (3) Der Vertrag kommt durch die Annahme des Angebots durch den Anbieter zustande, welche durch 
              die Freischaltung des Zugangs erfolgt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">§ 4 Preise und Zahlungsbedingungen</h2>
            <p className="mb-4">
              (1) Es gelten die zum Zeitpunkt der Bestellung auf der Website angegebenen Preise. Alle Preise 
              verstehen sich inklusive der gesetzlichen Mehrwertsteuer.
            </p>
            <p className="mb-4">
              (2) Die Zahlung erfolgt über den Zahlungsdienstleister Stripe. Der Kunde ermächtigt den Anbieter, 
              die fälligen Beträge über Stripe einzuziehen.
            </p>
            <p className="mb-4">
              (3) Bei Zahlungsverzug ist der Anbieter berechtigt, den Zugang zur Plattform zu sperren.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">§ 5 Lifetime Deal</h2>
            <p className="mb-4">
              (1) Der "Lifetime Deal" gewährt dem Kunden gegen eine einmalige Zahlung von 99 € ein zeitlich 
              unbegrenztes Nutzungsrecht an der Plattform.
            </p>
            <p className="mb-4">
              (2) Das Lifetime Deal gilt ausschließlich für die zum Zeitpunkt des Kaufs verfügbaren Funktionen. 
              Zukünftige Premium-Features können zusätzliche Kosten verursachen.
            </p>
            <p className="mb-4">
              (3) Das Lifetime Deal ist nicht übertragbar und gilt nur für den ursprünglichen Käufer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">§ 6 Nutzungsrechte</h2>
            <p className="mb-4">
              (1) Der Kunde erhält ein nicht ausschließliches, nicht übertragbares Nutzungsrecht an der 
              Software für die Dauer des Vertragsverhältnisses.
            </p>
            <p className="mb-4">
              (2) Eine Weitergabe der Zugangsdaten an Dritte ist untersagt.
            </p>
            <p className="mb-4">
              (3) Der Kunde ist verpflichtet, die Plattform nur für rechtmäßige Zwecke zu nutzen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">§ 7 Verfügbarkeit</h2>
            <p className="mb-4">
              (1) Der Anbieter bemüht sich um eine möglichst unterbrechungsfreie Verfügbarkeit der Plattform. 
              Eine Verfügbarkeit von 100% wird jedoch nicht garantiert.
            </p>
            <p className="mb-4">
              (2) Wartungsarbeiten werden, soweit möglich, im Voraus angekündigt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">§ 8 Haftung</h2>
            <p className="mb-4">
              (1) Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie nach Maßgabe 
              des Produkthaftungsgesetzes.
            </p>
            <p className="mb-4">
              (2) Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten 
              und begrenzt auf den vertragstypischen, vorhersehbaren Schaden.
            </p>
            <p className="mb-4">
              (3) Die Haftung für Datenverlust ist auf den typischen Wiederherstellungsaufwand beschränkt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">§ 9 Datenschutz</h2>
            <p className="mb-4">
              (1) Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung.
            </p>
            <p className="mb-4">
              (2) Der Kunde verpflichtet sich, nur solche Inhalte zu verarbeiten, für die er die erforderlichen 
              Rechte besitzt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">§ 10 Vertragslaufzeit und Kündigung</h2>
            <p className="mb-4">
              (1) Der Vertrag läuft auf unbestimmte Zeit.
            </p>
            <p className="mb-4">
              (2) Monatliche Abonnements können mit einer Frist von 14 Tagen zum Monatsende gekündigt werden.
            </p>
            <p className="mb-4">
              (3) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
            </p>
            <p className="mb-4">
              (4) Lifetime Deals sind von der ordentlichen Kündigung ausgeschlossen, können aber aus wichtigem 
              Grund gekündigt werden.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">§ 11 Widerrufsrecht</h2>
            <p className="mb-4">
              (1) Verbrauchern steht ein Widerrufsrecht nach Maßgabe der gesetzlichen Bestimmungen zu.
            </p>
            <p className="mb-4">
              (2) Das Widerrufsrecht beträgt 14 Tage ab Vertragsschluss.
            </p>
            <p className="mb-4">
              (3) Bei digitalen Inhalten erlischt das Widerrufsrecht, wenn der Kunde der sofortigen 
              Vertragsausführung zugestimmt hat.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">§ 12 Änderungen der AGB</h2>
            <p className="mb-4">
              (1) Der Anbieter behält sich vor, diese AGB jederzeit zu ändern.
            </p>
            <p className="mb-4">
              (2) Änderungen werden dem Kunden mindestens 30 Tage vor Inkrafttreten per E-Mail mitgeteilt.
            </p>
            <p className="mb-4">
              (3) Widerspricht der Kunde den Änderungen nicht innerhalb von 30 Tagen, gelten diese als akzeptiert.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">§ 13 Schlussbestimmungen</h2>
            <p className="mb-4">
              (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
            </p>
            <p className="mb-4">
              (2) Gerichtsstand für alle Streitigkeiten aus diesem Vertrag ist, soweit gesetzlich zulässig, 
              der Sitz des Anbieters.
            </p>
            <p className="mb-4">
              (3) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen 
              unberührt.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-muted-foreground">
              Stand: Januar 2025<br />
              Version 1.0
            </p>
          </div>
        </div>
      </main>

      <FooterBar />
    </div>
  );
}