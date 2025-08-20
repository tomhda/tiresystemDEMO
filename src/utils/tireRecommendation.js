import Papa from 'papaparse';

export class TireRecommendationEngine {
  constructor() {
    this.tiresData = [];
    this.loaded = false;
    this.cacheExpiry = null;
    this.cacheTimeout = 10 * 60 * 1000; // 10分キャッシュ
    this.csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSE9zJ-UKPMwtt3eMYo4hCxZ_5hkZzCCrUpCZtERZDckafM7HcTu8d7Zfwch-0aBJois_rCOOMYHg0M/pub?output=csv';
  }

  // サイズ表記ゆれ吸収
  normalizeSize(s) {
    return String(s || '')
      .toUpperCase()
      .replace(/\s+/g, ''); // 空白を全部除去（"225/50 R 18" → "225/50R18"）
  }

  // GoogleスプレッドシートCSVデータの読み込み
  async loadTiresData() {
    // キャッシュチェック
    if (this.loaded && this.cacheExpiry && Date.now() < this.cacheExpiry) {
      return;
    }

    try {
      console.log('タイヤデータを取得中...', this.csvUrl);
      const response = await fetch(this.csvUrl);
      
      if (!response.ok) {
        throw new Error(`CSV取得失敗: ${response.status}`);
      }
      
      const csvText = await response.text();
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('CSV解析結果:', results.data.length, '件');
            
            // CSV列名をデバッグ出力
            if (results.data.length > 0) {
              console.log('利用可能なCSV列名:', Object.keys(results.data[0]));
            }
            
            this.tiresData = results.data.map(row => ({
              brand: row['ブランド'] || row.brand,
              pattern: row['モデル名'] || row.pattern,
              size_code: this.normalizeSize(row['タイヤサイズ'] || row.size_code),
              li: parseInt(row['荷重指数(LI)'] || row.li || '91'),
              ss: row['速度記号(SS)'] || row.ss || 'V',
              summary: row['商品説明'] || row.summary || '',
              product_url: row['商品ページURL'] || row.product_url || '',
              tags: row['特徴タグ'] || row.tags || '',
              // 価格・在庫・セール・オススメ情報を実際のCSV列から取得
              price: parseInt(row['価格'] || row.price || '12000'),
              stock_status: row['在庫'] || row.stock_status || 'high',
              sale_info: row['セール'] || row.sale_info || '',
              recommended: row['オススメ'] || row.recommended || '',
              // デモ用互換性のために残す
              price_demo: parseInt(row['価格'] || row.price || row.price_demo || '12000'),
              stock_demo: row['在庫'] || row.stock_status || row.stock_demo || 'high'
            }));
            
            this.loaded = true;
            this.cacheExpiry = Date.now() + this.cacheTimeout;
            console.log('タイヤデータ読み込み完了:', this.tiresData.length, '件');
            resolve();
          },
          error: (error) => {
            console.error('CSV解析エラー:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('タイヤデータの読み込みに失敗:', error);
      
      // キャッシュがあれば続行
      if (this.loaded) {
        console.log('キャッシュデータを使用します');
        return;
      }
      
      throw error;
    }
  }

  // 推薦ロジック実行
  async recommend(userSpecs) {
    await this.loadTiresData();

    const { size, li, ss, season } = userSpecs;

    if (!size) {
      throw new Error('タイヤサイズが必要です');
    }

    console.log('推薦検索:', {
      入力サイズ: size,
      正規化サイズ: this.normalizeSize(size),
      利用可能データ件数: this.tiresData.length
    });

    // データベースの先頭5件のサイズを確認
    console.log('データベースサンプル:', this.tiresData.slice(0, 5).map(t => ({
      サイズ: t.size_code,
      ブランド: t.brand,
      パターン: t.pattern,
      価格: t.price,
      在庫: t.stock_status,
      セール: t.sale_info,
      オススメ: t.recommended
    })));

    // フィルタリング段階
    const targetSizeNormalized = this.normalizeSize(size);
    let candidates = this.tiresData.filter((tire, index) => {
      const tireSizeNormalized = this.normalizeSize(tire.size_code);
      
      // デバッグ用：最初の3件を詳しく見る
      if (index < 3) {
        console.log(`タイヤ${index + 1}:`, {
          元サイズ: tire.size_code,
          正規化後: tireSizeNormalized,
          ターゲット: targetSizeNormalized,
          マッチ: tireSizeNormalized === targetSizeNormalized,
          ブランド: tire.brand
        });
      }
      
      // 必須一致: サイズ（正規化して比較）
      if (tireSizeNormalized !== targetSizeNormalized) return false;

      // 安全条件: LI・SSが現タイヤ以上のみ通過
      if (li && tire.li < li) return false;
      if (ss && this.getSpeedIndex(tire.ss) < this.getSpeedIndex(ss)) return false;

      return true;
    });

    console.log('サイズフィルタ後の候補件数:', candidates.length);
    if (candidates.length > 0) {
      if (candidates.length > 0) {
      console.log('マッチした候補詳細:', candidates.slice(0, 5).map(t => ({
        ブランド: t.brand,
        パターン: t.pattern,
        サイズ: t.size_code,
        オススメRaw: t.recommended,
        オススメ評価: t.recommended && t.recommended.trim() !== ''
      })));
    }
    }

    // 季節フィルタ（指定がある場合）
    if (season && season !== 'unknown') {
      candidates = candidates.filter(tire => {
        const tireSeason = this.detectSeasonFromTags(tire.tags);
        return tireSeason === season || tireSeason === 'all_season';
      });
    }

    // 並び替えロジック
    candidates.sort((a, b) => {
      // 1位: オススメ優先（「オススメ」列に値があるものを最優先）
      const aRecommended = String(a.recommended || '').trim().toLowerCase() === 'true';
      const bRecommended = String(b.recommended || '').trim().toLowerCase() === 'true';
      if (aRecommended !== bRecommended) {
        return bRecommended ? 1 : -1;
      }

      // 2位: 在庫優先（high > medium > low）
      const stockPriority = { high: 3, medium: 2, low: 1 };
      const stockDiff = stockPriority[b.stock_status || b.stock_demo] - stockPriority[a.stock_status || a.stock_demo];
      if (stockDiff !== 0) return stockDiff;

      // 3位: 季節合致優先
      if (season) {
        const aSeasonMatch = a.season === season ? 1 : 0;
        const bSeasonMatch = b.season === season ? 1 : 0;
        if (aSeasonMatch !== bSeasonMatch) return bSeasonMatch - aSeasonMatch;
      }

      // 4位: 静粛性優先
      const quietDiff = (b.quiet_score || 3) - (a.quiet_score || 3);
      if (quietDiff !== 0) return quietDiff;

      // 5位: 低燃費優先
      const ecoDiff = (b.eco_score || 3) - (a.eco_score || 3);
      if (ecoDiff !== 0) return ecoDiff;

      // 6位: 価格昇順
      const priceDiff = (a.price || a.price_demo) - (b.price || b.price_demo);
      if (priceDiff !== 0) return priceDiff;

      // 最後: 商品名昇順
      return a.pattern.localeCompare(b.pattern);
    });

    // 最大3件に制限
    const recommendations = candidates.slice(0, 3);

    // 結果フォーマット
    return {
      items: recommendations.map(tire => ({
        sku: tire.sku_id,
        brand: tire.brand,
        pattern: tire.pattern,
        size: tire.size_code,
        li: tire.li,
        ss: tire.ss,
        price: tire.price || tire.price_demo,
        season: tire.season,
        quiet_score: tire.quiet_score,
        eco_score: tire.eco_score,
        stock_status: tire.stock_status || tire.stock_demo,
        sale_info: tire.sale_info,
        recommended: tire.recommended,
        product_url: tire.product_url,
        summary: tire.summary
      })),
      total_found: candidates.length,
      user_specs: userSpecs
    };
  }

  // 特徴タグから季節を判定
  detectSeasonFromTags(tags = '') {
    const tagLower = tags.toLowerCase();
    
    if (tagLower.includes('winter') || tagLower.includes('snow') || tagLower.includes('ice')) {
      return 'winter';
    }
    if (tagLower.includes('all') || tagLower.includes('4season')) {
      return 'all_season';
    }
    
    return 'summer'; // デフォルト
  }

  // 速度記号の数値インデックス取得（比較用）
  getSpeedIndex(ss) {
    const speedMap = {
      'L': 1, 'M': 2, 'N': 3, 'P': 4, 'Q': 5, 'R': 6, 'S': 7, 'T': 8,
      'U': 9, 'H': 10, 'V': 11, 'W': 12, 'Y': 13, 'Z': 14, 'ZR': 15
    };
    return speedMap[ss] || 0;
  }

  // 安全チェック実行
  validateSafety(userSpecs, recommendation) {
    const warnings = [];

    // LI（荷重指数）チェック
    if (userSpecs.li && recommendation.li < userSpecs.li) {
      warnings.push({
        type: 'li_downgrade',
        message: `荷重指数が下がります（${userSpecs.li} → ${recommendation.li}）`
      });
    }

    // SS（速度記号）チェック
    if (userSpecs.ss && this.getSpeedIndex(recommendation.ss) < this.getSpeedIndex(userSpecs.ss)) {
      warnings.push({
        type: 'ss_downgrade',
        message: `速度記号が下がります（${userSpecs.ss} → ${recommendation.ss}）`
      });
    }

    return {
      safe: warnings.length === 0,
      warnings: warnings
    };
  }

  // 季節の適切性チェック
  checkSeasonalSuitability(season, currentMonth = new Date().getMonth() + 1) {
    const recommendations = [];

    if (season === 'summer' && (currentMonth >= 10 || currentMonth <= 3)) {
      recommendations.push({
        type: 'seasonal_warning',
        message: '冬期間です。スタッドレスタイヤまたはオールシーズンタイヤの検討をお勧めします。'
      });
    }

    if (season === 'winter' && currentMonth >= 4 && currentMonth <= 9) {
      recommendations.push({
        type: 'seasonal_info',
        message: '夏期間です。夏タイヤへの交換を検討してください。'
      });
    }

    return recommendations;
  }

  // デモ用モック推薦（OCR失敗時など）
  getMockRecommendations(fallbackSize = '205/55R16') {
    return this.recommend({
      size: fallbackSize,
      li: 91,
      ss: 'V',
      season: 'summer'
    });
  }
}

// シングルトンインスタンス
export const recommendationEngine = new TireRecommendationEngine();