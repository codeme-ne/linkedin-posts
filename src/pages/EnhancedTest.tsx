import React from 'react';
import { EnhancedGenerator } from '@/components/enhanced/EnhancedGenerator';

/**
 * Test page for the enhanced social media generation system
 * This page allows testing and comparison of old vs new prompt systems
 */
export const EnhancedTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Enhanced Social Media Generator Test
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Test the new structured prompt engineering system that implements hook formulas,
            storytelling frameworks, engagement triggers, and goal-oriented generation based on
            analysis of high-performing LinkedIn content patterns.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Key Improvements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Hook Formulas</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Contrarian Opinion</li>
                <li>• Mistake Story</li>
                <li>• Transformation</li>
                <li>• Failure Pattern</li>
                <li>• Reality Check</li>
                <li>• Bold Statement</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Storytelling Frameworks</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• PAS (Problem, Agitate, Solution)</li>
                <li>• STAR (Situation, Task, Action, Result)</li>
                <li>• Before/After transformation</li>
                <li>• Problem-Solution narrative</li>
                <li>• 3-Point List structure</li>
                <li>• Story Arc progression</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Goal-Oriented Generation</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Thought Leadership</li>
                <li>• Drive Traffic</li>
                <li>• Promote Features</li>
                <li>• Start Conversations</li>
                <li>• Share Lessons</li>
                <li>• Build Awareness</li>
              </ul>
            </div>
          </div>
        </div>

        <EnhancedGenerator />

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Testing Guidelines</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold mb-2">1. Content Input</h3>
              <p>Try various types of content: newsletter excerpts, blog posts, technical articles, personal stories, business insights.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Goal Testing</h3>
              <p>Test different post goals to see how the content adapts. Notice how engagement triggers change based on the goal.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Platform Differences</h3>
              <p>Compare how the same content is adapted for LinkedIn vs Twitter vs Instagram with different constraints and styles.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. A/B Comparison</h3>
              <p>Use the comparison mode to see side-by-side differences between the old generic system and the new structured approach.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">5. Regeneration Variety</h3>
              <p>Try regenerating the same content multiple times to see different hook formulas and frameworks being applied.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Development Notes</h2>
          <div className="text-yellow-700 space-y-2">
            <p>• This is a test implementation of the enhanced prompt engineering system</p>
            <p>• Metadata tracking allows analysis of which formulas perform best</p>
            <p>• JSON response format enables structured data extraction</p>
            <p>• Negative constraints prevent corporate jargon and generic language</p>
            <p>• Goal alignment ensures content matches intended purpose</p>
          </div>
        </div>
      </div>
    </div>
  );
};