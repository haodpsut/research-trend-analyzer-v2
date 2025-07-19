
import React, { useState, useCallback } from 'react';
import { ResearchField, AppStatus } from './types';
import type { AnalyzedKeyword, Paper, SuggestedTitle } from './types';
import { analyzeKeywords, findRecentPapers, brainstormTitles } from './services/geminiService';
import Stepper from './components/Stepper';
import Spinner from './components/Spinner';
import BarChartComponent from './components/BarChartComponent';
import { STEPS } from './constants';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { PaperIcon } from './components/icons/PaperIcon';
import { LightBulbIcon } from './components/icons/LightBulbIcon';

const App: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
    const [error, setError] = useState<string | null>(null);

    // Step 1 State
    const [field, setField] = useState<ResearchField>(ResearchField.AI);
    const [initialKeywords, setInitialKeywords] = useState<string>('');
    const [apiKey, setApiKey] = useState({ semanticScholar: '', scopus: '' });

    // Step 2 State
    const [analyzedKeywords, setAnalyzedKeywords] = useState<AnalyzedKeyword[]>([]);
    const [recentPapers, setRecentPapers] = useState<Paper[]>([]);

    // Step 3 State
    const [suggestedTitles, setSuggestedTitles] = useState<SuggestedTitle[]>([]);
    
    const handleAnalyze = useCallback(async () => {
        if (!initialKeywords.trim()) {
            setError("Please enter at least one keyword.");
            return;
        }
        setError(null);
        setStatus(AppStatus.ANALYZING);

        try {
            const keywords = await analyzeKeywords(field, initialKeywords);
            setAnalyzedKeywords(keywords);

            if (keywords.length > 0) {
                const papers = await findRecentPapers(keywords.map(k => k.keyword));
                setRecentPapers(papers);
            }
            
            setStatus(AppStatus.IDLE);
            setCurrentStep(2);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
            setStatus(AppStatus.ERROR);
        }
    }, [field, initialKeywords]);

    const handleBrainstorm = useCallback(async () => {
        setError(null);
        setStatus(AppStatus.BRAINSTORMING);
        try {
            const titles = await brainstormTitles(recentPapers);
            setSuggestedTitles(titles);
            setStatus(AppStatus.DONE);
            setCurrentStep(3);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred during brainstorming.");
            setStatus(AppStatus.ERROR);
        }
    }, [recentPapers]);

    const handleReset = () => {
        setCurrentStep(1);
        setStatus(AppStatus.IDLE);
        setError(null);
        setInitialKeywords('');
        setAnalyzedKeywords([]);
        setRecentPapers([]);
        setSuggestedTitles([]);
    };

    const renderContent = () => {
        if (status === AppStatus.ANALYZING || status === AppStatus.BRAINSTORMING) {
            return (
                <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg shadow-lg">
                    <Spinner />
                    <p className="mt-4 text-lg font-medium text-gray-600">
                        {status === AppStatus.ANALYZING ? 'Analyzing trends and finding papers...' : 'Brainstorming brilliant title ideas...'}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">This may take a moment. Please wait.</p>
                </div>
            );
        }

        switch (currentStep) {
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderStep3();
            default: return renderStep1();
        }
    };
    
    const renderStep1 = () => (
      <div className="bg-surface-ground p-8 rounded-xl shadow-lg w-full max-w-2xl animate-fade-in">
          <h2 className="text-2xl font-bold text-base-content mb-2">Start Your Research Journey</h2>
          <p className="text-gray-500 mb-6">Tell us your field of interest and some starting keywords.</p>

          <div className="space-y-6">
              <div>
                  <label htmlFor="field" className="block text-sm font-medium text-gray-700 mb-1">Research Field</label>
                  <select id="field" value={field} onChange={e => setField(e.target.value as ResearchField)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition">
                      {Object.values(ResearchField).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
              </div>
              <div>
                  <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">Initial Keywords</label>
                  <input type="text" id="keywords" value={initialKeywords} onChange={e => setInitialKeywords(e.target.value)} placeholder="e.g., 'LLM security' or 'quantum networking'" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition" />
              </div>

              <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold">Optional API Keys (Future Use)</p>
                  <p>In the future, you'll be able to connect your own academic search engine keys for deeper analysis.</p>
                   <div className="mt-2 space-y-2">
                      <input type="password" placeholder="Semantic Scholar API Key" value={apiKey.semanticScholar} onChange={e => setApiKey(prev => ({ ...prev, semanticScholar: e.target.value }))} className="w-full p-2 border border-gray-200 rounded-md" />
                      <input type="password" placeholder="Scopus API Key" value={apiKey.scopus} onChange={e => setApiKey(prev => ({ ...prev, scopus: e.target.value }))} className="w-full p-2 border border-gray-200 rounded-md" />
                  </div>
              </div>

          </div>
          <button onClick={handleAnalyze} className="w-full mt-8 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-secondary transition-colors flex items-center justify-center text-lg disabled:bg-gray-400" disabled={!initialKeywords.trim()}>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Analyze Trends
          </button>
      </div>
    );

    const renderStep2 = () => (
      <div className="bg-surface-ground p-8 rounded-xl shadow-lg w-full max-w-4xl space-y-10 animate-fade-in">
          <div>
              <h2 className="text-2xl font-bold text-base-content mb-4">Trend Analysis</h2>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Prominent Keywords</h3>
                <p className="text-sm text-gray-600 mb-4">Based on your input, these are the most discussed topics right now.</p>
                <div className="h-64">
                    <BarChartComponent data={analyzedKeywords} />
                </div>
              </div>
          </div>
          <div>
              <h2 className="text-2xl font-bold text-base-content mb-4">Recent Groundbreaking Papers</h2>
              <div className="space-y-4">
                  {recentPapers.map((paper, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <h4 className="font-bold text-brand-primary hover:underline">
                              <a href={paper.url} target="_blank" rel="noopener noreferrer">{paper.title}</a>
                          </h4>
                          <p className="text-xs text-gray-500 mb-2">by {paper.authors.join(', ')}</p>
                          <p className="text-sm text-gray-700">{paper.summary}</p>
                      </div>
                  ))}
              </div>
          </div>
          <button onClick={handleBrainstorm} className="w-full mt-8 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-secondary transition-colors flex items-center justify-center text-lg">
              <PaperIcon className="w-5 h-5 mr-2" />
              Generate Title Ideas
          </button>
      </div>
    );
    
    const renderStep3 = () => (
      <div className="bg-surface-ground p-8 rounded-xl shadow-lg w-full max-w-4xl space-y-8 animate-fade-in">
          <div>
              <h2 className="text-2xl font-bold text-base-content mb-4">Proposed Research Titles</h2>
              <p className="text-gray-600 mb-6">Here are some AI-generated research titles inspired by the latest trends. Use them as a starting point for your next big paper!</p>
              <div className="space-y-6">
                  {suggestedTitles.map((item, index) => (
                      <div key={index} className="p-5 border-l-4 border-brand-primary bg-indigo-50 rounded-r-lg">
                          <h4 className="font-bold text-lg text-gray-800">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">Justification:</span> {item.justification}</p>
                      </div>
                  ))}
              </div>
          </div>
          <button onClick={handleReset} className="w-full mt-8 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-secondary transition-colors flex items-center justify-center text-lg">
              <LightBulbIcon className="w-5 h-5 mr-2" />
              Start a New Search
          </button>
      </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-base-content tracking-tight">Research Trend <span className="text-brand-primary">Analyzer</span></h1>
                <p className="mt-2 text-lg text-gray-600 max-w-3xl mx-auto">Leverage AI to discover what's next in your field and spark your next research idea.</p>
            </header>

            <Stepper steps={STEPS} currentStep={currentStep} className="mb-8 w-full max-w-2xl" />
            
            <main className="w-full flex-grow flex items-start justify-center">
                {renderContent()}
            </main>

            {error && (
                <div className="fixed bottom-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg animate-fade-in" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                        <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </span>
                </div>
            )}
        </div>
    );
};

export default App;
