import React from 'react';
import { FileText, Smartphone, Share2, Sparkles, ArrowRight, Link2 } from 'lucide-react';

const HowItWorksGraphic: React.FC = () => {
  return (
    <div className="relative w-full">
      {/* Mobile version */}
      <div className="block lg:hidden space-y-4">
        {/* Step 1: Input */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="font-semibold">Newsletter / URL</div>
          </div>
          <div className="space-y-1.5">
            <div className="h-2 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded w-full" />
            <div className="h-2 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded w-4/5" />
            <div className="h-2 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded w-3/4" />
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <ArrowRight className="w-6 h-6 text-primary animate-bounce" />
        </div>

        {/* Step 2: AI Transformation */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-4 border-2 border-primary/20">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <div className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Claude AI Transformation
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <div className="w-12 h-12 bg-[#0a66c2] rounded-lg flex items-center justify-center text-white font-bold text-xs">
              in
            </div>
            <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold">
              X
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white">
              <Smartphone className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <ArrowRight className="w-6 h-6 text-primary animate-bounce" />
        </div>

        {/* Step 3: Output */}
        <div className="space-y-2">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-3 border border-[#0a66c2]/20">
            <div className="text-xs font-semibold text-[#0a66c2] mb-2">LinkedIn Post</div>
            <div className="space-y-1">
              <div className="h-1.5 bg-[#0a66c2]/20 rounded w-full" />
              <div className="h-1.5 bg-[#0a66c2]/20 rounded w-3/4" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-3 border border-black/20 dark:border-white/20">
            <div className="text-xs font-semibold mb-2">X Thread</div>
            <div className="space-y-1">
              <div className="h-1.5 bg-slate-300 dark:bg-slate-600 rounded w-full" />
              <div className="h-1.5 bg-slate-300 dark:bg-slate-600 rounded w-2/3" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-3 border border-pink-600/20">
            <div className="text-xs font-semibold text-pink-600 mb-2">Instagram Story</div>
            <div className="space-y-1">
              <div className="h-1.5 bg-pink-600/20 rounded w-full" />
              <div className="h-1.5 bg-pink-600/20 rounded w-4/5" />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop version */}
      <div className="hidden lg:block relative w-full h-[450px]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-2xl" />
        
        <div className="relative z-10 w-full h-full p-8">
          {/* Step 1: Input document */}
          <div className="absolute top-12 left-8 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-5 w-56 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm font-semibold">Newsletter/Blog</div>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded w-full" />
              <div className="h-2 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded w-4/5" />
              <div className="h-2 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded w-3/4" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Link2 className="w-3 h-3" />
              <span>oder URL eingeben</span>
            </div>
          </div>

          {/* Arrow from step 1 to center */}
          <svg className="absolute top-24 left-64" width="100" height="100">
            <defs>
              <linearGradient id="arrow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(217, 119, 87)" />
                <stop offset="100%" stopColor="rgb(197, 102, 73)" />
              </linearGradient>
            </defs>
            <path
              d="M 0 30 Q 50 30 80 50"
              stroke="url(#arrow-gradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
            <polygon points="80,50 75,45 75,55" fill="rgb(197, 102, 73)" />
          </svg>

          {/* Center: AI processing */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-72 border-2 border-primary/20 hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Claude AI Transformation
                </div>
              </div>
              
              {/* Platform icons */}
              <div className="flex justify-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#0a66c2] rounded-lg flex items-center justify-center text-white font-bold shadow-lg hover:scale-110 transition-transform duration-200">
                  in
                </div>
                <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold shadow-lg hover:scale-110 transition-transform duration-200">
                  X
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform duration-200">
                  <Smartphone className="w-6 h-6" />
                </div>
              </div>
              
              <div className="text-xs text-center text-muted-foreground">
                Anthropic Console optimierte Prompts
              </div>
            </div>
          </div>

          {/* Arrow from center to posts */}
          <svg className="absolute top-32 right-80" width="100" height="40">
            <path
              d="M 0 20 L 70 20"
              stroke="url(#arrow-gradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
            <polygon points="70,20 65,15 65,25" fill="rgb(197, 102, 73)" />
          </svg>

          {/* Step 3: Generated posts */}
          <div className="absolute top-8 right-8">
            <div className="space-y-3">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 w-52 border border-[#0a66c2]/20 hover:scale-105 transition-transform duration-300">
                <div className="text-sm font-semibold text-[#0a66c2] mb-2">LinkedIn Post</div>
                <div className="space-y-1.5">
                  <div className="h-2 bg-[#0a66c2]/20 rounded w-full" />
                  <div className="h-2 bg-[#0a66c2]/20 rounded w-3/4" />
                  <div className="h-2 bg-[#0a66c2]/20 rounded w-2/3" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 w-52 border border-black/20 dark:border-white/20 hover:scale-105 transition-transform duration-300">
                <div className="text-sm font-semibold mb-2">X Thread</div>
                <div className="space-y-1.5">
                  <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-full" />
                  <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-2/3" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 w-52 border border-pink-600/20 hover:scale-105 transition-transform duration-300">
                <div className="text-sm font-semibold text-pink-600 mb-2">Instagram Story</div>
                <div className="space-y-1.5">
                  <div className="h-2 bg-pink-600/20 rounded w-full" />
                  <div className="h-2 bg-pink-600/20 rounded w-4/5" />
                  <div className="h-2 bg-pink-600/20 rounded w-3/4" />
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Share button */}
          <div className="absolute bottom-10 right-20">
            <button className="bg-gradient-to-r from-primary to-accent text-white rounded-lg shadow-xl px-6 py-3 flex items-center gap-2 font-semibold hover:scale-105 transition-transform duration-300">
              <Share2 className="w-5 h-5" />
              <span>Teilen</span>
            </button>
          </div>

          {/* Arrow to share button */}
          <svg className="absolute bottom-28 right-40" width="50" height="70">
            <path
              d="M 0 0 Q 25 25 25 50"
              stroke="url(#arrow-gradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
            <polygon points="25,50 20,45 30,45" fill="rgb(197, 102, 73)" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksGraphic;