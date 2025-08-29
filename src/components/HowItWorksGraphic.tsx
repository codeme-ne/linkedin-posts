import React from 'react';
import { FileText, Smartphone, Share2 } from 'lucide-react';

const HowItWorksGraphic: React.FC = () => {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl" />
      
      {/* Main content */}
      <div className="relative z-10 w-full h-full p-8">
        {/* Step 1: Input document */}
        <div className="absolute top-8 left-8 bg-white rounded-lg shadow-lg p-4 w-48">
          <FileText className="w-8 h-8 text-indigo-600 mb-2" />
          <div className="text-sm font-medium text-gray-800">Newsletter/Blog</div>
          <div className="mt-2 space-y-1">
            <div className="h-2 bg-gray-200 rounded w-full" />
            <div className="h-2 bg-gray-200 rounded w-4/5" />
            <div className="h-2 bg-gray-200 rounded w-3/4" />
          </div>
        </div>

        {/* Arrow from step 1 to center */}
        <svg className="absolute top-20 left-56" width="80" height="80">
          <path
            d="M 0 20 Q 40 20 60 40"
            stroke="#6366f1"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
          />
          <polygon points="60,40 55,35 55,45" fill="#6366f1" />
        </svg>

        {/* Center: Platform selection and AI processing */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white rounded-xl shadow-xl p-6 w-64">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                KI-Transformation
              </div>
            </div>
            
            {/* Platform icons */}
            <div className="flex justify-center gap-4 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
                in
              </div>
              <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-white font-bold">
                X
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded flex items-center justify-center text-white">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>
            
            <div className="text-xs text-gray-600 text-center">
              Plattform-optimierte Inhalte
            </div>
          </div>
        </div>

        {/* Step 3: Generated posts */}
        <div className="absolute top-8 right-8">
          <div className="space-y-3">
            <div className="bg-white rounded-lg shadow-md p-3 w-44">
              <div className="text-xs font-semibold text-blue-600 mb-1">LinkedIn Post</div>
              <div className="space-y-1">
                <div className="h-1.5 bg-gray-200 rounded w-full" />
                <div className="h-1.5 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 w-44">
              <div className="text-xs font-semibold text-gray-900 mb-1">X Tweet</div>
              <div className="space-y-1">
                <div className="h-1.5 bg-gray-200 rounded w-full" />
                <div className="h-1.5 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 w-44">
              <div className="text-xs font-semibold text-pink-600 mb-1">Instagram Post</div>
              <div className="space-y-1">
                <div className="h-1.5 bg-gray-200 rounded w-full" />
                <div className="h-1.5 bg-gray-200 rounded w-4/5" />
              </div>
            </div>
          </div>
        </div>

        {/* Arrow from center to posts */}
        <svg className="absolute top-32 right-52" width="80" height="40">
          <path
            d="M 0 20 L 50 20"
            stroke="#6366f1"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
          />
          <polygon points="50,20 45,15 45,25" fill="#6366f1" />
        </svg>

        {/* Step 4: Share */}
        <div className="absolute bottom-12 right-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg px-6 py-3 flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          <span className="font-semibold">Teilen</span>
        </div>

        {/* Arrow to share button */}
        <svg className="absolute bottom-24 right-32" width="40" height="60">
          <path
            d="M 0 0 Q 20 20 20 40"
            stroke="#6366f1"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
          />
          <polygon points="20,40 15,35 25,35" fill="#6366f1" />
        </svg>
      </div>
    </div>
  );
};

export default HowItWorksGraphic;