import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import OutputDisplay from './components/OutputDisplay';
import { analyzeTranscript, generateViralScriptStream } from './services/geminiService';
import { AppState, AnalysisResult } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [generatedContent, setGeneratedContent] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Keep original script in ref to reuse during generation phase without re-rendering input form unnecessarily
  const originalScriptRef = useRef<string>('');

  const handleAnalysis = useCallback(async (original: string) => {
    originalScriptRef.current = original;
    setAppState(AppState.ANALYZING);
    try {
      const result = await analyzeTranscript(original);
      setAnalysisResult(result);
      setAppState(AppState.ANALYSIS_COMPLETE);
    } catch (error) {
      console.error('Failed to analyze script', error);
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleGeneration = useCallback(async (topic: string) => {
    if (!analysisResult) return;

    setAppState(AppState.GENERATING);
    setGeneratedContent(''); // Clear previous content

    try {
      await generateViralScriptStream(
        originalScriptRef.current,
        analysisResult.structureSummary,
        topic, 
        (chunk) => {
          setGeneratedContent(prev => prev + chunk);
        }
      );
      setAppState(AppState.COMPLETE);
    } catch (error) {
      console.error('Failed to generate script', error);
      setAppState(AppState.ERROR);
    }
  }, [analysisResult]);

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setGeneratedContent('');
    setAnalysisResult(null);
    originalScriptRef.current = '';
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)] min-h-[600px]">
          
          {/* Left Column: Input (Analysis & Config) */}
          <section className="h-full">
            <InputForm 
              onAnalyze={handleAnalysis}
              onGenerate={handleGeneration}
              onReset={handleReset}
              appState={appState}
              analysisResult={analysisResult}
            />
          </section>

          {/* Right Column: Output (Final Script) */}
          <section className="h-full">
            <OutputDisplay 
              content={generatedContent} 
              appState={appState} 
              onReset={handleReset}
            />
          </section>

        </div>
      </main>

      {/* Footer for mobile/scroll contexts */}
      <footer className="py-6 text-center text-gray-600 text-sm border-t border-gray-900 mt-auto">
        <p>© {new Date().getFullYear()} TubeMorph AI. YouTube와 관련 없음.</p>
      </footer>
    </div>
  );
};

export default App;