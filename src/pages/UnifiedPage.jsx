import React, { useState, useRef } from 'react';
import { Upload, Camera, Search, Loader, Star, ExternalLink, CheckCircle, AlertCircle, Settings, Key } from 'lucide-react';
import { ocrService } from '../services/ocrService';
import { tireParser } from '../utils/tireParser';
import { recommendationEngine } from '../utils/tireRecommendation';
import '../styles/responsive.css';

const UnifiedPage = () => {
  const [step, setStep] = useState('upload'); // 'upload', 'processing', 'review', 'results'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [extractedSpecs, setExtractedSpecs] = useState({});
  const [editableSpecs, setEditableSpecs] = useState({
    size: '',
    li: '',
    ss: '',
    season: ''
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [ocrMode, setOcrMode] = useState(ocrService.mode);
  const [hasApiKey, setHasApiKey] = useState(!!ocrService.apiKey);
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleImageSelect = async (file) => {
    if (!file) return;

    // ファイル形式チェック
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      setError('JPEG、PNG、WEBP、HEIC形式の画像ファイルを選択してください。');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('ファイルサイズは10MB以下にしてください。');
      return;
    }

    setImageFile(file);
    setError(null);

    // プレビュー表示
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // OCR処理開始
    await processImage(file);
  };

  const processImage = async (file) => {
    setStep('processing');
    setLoading(true);

    try {
      console.log('OCR処理開始:', file.name);
      
      const ocrResult = await ocrService.extractText(file);
      console.log('OCR結果:', ocrResult);
      setOcrText(ocrResult.text);

      const parsedSpecs = tireParser.parse(ocrResult.text);
      console.log('パース結果:', parsedSpecs);
      
      setExtractedSpecs(parsedSpecs);
      setEditableSpecs({
        size: parsedSpecs.size || '',
        li: parsedSpecs.li || '',
        ss: parsedSpecs.ss || '',
        season: parsedSpecs.season || ''
      });

      setStep('review');

    } catch (error) {
      console.error('画像処理エラー:', error);
      setError('画像の処理中にエラーが発生しました: ' + error.message);
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!editableSpecs.size) {
      setError('タイヤサイズは必須です');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const specs = {
        size: editableSpecs.size,
        li: editableSpecs.li ? parseInt(editableSpecs.li) : null,
        ss: editableSpecs.ss,
        season: editableSpecs.season
      };

      const result = await recommendationEngine.recommend(specs);
      setRecommendations(result.items || []);
      setStep('results');

    } catch (error) {
      console.error('検索エラー:', error);
      setError('検索中にエラーが発生しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setImageFile(null);
    setImagePreview(null);
    setOcrText('');
    setExtractedSpecs({});
    setEditableSpecs({ size: '', li: '', ss: '', season: '' });
    setRecommendations([]);
    setError(null);
  };

  const handleApiKeySet = (apiKey) => {
    if (apiKey) {
      ocrService.configure(apiKey, 'cloud');
      setOcrMode('cloud');
      setHasApiKey(true);
    } else {
      ocrService.configure(null, 'mock');
      setOcrMode('mock');
      setHasApiKey(false);
    }
  };

  const handleModeChange = (mode) => {
    setOcrMode(mode);
    ocrService.configure(ocrService.apiKey, mode);
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStockStatusText = (status) => {
    switch (status) {
      case 'high': return '在庫豊富';
      case 'medium': return '在庫少';
      case 'low': return '在庫僅少';
      default: return '在庫不明';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">タイヤ推薦AI</h1>
              <p className="text-sm text-gray-600">写真でかんたんタイヤ選び</p>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">設定</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            {/* API Key Input */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-4 h-4" />
                <span className="font-medium">Google Vision API</span>
                {hasApiKey && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">設定済み</span>}
              </div>
              
              {!hasApiKey && (
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="APIキーを入力..."
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        handleApiKeySet(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Google Cloud Consoleで取得したAPIキーを入力してEnter
                  </p>
                </div>
              )}
            </div>

            {/* OCR Mode */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleModeChange('cloud')}
                disabled={!hasApiKey}
                className={`p-3 rounded-lg text-sm transition-colors ${ 
                  ocrMode === 'cloud' && hasApiKey
                    ? 'bg-blue-100 border-2 border-blue-500 text-blue-700'
                    : hasApiKey
                    ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    : 'bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="font-medium">高精度OCR</div>
                <div className="text-xs">Google Vision API</div>
              </button>
              
              <button
                onClick={() => handleModeChange('mock')}
                className={`p-3 rounded-lg text-sm transition-colors ${ 
                  ocrMode === 'mock'
                    ? 'bg-green-100 border-2 border-green-500 text-green-700'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">デモモード</div>
                <div className="text-xs">サンプル結果</div>
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-8">
          {/* Step 1: Image Upload */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <h2 className="text-xl font-bold mb-2">1. タイヤ写真をアップロード</h2>
              <p className="opacity-90">タイヤ側面の規格が読めるように撮影してください</p>
            </div>
            
            <div className="p-6">
              {!imagePreview ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-700">写真を選択またはドロップ</p>
                    <p className="text-sm text-gray-500">JPEG, PNG, WEBP対応（最大10MB）</p>
                  </div>
                  <div className="flex justify-center gap-4 mt-6">
                    <button 
                      onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      カメラで撮影
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      ファイル選択
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="アップロード画像"
                      className="w-full max-h-80 object-contain rounded-lg border"
                    />
                    <button
                      onClick={handleReset}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  {step === 'processing' && (
                    <div className="text-center py-8">
                      <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                      <p className="text-lg font-medium">画像を解析中...</p>
                      <p className="text-sm text-gray-600">しばらくお待ちください</p>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleImageSelect(e.target.files[0])}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="camera"
                onChange={(e) => e.target.files[0] && handleImageSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          </div>

          {/* Step 2: Review & Edit */}
          {(step === 'review' || step === 'results') && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                <h2 className="text-xl font-bold mb-2">2. 読み取り結果の確認・修正</h2>
                <p className="opacity-90">内容を確認し、必要に応じて修正してください</p>
              </div>
              
              <div className="p-6 space-y-6">
                {ocrText && (
                  <div>
                    <h3 className="font-semibold mb-2">読み取ったテキスト</h3>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm font-mono whitespace-pre-wrap border">
                      {ocrText}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      タイヤサイズ（必須） 
                      {extractedSpecs.confidence?.size && (
                        <span className="text-sm text-green-600 ml-2">
                          信頼度: {Math.round(extractedSpecs.confidence.size * 100)}%
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例: 225/50R18"
                      value={editableSpecs.size}
                      onChange={(e) => setEditableSpecs(prev => ({ ...prev, size: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">季節</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={editableSpecs.season}
                      onChange={(e) => setEditableSpecs(prev => ({ ...prev, season: e.target.value }))}
                    >
                      <option value="">指定なし</option>
                      <option value="summer">夏タイヤ</option>
                      <option value="winter">冬タイヤ</option>
                      <option value="all_season">オールシーズン</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      荷重指数 (LI) - 任意
                      {extractedSpecs.confidence?.li && (
                        <span className="text-sm text-green-600 ml-2">
                          信頼度: {Math.round(extractedSpecs.confidence.li * 100)}%
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例: 91"
                      value={editableSpecs.li}
                      onChange={(e) => setEditableSpecs(prev => ({ ...prev, li: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      速度記号 (SS) - 任意
                      {extractedSpecs.confidence?.ss && (
                        <span className="text-sm text-green-600 ml-2">
                          信頼度: {Math.round(extractedSpecs.confidence.ss * 100)}%
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例: V"
                      value={editableSpecs.ss}
                      onChange={(e) => setEditableSpecs(prev => ({ ...prev, ss: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleSearch}
                    disabled={loading || !editableSpecs.size}
                    className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    {loading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                    {loading ? '検索中...' : '推奨タイヤを検索'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 'results' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                <h2 className="text-xl font-bold mb-2">3. おすすめタイヤ</h2>
                <p className="opacity-90">安全性を考慮して厳選された商品です</p>
              </div>
              
              <div className="p-6">
                {recommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Search className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-600">該当商品が見つかりませんでした</h3>
                    <p className="text-gray-500 mb-6">検索条件を変更して再度お試しください</p>
                    <button
                      onClick={() => setStep('review')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      条件を変更
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {recommendations.map((tire, index) => (
                      <div key={tire.sku || index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-1">
                                  {tire.brand} {tire.pattern}
                                  {tire.recommended && tire.recommended.trim() !== '' && (
                                    <span className="ml-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                                      {tire.recommended}
                                    </span>
                                  )}
                                  {tire.sale_info && (
                                    <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                                      {tire.sale_info}
                                    </span>
                                  )}
                                </h3>
                                <p className="text-lg text-gray-600">
                                  {tire.size} {tire.li}{tire.ss}
                                </p>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStockStatusColor(tire.stock_status)}`}>
                                {getStockStatusText(tire.stock_status)}
                              </div>
                            </div>

                            <div className="flex items-center gap-8 mb-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">静粛性</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${i < (tire.quiet_score || 3) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">低燃費</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${i < (tire.eco_score || 3) ? 'text-green-400 fill-current' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>

                            <p className="text-gray-700 mb-4">
                              {tire.summary || 'バランスの取れた高性能タイヤです।'}
                            </p>
                          </div>

                          <div className="lg:w-64 text-center lg:text-right space-y-4">
                            <div>
                              <p className="text-3xl font-bold text-blue-600">
                                ¥{tire.price?.toLocaleString() || '12,000'}
                              </p>
                              <p className="text-sm text-gray-500">1本あたり（税込）</p>
                            </div>

                            <a
                              href={tire.product_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
                            >
                              <ExternalLink className="w-4 h-4" />
                              詳細・購入
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="text-center pt-6">
                      <button
                        onClick={handleReset}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        最初からやり直す
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 py-8 text-gray-500 text-sm">
          <p>🤖 これはデモンストレーション用サイトです</p>
        </footer>
      </div>
    </div>
  );
};

export default UnifiedPage;