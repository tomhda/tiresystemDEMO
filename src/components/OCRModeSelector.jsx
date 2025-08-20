import React from 'react';
import { Cloud, Monitor, Settings } from 'lucide-react';

const OCRModeSelector = ({ currentMode, onModeChange, hasApiKey }) => {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5" />
        <h3 className="font-semibold">OCRモード選択</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className={`
          flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors
          ${currentMode === 'cloud' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
          }
          ${!hasApiKey ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <input
            type="radio"
            name="ocrMode"
            value="cloud"
            checked={currentMode === 'cloud'}
            onChange={(e) => onModeChange(e.target.value)}
            disabled={!hasApiKey}
            className="sr-only"
          />
          <Cloud className="w-5 h-5 mr-3 text-blue-600" />
          <div>
            <div className="font-medium">Google Vision API</div>
            <div className="text-sm text-gray-600">
              {hasApiKey ? '高精度（月1000回まで無料）' : 'APIキーが必要'}
            </div>
          </div>
        </label>

        <label className={`
          flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors
          ${currentMode === 'mock' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
          }
        `}>
          <input
            type="radio"
            name="ocrMode"
            value="mock"
            checked={currentMode === 'mock'}
            onChange={(e) => onModeChange(e.target.value)}
            className="sr-only"
          />
          <Monitor className="w-5 h-5 mr-3 text-green-600" />
          <div>
            <div className="font-medium">デモモード</div>
            <div className="text-sm text-gray-600">
              サンプル結果を返します
            </div>
          </div>
        </label>
      </div>
      
      {!hasApiKey && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <strong>Google Vision APIを使用するには：</strong>
          <ol className="mt-1 ml-4 list-decimal space-y-1">
            <li>Google Cloud Consoleでプロジェクト作成</li>
            <li>Cloud Vision APIを有効化</li>
            <li>APIキーを作成</li>
            <li>.envファイルに設定</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default OCRModeSelector;