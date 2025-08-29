import React from 'react';
import HowItWorksGraphic from './HowItWorksGraphic';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: "Newsletter oder Blog einfügen",
      description: "Kopiere deinen Newsletter-Text oder Blog-Artikel in das Eingabefeld"
    },
    {
      number: 2,
      title: "Plattform wählen",
      description: "Wähle zwischen LinkedIn, X (Twitter) oder Instagram für optimierte Inhalte"
    },
    {
      number: 3,
      title: "Posts generieren",
      description: "Unsere KI erstellt maßgeschneiderte Posts für deine gewählte Plattform"
    },
    {
      number: 4,
      title: "Bearbeiten und teilen",
      description: "Passe die Posts an und teile sie direkt auf deinen Social Media Kanälen"
    }
  ];

  return (
    <section className="py-24 bg-gray-900 w-full relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-center mb-20 text-white">
          So einfach geht's
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Steps */}
          <div className="space-y-10">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-semibold leading-snug text-white mb-3">
                    {step.number}. {step.title}
                  </h3>
                  <p className="text-base leading-normal text-gray-300">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right side - Visual graphic */}
          <div className="relative">
            <HowItWorksGraphic />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;