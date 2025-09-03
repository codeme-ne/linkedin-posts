import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Wie funktioniert Social Transformer genau?",
    answer: "Du gibst einfach eine URL oder einen Text ein, und unser KI-System analysiert den Inhalt und erstellt automatisch ansprechende Social Media Posts für LinkedIn, X (Twitter) und Instagram. Der ganze Prozess dauert nur wenige Sekunden."
  },
  {
    question: "Kann ich die generierten Posts bearbeiten?",
    answer: "Absolut! Alle generierten Posts kannst du nach deinen Wünschen anpassen. Du behältst die volle Kontrolle über den finalen Content und kannst ihn perfekt auf deine Marke und Zielgruppe abstimmen."
  },
  {
    question: "Welche Arten von Inhalten kann ich transformieren?",
    answer: "Du kannst praktisch jeden Text-basierten Inhalt verwenden: Blog-Artikel, Newsletter, Pressemitteilungen, Produktbeschreibungen oder sogar einfache Notizen. Unser System erkennt automatisch die wichtigsten Punkte und macht daraus engaging Social Media Content."
  },
  {
    question: "Ist mein Content sicher und privat?",
    answer: "Ja, deine Daten sind bei uns sicher. Wir speichern keine sensiblen Inhalte dauerhaft und alle Übertragungen sind verschlüsselt. Du behältst die volle Kontrolle über deine Inhalte und kannst sie jederzeit löschen."
  },
  {
    question: "Wie unterscheidet sich das von anderen Content-Tools?",
    answer: "Social Transformer ist speziell für die Transformation bestehender Inhalte optimiert, nicht für die Erstellung von Grund auf. Das macht es viel schneller und effizienter. Außerdem generieren wir plattformspezifische Posts, die für jedes soziale Netzwerk optimiert sind."
  },
  {
    question: "Kann ich das Tool auch für mein Team nutzen?",
    answer: "Aktuell ist Social Transformer für Einzelnutzer konzipiert. Team-Features sind aber bereits in Planung. Mit dem Lifetime Deal erhältst du automatisch Zugang zu allen zukünftigen Features, sobald sie verfügbar sind."
  },
  {
    question: "Was passiert, wenn ich mit einem generierten Post nicht zufrieden bin?",
    answer: "Du kannst jederzeit neue Varianten generieren lassen oder den Post manuell anpassen. Unser System lernt auch aus deinen Präferenzen und wird mit der Zeit immer besser auf deinen Stil abgestimmt."
  },
  {
    question: "Gibt es eine Geld-zurück-Garantie?",
    answer: "Ja! Wir bieten eine 14-Tage Geld-zurück-Garantie. Wenn du nicht vollständig zufrieden bist, erhältst du dein Geld ohne Fragen zurück. Wir sind überzeugt, dass Social Transformer deine Content-Erstellung revolutionieren wird."
  }
];

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
          Häufig gestellte{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Fragen
          </span>
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Hier findest du Antworten auf die wichtigsten Fragen zu Social Transformer
        </p>
      </div>

      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div
            key={index}
            className="bg-background rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 overflow-hidden"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 sm:px-8 sm:py-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
            >
              <h3 className="text-base sm:text-lg font-semibold text-foreground pr-4">
                {item.question}
              </h3>
              <div className="flex-shrink-0">
                {openItems.includes(index) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </button>
            
            {openItems.includes(index) && (
              <div className="px-6 pb-4 sm:px-8 sm:pb-6">
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 sm:mt-12 text-center">
        <p className="text-sm sm:text-base text-muted-foreground mb-4">
          Hast du noch weitere Fragen?
        </p>
        <p className="text-sm text-muted-foreground">
          Schreib uns gerne eine E-Mail an{" "}
          <a 
            href="mailto:support@social-transformer.com" 
            className="text-primary hover:text-accent transition-colors duration-200 font-medium"
          >
            lukas[at]zangerlcoachingdynamics.com
          </a>
        </p>
      </div>
    </section>
  );
}