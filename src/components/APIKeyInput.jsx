import React, { useState } from 'react';
import { Key, Save, Eye, EyeOff } from 'lucide-react';

const APIKeyInput = ({ onApiKeySet, currentHasKey }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!currentHasKey);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim());
      setApiKey('');
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    onApiKeySet(null);
    setApiKey('');
  };

  if (!isExpanded && currentHasKey) {
    return (
      <div className="bg-green-50 border border-green-200 rounded p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-green-700">
            <Key className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Google Vision API設定済み</span>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              変更
            </button>
            <button
              onClick={handleClear}
              className="text-sm text-red-600 hover:underline"
            >
              削除
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Key className="w-5 h-5" />
        <h3 className="font-semibold">Google Vision API設定</h3>
        {currentHasKey && (
          <button
            onClick={() => setIsExpanded(false)}
            className="ml-auto text-sm text-gray-500 hover:text-gray-700"
          >
            閉じる
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="form-label">APIキー</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              className="form-input pr-20"
              placeholder="AIzaSyC..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Google Cloud Console で取得したAPIキーを入力
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!apiKey.trim()}
          >
            <Save className="w-4 h-4" />
            保存
          </button>
          
          {currentHasKey && (
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-outline text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
            >
              削除
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
        <strong>取得方法：</strong>
        <ol className="mt-1 ml-4 list-decimal space-y-1">
          <li><a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a> にアクセス</li>
          <li>新しいプロジェクトを作成または選択</li>
          <li>「Cloud Vision API」を検索して有効化</li>
          <li>「認証情報」→「APIキー」を作成</li>
          <li>無料枠：月1,000リクエストまで</li>
        </ol>
      </div>
    </div>
  );
};

export default APIKeyInput;