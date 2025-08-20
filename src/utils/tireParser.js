// タイヤ仕様パーサー - 要件定義書の正規表現に基づく決定論的解析

export class TireSpecParser {
  constructor() {
    // タイヤサイズの正規表現パターン
    this.patterns = {
      size: /\b(\d{3})\/(\d{2})R?(\d{2})\b/g,
      li: /\b(\d{2,3})\b/g,
      ss: /\b([ABCDEFGHJKLMNPQRSTUVWXYZ]{1,2})\b/g,
      season: {
        winter: /(3PMSF|M\+S|WINTER|SNOW|ICE|BLIZZAK|WINTER\s*MAXX)/i,
        allSeason: /(ALL\s*SEASON|4\s*SEASON|VECTOR)/i,
        summer: /(SUMMER)/i
      }
    };

    // 有効なLI（荷重指数）範囲
    this.validLI = new Set();
    for (let i = 60; i <= 120; i++) {
      this.validLI.add(i);
    }

    // 有効なSS（速度記号）
    this.validSS = new Set([
      'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'H', 'V', 'W', 'Y', 'Z',
      'ZR'
    ]);

    // ブランド名辞書（部分一致）
    this.brands = [
      'ブリヂストン', 'BRIDGESTONE', 'ヨコハマ', 'YOKOHAMA', 'ダンロップ', 'DUNLOP',
      'トーヨー', 'TOYO', 'ミシュラン', 'MICHELIN', 'ピレリ', 'PIRELLI',
      'グッドイヤー', 'GOODYEAR', 'コンチネンタル', 'CONTINENTAL', 'ハンコック', 'HANKOOK',
      'ファルケン', 'FALKEN', 'クムホ', 'KUMHO', 'ネクセン', 'NEXEN'
    ];

    // パターン名辞書（例）
    this.patterns_names = [
      'REGNO', 'POTENZA', 'ECOPIA', 'BLIZZAK', 'BluEarth', 'ADVAN', 'GEOLANDAR',
      'VEURO', 'LEMANS', 'MAXXIS', 'PROXES', 'TRANPATH', 'ENERGY SAVER', 'PILOT',
      'CINTURATO', 'P ZERO', 'EAGLE', 'EFFICIENTGRIP', 'ContiPremiumContact',
      'Ventus', 'ZIEX', 'AZENIS'
    ];
  }

  // メイン解析関数
  parse(text, confidence = {}) {
    const cleanText = text.toUpperCase().replace(/[０-９]/g, (s) => 
      String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
    );

    console.log('パーサー入力テキスト:', text);
    console.log('クリーン後テキスト:', cleanText);

    const result = {
      size: null,
      li: null,
      ss: null,
      season: null,
      brand: null,
      pattern: null,
      confidence: {
        size: 0,
        li: 0,
        ss: 0,
        season: 0,
        brand: 0,
        pattern: 0
      }
    };

    // サイズ解析（最優先）
    const sizeMatch = this.extractSize(cleanText);
    if (sizeMatch) {
      result.size = sizeMatch.size;
      result.confidence.size = sizeMatch.confidence;
    }

    // LI（荷重指数）解析
    const liMatch = this.extractLI(cleanText);
    if (liMatch) {
      result.li = liMatch.li;
      result.confidence.li = liMatch.confidence;
    }

    // SS（速度記号）解析
    const ssMatch = this.extractSS(cleanText);
    if (ssMatch) {
      result.ss = ssMatch.ss;
      result.confidence.ss = ssMatch.confidence;
    }

    // 季節マーク解析
    const seasonMatch = this.extractSeason(cleanText);
    if (seasonMatch) {
      result.season = seasonMatch.season;
      result.confidence.season = seasonMatch.confidence;
    }

    // ブランド解析
    const brandMatch = this.extractBrand(cleanText);
    if (brandMatch) {
      result.brand = brandMatch.brand;
      result.confidence.brand = brandMatch.confidence;
    }

    // パターン解析
    const patternMatch = this.extractPattern(cleanText);
    if (patternMatch) {
      result.pattern = patternMatch.pattern;
      result.confidence.pattern = patternMatch.confidence;
    }

    console.log('パース最終結果:', result);
    return result;
  }

  // サイズ抽出（例: 205/55R16）
  extractSize(text) {
    // より柔軟な正規表現パターンを試す
    const patterns = [
      /(\d{3})\/(\d{2})\s*R\s*(\d{2})/g,     // 基本パターン（スペース許容）
      /(\d{3})\s*\/\s*(\d{2})\s*R\s*(\d{2})/g, // 完全スペース許容
      /(\d{3})\s*-\s*(\d{2})\s*R\s*(\d{2})/g,  // ハイフン
      /(\d{3})\s+(\d{2})\s+R\s+(\d{2})/g,      // 全部スペース
    ];

    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      console.log(`パターン ${pattern} でのマッチ:`, matches);
      
      for (const match of matches) {
        const width = parseInt(match[1]);
        const aspect = parseInt(match[2]);
        const rim = parseInt(match[3]);

        // 妥当性チェック
        if (width >= 125 && width <= 355 && 
            aspect >= 25 && aspect <= 85 && 
            rim >= 10 && rim <= 24) {
          
          const result = {
            size: `${width}/${aspect}R${rim}`,
            confidence: 0.95
          };
          console.log('サイズ抽出成功:', result);
          return result;
        }
      }
    }

    console.log('サイズ抽出失敗');
    return null;
  }

  // LI（荷重指数）抽出
  extractLI(text) {
    // タイヤサイズの後に続く数字を優先的に抽出
    const sizePattern = /(\d{3}\/\d{2}R?\d{2})\s*(\d{2,3})/g;
    const sizeWithLI = [...text.matchAll(sizePattern)];
    
    console.log('サイズ+LI パターンマッチ:', sizeWithLI);
    
    for (const match of sizeWithLI) {
      const li = parseInt(match[2]);
      if (this.validLI.has(li)) {
        console.log('LI抽出成功 (サイズ後):', li);
        return {
          li: li,
          confidence: 0.9
        };
      }
    }

    // 通常のLI抽出（2〜3桁の数字）
    const liPattern = /\b(\d{2,3})\b/g;
    const matches = [...text.matchAll(liPattern)];
    const candidates = [];

    for (const match of matches) {
      const li = parseInt(match[1]);
      if (this.validLI.has(li)) {
        candidates.push({
          li: li,
          confidence: 0.7,
          position: match.index
        });
      }
    }

    if (candidates.length > 0) {
      console.log('LI抽出成功 (通常):', candidates[0].li);
      return candidates[0];
    }

    console.log('LI抽出失敗');
    return null;
  }

  // SS（速度記号）抽出
  extractSS(text) {
    // LIの後に続くアルファベットを優先的に抽出
    const liWithSSPattern = /(\d{2,3})\s*([ABCDEFGHJKLMNPQRSTUVWXYZ]{1,2})/g;
    const liWithSS = [...text.matchAll(liWithSSPattern)];
    
    console.log('LI+SS パターンマッチ:', liWithSS);
    
    for (const match of liWithSS) {
      const li = parseInt(match[1]);
      const ss = match[2];
      
      if (this.validLI.has(li) && this.validSS.has(ss)) {
        console.log('SS抽出成功 (LI後):', ss);
        return {
          ss: ss,
          confidence: 0.9
        };
      }
    }

    // 通常のSS抽出
    const ssPattern = /\b([ABCDEFGHJKLMNPQRSTUVWXYZ]{1,2})\b/g;
    const matches = [...text.matchAll(ssPattern)];

    for (const match of matches) {
      const ss = match[1];
      if (this.validSS.has(ss)) {
        // よくある速度記号を優先
        const commonSS = ['H', 'V', 'W', 'T', 'Y'];
        const confidence = commonSS.includes(ss) ? 0.8 : 0.6;
        
        console.log('SS抽出成功 (通常):', ss);
        return {
          ss: ss,
          confidence: confidence
        };
      }
    }

    console.log('SS抽出失敗');
    return null;
  }

  // 季節マーク抽出
  extractSeason(text) {
    if (this.patterns.season.winter.test(text)) {
      return { season: 'winter', confidence: 0.9 };
    }
    if (this.patterns.season.allSeason.test(text)) {
      return { season: 'all_season', confidence: 0.9 };
    }
    if (this.patterns.season.summer.test(text)) {
      return { season: 'summer', confidence: 0.8 };
    }

    // デフォルトは夏タイヤと推定（信頼度低め）
    return { season: 'summer', confidence: 0.3 };
  }

  // ブランド抽出
  extractBrand(text) {
    for (const brand of this.brands) {
      if (text.includes(brand.toUpperCase())) {
        return {
          brand: brand,
          confidence: 0.8
        };
      }
    }

    return null;
  }

  // パターン名抽出
  extractPattern(text) {
    for (const pattern of this.patterns_names) {
      if (text.includes(pattern.toUpperCase())) {
        return {
          pattern: pattern,
          confidence: 0.7
        };
      }
    }

    return null;
  }

  // 候補生成（不鮮明時の補完）
  generateCandidates(partialResult) {
    const candidates = [];

    // サイズが不明の場合の一般的なサイズ候補
    if (!partialResult.size) {
      const commonSizes = [
        '205/55R16', '215/60R16', '225/55R17', '195/65R15', '215/45R17'
      ];
      
      for (const size of commonSizes) {
        candidates.push({
          ...partialResult,
          size: size,
          confidence: { ...partialResult.confidence, size: 0.3 }
        });
      }
    }

    // LIが不明の場合
    if (!partialResult.li && partialResult.size) {
      const commonLI = [91, 92, 94, 96, 98]; // 乗用車一般的なLI
      
      for (const li of commonLI) {
        candidates.push({
          ...partialResult,
          li: li,
          confidence: { ...partialResult.confidence, li: 0.4 }
        });
      }
    }

    // SSが不明の場合
    if (!partialResult.ss) {
      const commonSS = ['H', 'V', 'W', 'T']; // 一般的なSS
      
      for (const ss of commonSS) {
        candidates.push({
          ...partialResult,
          ss: ss,
          confidence: { ...partialResult.confidence, ss: 0.4 }
        });
      }
    }

    return candidates.slice(0, 3); // 最大3件
  }

  // 妥当性検証
  validate(specs) {
    const errors = [];

    if (!specs.size) {
      errors.push('タイヤサイズが必要です');
    }

    if (specs.li && !this.validLI.has(specs.li)) {
      errors.push('無効な荷重指数です');
    }

    if (specs.ss && !this.validSS.has(specs.ss)) {
      errors.push('無効な速度記号です');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
}

// シングルトンインスタンス
export const tireParser = new TireSpecParser();