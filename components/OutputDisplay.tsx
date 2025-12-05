import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { AppState } from '../types';

interface OutputDisplayProps {
  content: string;
  appState: AppState;
  onReset: () => void;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, appState, onReset }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (appState === AppState.IDLE || appState === AppState.ANALYZING || appState === AppState.ANALYSIS_COMPLETE) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 h-full flex flex-col items-center justify-center text-center text-gray-500 border-dashed">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <RefreshCw className="w-8 h-8 opacity-50" />
        </div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">대본 생성 대기 중</h3>
        <p className="max-w-xs mx-auto break-keep">
          왼쪽에서 주제를 선택하고 생성 버튼을 누르면<br/>
          분석된 구조에 맞춘 새 대본이 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  if (appState === AppState.ERROR) {
     return (
      <div className="bg-gray-900 rounded-2xl border border-red-900/50 p-8 h-full flex flex-col items-center justify-center text-center text-red-400">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h3 className="text-lg font-semibold mb-2">생성 실패</h3>
        <p className="mb-6">Gemini 연결 중 문제가 발생했습니다.</p>
        <button 
            onClick={onReset}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
        >
            다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          생성 결과
        </h2>
        <div className="flex items-center gap-2">
           <button
            onClick={onReset}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="초기화"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleCopy}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${copied 
                ? 'bg-green-500/10 text-green-400' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}
            `}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '복사됨' : '복사'}
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-gray-950/50">
        <div className="prose prose-invert prose-brand max-w-none">
          <ReactMarkdown
            components={{
              h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mt-6 mb-4 pb-2 border-b border-gray-800" {...props} />,
              p: ({node, ...props}) => <p className="mb-4 text-gray-300 leading-relaxed break-keep" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-300" {...props} />,
              li: ({node, ...props}) => <li className="" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold text-brand-400" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
          {appState === AppState.GENERATING && (
             <span className="inline-block w-2 h-4 ml-1 bg-brand-500 animate-pulse align-middle" />
          )}
        </div>
      </div>
    </div>
  );
};

export default OutputDisplay;