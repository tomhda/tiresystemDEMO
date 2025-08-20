import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { recommendationEngine } from '../utils/tireRecommendation';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const ReviewPage = () => {
  const navigate = useNavigate();
  const { extractedSpecs, setRecommendations, setLoading, setError, loading, error } = useApp();
  
  const [editableSpecs, setEditableSpecs] = useState({
    size: '',
    li: '',
    ss: '',
    season: ''
  });

  useEffect(() => {
    if (!extractedSpecs) {
      navigate('/upload');
      return;
    }
    
    setEditableSpecs({
      size: extractedSpecs.size || '',
      li: extractedSpecs.li || '',
      ss: extractedSpecs.ss || '',
      season: extractedSpecs.season || ''
    });
  }, [extractedSpecs, navigate]);

  const handleInputChange = (field, value) => {
    setEditableSpecs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getConfidence = (field) => {
    if (!extractedSpecs?.confidence) return 0;
    return Math.round((extractedSpecs.confidence[field] || 0) * 100);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSearchRecommendations = async () => {
    if (!editableSpecs.size) {
      setError('タイヤサイズは必須です');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const specs = {
        size: editableSpecs.size,
        li: editableSpecs.li ? parseInt(editableSpecs.li) : null,
        ss: editableSpecs.ss,
        season: editableSpecs.season
      };

      console.log('推薦検索開始:', specs);
      const result = await recommendationEngine.recommend(specs);
      console.log('推薦結果:', result);

      setRecommendations(result);
      navigate('/recommendations');

    } catch (error) {
      console.error('推薦エラー:', error);
      setError('推薦の取得中にエラーが発生しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!extractedSpecs) {
    return null;
  }

  return (
    <div className="container">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/upload')} 
            className="btn btn-outline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </button>
          
          <h2 className="text-2xl font-bold mb-2">読み取り結果の確認</h2>
          <p className="text-gray-600">
            内容を確認し、必要に応じて修正してください
          </p>
        </div>

        {extractedSpecs.ocrText && (
          <div className="card mb-6">
            <h3 className="font-semibold mb-2">読み取ったテキスト</h3>
            <div className="bg-gray-50 p-3 rounded text-sm font-mono">
              {extractedSpecs.ocrText}
            </div>
          </div>
        )}

        <div className="card mb-6">
          <h3 className="font-semibold mb-4">抽出されたタイヤ仕様</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label flex items-center justify-between">
                タイヤサイズ（必須）
                <span className={`text-sm ${getConfidenceColor(getConfidence('size'))}`}>
                  {getConfidence('size')}%
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="例: 225/50R18"
                value={editableSpecs.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                例: 225/50R18, 205/55R16 など
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">季節</label>
              <select
                className="form-input"
                value={editableSpecs.season}
                onChange={(e) => handleInputChange('season', e.target.value)}
              >
                <option value="">指定なし</option>
                <option value="summer">夏タイヤ</option>
                <option value="winter">冬タイヤ</option>
                <option value="all_season">オールシーズン</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label flex items-center justify-between">
                荷重指数 (LI) - 任意
                <span className={`text-sm ${getConfidenceColor(getConfidence('li'))}`}>
                  {getConfidence('li')}%
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="例: 91（空欄可）"
                value={editableSpecs.li}
                onChange={(e) => handleInputChange('li', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label flex items-center justify-between">
                速度記号 (SS) - 任意
                <span className={`text-sm ${getConfidenceColor(getConfidence('ss'))}`}>
                  {getConfidence('ss')}%
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="例: V（空欄可）"
                value={editableSpecs.ss}
                onChange={(e) => handleInputChange('ss', e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {!editableSpecs.size && (
          <div className="alert alert-error mb-6">
            <AlertCircle className="w-5 h-5" />
            タイヤサイズが読み取れませんでした。手動で入力してください。
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleSearchRecommendations}
            disabled={loading || !editableSpecs.size}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <div className="spinner inline mr-2"></div>
                検索中...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                推薦タイヤを検索
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;