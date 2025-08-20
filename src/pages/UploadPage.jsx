import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ImageUpload from '../components/ImageUpload';
import OCRModeSelector from '../components/OCRModeSelector';
import APIKeyInput from '../components/APIKeyInput';
import { ocrService } from '../services/ocrService';
import { tireParser } from '../utils/tireParser';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const UploadPage = () => {
  const navigate = useNavigate();
  const { setCurrentImage, setExtractedSpecs, setLoading, setError, loading, error } = useApp();
  const [ocrMode, setOcrMode] = useState(ocrService.mode);
  const [hasApiKey, setHasApiKey] = useState(!!ocrService.apiKey);

  useEffect(() => {
    setHasApiKey(!!ocrService.apiKey);
  }, []);

  const handleModeChange = (mode) => {
    setOcrMode(mode);
    ocrService.configure(ocrService.apiKey, mode);
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

  const handleImageUpload = async (file) => {
    setCurrentImage(file);
    setError(null);
    setLoading(true);

    try {
      console.log('OCR処理開始:', file.name);
      
      // OCR実行
      const ocrResult = await ocrService.extractText(file);
      console.log('OCR結果:', ocrResult);

      // テキストパース
      const parsedSpecs = tireParser.parse(ocrResult.text, ocrResult.confidence);
      console.log('パース結果:', parsedSpecs);

      setExtractedSpecs({
        ...parsedSpecs,
        ocrText: ocrResult.text,
        ocrConfidence: ocrResult.confidence
      });

      // 確認画面へ
      navigate('/review');

    } catch (error) {
      console.error('画像処理エラー:', error);
      setError('画像の処理中にエラーが発生しました。再試行してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-outline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </button>
          
          <h2 className="text-2xl font-bold mb-2">タイヤの写真をアップロード</h2>
          <p className="text-gray-600">
            タイヤ側面の文字が読めるように撮影してください
          </p>
        </div>

        <ImageUpload 
          onImageUpload={handleImageUpload}
          disabled={loading}
        />

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p className="mt-4 text-lg font-medium">画像を解析しています...</p>
            <p className="text-sm text-gray-600">しばらくお待ちください</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="mt-6">
          <APIKeyInput
            onApiKeySet={handleApiKeySet}
            currentHasKey={hasApiKey}
          />
        </div>

        <div className="mt-6">
          <OCRModeSelector
            currentMode={ocrMode}
            onModeChange={handleModeChange}
            hasApiKey={hasApiKey}
          />
        </div>

        <div className="card mt-6">
          <h3 className="font-semibold mb-3">💡 うまく読み取れない場合</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• 文字がぼけていないか確認してください</li>
            <li>• 影で文字が見えない場合は明るい場所で撮影</li>
            <li>• 別の角度から撮影してみてください</li>
            <li>• うまくいかない場合は手入力でも検索できます</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;