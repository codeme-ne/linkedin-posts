import { useNavigate } from "react-router-dom";
import { FooterBar } from "@/components/landing/FooterBar";
import { HeaderBar } from "@/components/landing/HeaderBar";

export default function Privacy() {
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
        <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Datenschutz auf einen Blick</h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">Allgemeine Hinweise</h3>
            <p className="mb-4">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, 
              wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert 
              werden können.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Verantwortlicher</h2>
            <p className="mb-4">
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
              <br />
              Social Transformer<br />
              [Ihre Adresse]<br />
              [PLZ Ort]<br />
              <br />
              E-Mail: support@socialtransformer.de
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Datenerfassung auf dieser Website</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Cookies</h3>
            <p className="mb-4">
              Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Textdateien und richten auf Ihrem 
              Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) 
              oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Server-Log-Dateien</h3>
            <p className="mb-4">
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, 
              die Ihr Browser automatisch an uns übermittelt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Verwendete Dienste</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Supabase</h3>
            <p className="mb-4">
              Wir nutzen Supabase für die Authentifizierung und Datenspeicherung. Supabase ist ein Open-Source-Backend-Service, 
              der die sichere Speicherung Ihrer Daten gewährleistet. Die Datenverarbeitung erfolgt auf Grundlage von Art. 6 
              Abs. 1 lit. f DSGVO.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Stripe</h3>
            <p className="mb-4">
              Für Zahlungen verwenden wir den Zahlungsdienstleister Stripe. Bei einer Zahlung werden Ihre Zahlungsdaten 
              (z.B. Name, E-Mail-Adresse, Kreditkartendaten) an Stripe übermittelt. Diese Datenübermittlung erfolgt gemäß 
              Art. 6 Abs. 1 lit. b DSGVO.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Claude AI (Anthropic)</h3>
            <p className="mb-4">
              Wir nutzen Claude AI zur Generierung von Social Media Posts. Die von Ihnen eingegebenen Newsletter-Inhalte 
              werden zur Verarbeitung an die Claude AI API übermittelt. Die generierten Inhalte werden ausschließlich für 
              Ihre Nutzung erstellt und nicht von uns gespeichert oder analysiert.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Vercel</h3>
            <p className="mb-4">
              Diese Website wird auf Vercel gehostet. Vercel kann technische Daten wie IP-Adressen und Browser-Informationen 
              erfassen, um den Service bereitzustellen. Details finden Sie in der Datenschutzerklärung von Vercel.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Ihre Rechte</h2>
            <p className="mb-4">
              Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten 
              personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten 
              zu verlangen. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an uns wenden.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Widerspruch gegen Werbe-E-Mails</h2>
            <p className="mb-4">
              Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten zur Übersendung von nicht 
              ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit widersprochen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. SSL- bzw. TLS-Verschlüsselung</h2>
            <p className="mb-4">
              Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine 
              SSL-bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile 
              des Browsers von „http://" auf „https://" wechselt.
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