import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { recommendationEngine } from '../utils/tireRecommendation';
import { ArrowLeft, Search, AlertCircle } from 'lucide-react';

const ManualPage = () => {
  const navigate = useNavigate();
  const { setRecommendations, setLoading, setError, loading, error } = useApp();
  
  const [specs, setSpecs] = useState({
    width: '',
    aspect: '',
    rim: '',
    li: '',
    ss: '',
    season: ''
  });

  const handleInputChange = (field, value) => {
    setSpecs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    if (!specs.width || !specs.aspect || !specs.rim) {
      setError('タイヤ幅、扁平率、リム径は必須です');
      return;
    }

    const sizeString = `${specs.width}/${specs.aspect}R${specs.rim}`;
    
    setError(null);
    setLoading(true);

    try {
      const searchSpecs = {
        size: sizeString,
        li: specs.li ? parseInt(specs.li) : null,
        ss: specs.ss,
        season: specs.season
      };

      console.log('手動検索開始:', searchSpecs);
      const result = await recommendationEngine.recommend(searchSpecs);
      console.log('検索結果:', result);

      setRecommendations(result);
      navigate('/recommendations');

    } catch (error) {
      console.error('検索エラー:', error);
      setError('検索中にエラーが発生しました: ' + error.message);
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
          
          <h2 className="text-2xl font-bold mb-2">サイズで検索</h2>
          <p className="text-gray-600">
            タイヤのサイズを直接入力して検索します
          </p>
        </div>

        <div className="card mb-6">
          <h3 className="font-semibold mb-4">タイヤサイズ入力</h3>
          
          <div className="mb-6">
            <div className="flex items-center justify-center bg-gray-50 p-4 rounded mb-4">
              <span className="text-2xl font-mono">
                <input
                  type="text"
                  placeholder="215"
                  className="w-16 text-center border-b-2 border-blue-600 bg-transparent outline-none"
                  value={specs.width}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                />
                <span className="text-gray-400">/</span>
                <input
                  type="text"
                  placeholder="60"
                  className="w-12 text-center border-b-2 border-blue-600 bg-transparent outline-none"
                  value={specs.aspect}
                  onChange={(e) => handleInputChange('aspect', e.target.value)}
                />
                <span className="text-gray-400">R</span>
                <input
                  type="text"
                  placeholder="16"
                  className="w-12 text-center border-b-2 border-blue-600 bg-transparent outline-none"
                  value={specs.rim}
                  onChange={(e) => handleInputChange('rim', e.target.value)}
                />
              </span>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              <div>タイヤ幅(mm) / 扁平率(%) R リム径(インチ)</div>
              <div className="mt-1">例: 215/60R16</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">荷重指数 (LI)</label>
              <input
                type="text"
                className="form-input"
                placeholder="91"
                value={specs.li}
                onChange={(e) => handleInputChange('li', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">速度記号 (SS)</label>
              <input
                type="text"
                className="form-input"
                placeholder="V"
                value={specs.ss}
                onChange={(e) => handleInputChange('ss', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">季節</label>
              <select
                className="form-input"
                value={specs.season}
                onChange={(e) => handleInputChange('season', e.target.value)}
              >
                <option value="">指定なし</option>
                <option value="summer">夏タイヤ</option>
                <option value="winter">冬タイヤ</option>
                <option value="all_season">オールシーズン</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h3 className="font-semibold mb-3">💡 サイズの見つけ方</h3>
          <p className="text-sm text-gray-600 mb-3">
            タイヤの側面に「215/60R16 95H」のような表記があります
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 215: タイヤ幅（ミリメートル）</li>
            <li>• 60: 扁平率（パーセント）</li>
            <li>• R16: ラジアルタイヤでリム径16インチ</li>
            <li>• 95: 荷重指数（LI）</li>
            <li>• H: 速度記号（SS）</li>
          </ul>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleSearch}
            disabled={loading || !specs.width || !specs.aspect || !specs.rim}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <div className="spinner inline mr-2"></div>
                検索中...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                タイヤを検索
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualPage;