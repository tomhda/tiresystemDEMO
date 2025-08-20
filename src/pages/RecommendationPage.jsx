import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, ExternalLink, Star, Fuel, Volume2 } from 'lucide-react';

const RecommendationPage = () => {
  const navigate = useNavigate();
  const { recommendations, resetState } = useApp();

  if (!recommendations) {
    navigate('/upload');
    return null;
  }

  const handleStartOver = () => {
    resetState();
    navigate('/');
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
    <div className="container">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/review')} 
            className="btn btn-outline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </button>
          
          <h2 className="text-2xl font-bold mb-2">おすすめタイヤ</h2>
          <p className="text-gray-600 mb-4">
            お客様のタイヤ仕様に適合する商品を安全性を考慮して選びました
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <h3 className="font-semibold mb-2">検索条件</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">サイズ:</span>
                <span className="ml-1">{recommendations.user_specs.size}</span>
              </div>
              {recommendations.user_specs.li && (
                <div>
                  <span className="font-medium">LI:</span>
                  <span className="ml-1">{recommendations.user_specs.li}</span>
                </div>
              )}
              {recommendations.user_specs.ss && (
                <div>
                  <span className="font-medium">SS:</span>
                  <span className="ml-1">{recommendations.user_specs.ss}</span>
                </div>
              )}
              {recommendations.user_specs.season && (
                <div>
                  <span className="font-medium">季節:</span>
                  <span className="ml-1">
                    {recommendations.user_specs.season === 'summer' && '夏'}
                    {recommendations.user_specs.season === 'winter' && '冬'}
                    {recommendations.user_specs.season === 'all_season' && 'オール'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {recommendations.items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Star className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">該当する商品が見つかりませんでした</h3>
            <p className="text-gray-600 mb-6">
              検索条件を変更して再度お試しください
            </p>
            <button onClick={() => navigate('/review')} className="btn btn-primary">
              検索条件を変更
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 mb-8">
              {recommendations.items.map((tire, index) => (
                <div key={tire.sku || index} className="card hover:shadow-lg transition-shadow">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {tire.brand} {tire.pattern}
                          </h3>
                          <p className="text-lg text-gray-600">
                            {tire.size} {tire.li}{tire.ss}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStockStatusColor(tire.stock_status)}`}>
                          {getStockStatusText(tire.stock_status)}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center">
                          <Volume2 className="w-4 h-4 text-blue-600 mr-1" />
                          <span className="text-sm">静粛性</span>
                          <div className="flex ml-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < (tire.quiet_score || 3) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Fuel className="w-4 h-4 text-green-600 mr-1" />
                          <span className="text-sm">低燃費</span>
                          <div className="flex ml-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < (tire.eco_score || 3) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">
                        {tire.summary || 'バランスの取れた高性能タイヤです。'}
                      </p>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div className="text-right mb-4">
                        <p className="text-2xl font-bold text-blue-600">
                          ¥{tire.price?.toLocaleString() || '12,000'}
                        </p>
                        <p className="text-sm text-gray-500">1本あたり（税込）</p>
                      </div>

                      <div className="space-y-2">
                        <a
                          href={tire.product_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary w-full"
                          onClick={() => {
                            console.log('商品クリック:', tire.brand, tire.pattern);
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                          詳細・購入
                        </a>
                        
                        <p className="text-xs text-gray-500 text-center">
                          ※デモサイトです
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                全{recommendations.total_found}件の商品から安全性を考慮して選択
              </p>
              
              <div className="space-y-2">
                <button 
                  onClick={handleStartOver}
                  className="btn btn-outline"
                >
                  最初からやり直す
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecommendationPage;