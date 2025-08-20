// OCR サービス - Google Vision API対応 + デモ用モック機能

export class OCRService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
    this.mode = import.meta.env.VITE_OCR_MODE || 'mock'; // 'cloud' | 'mock'
    this.debug = import.meta.env.VITE_DEBUG === 'true';
    
    if (this.debug) {
      console.log('OCR初期化:', { 
        mode: this.mode, 
        hasApiKey: !!this.apiKey 
      });
    }
  }

  // API設定
  configure(apiKey, mode = 'cloud') {
    this.apiKey = apiKey;
    this.mode = mode;
    
    if (this.debug) {
      console.log('OCR設定更新:', { 
        mode: this.mode, 
        hasApiKey: !!this.apiKey 
      });
    }
  }

  // 画像からテキスト抽出
  async extractText(imageFile) {
    try {
      if (this.mode === 'cloud' && this.apiKey) {
        return await this.cloudOCR(imageFile);
      } else {
        return await this.mockOCR(imageFile);
      }
    } catch (error) {
      console.error('OCR処理でエラーが発生:', error);
      
      // フォールバック: モック結果を返す
      return await this.mockOCR(imageFile);
    }
  }

  // Google Vision API OCR
  async cloudOCR(imageFile) {
    const base64Image = await this.fileToBase64(imageFile);
    
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image.split(',')[1] // data:image/jpeg;base64, の部分を除去
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION', // より精度の高いDOCUMENT_TEXT_DETECTIONを使用
              maxResults: 1
            }
          ],
          imageContext: {
            languageHints: ['ja', 'en'],
            // テキスト検出の改善設定
            textDetectionParams: {
              enableTextDetectionConfidenceScore: true
            }
          }
        }
      ]
    };

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Google Vision API エラー: ${response.status}`);
    }

    const data = await response.json();
    
    if (this.debug) {
      console.log('Google Vision API Response:', data);
    }

    // エラーチェック
    if (data.responses && data.responses[0] && data.responses[0].error) {
      throw new Error(`Google Vision API Error: ${data.responses[0].error.message}`);
    }
    
    const response0 = data.responses?.[0];
    
    // DOCUMENT_TEXT_DETECTIONの結果を優先的に使用
    if (response0?.fullTextAnnotation) {
      const fullText = response0.fullTextAnnotation.text || '';
      const confidence = response0.fullTextAnnotation.pages?.[0]?.confidence || 0.8;
      
      if (this.debug) {
        console.log('Document Text Detection結果:', { text: fullText, confidence });
      }
      
      return {
        text: fullText,
        confidence: confidence,
        raw: response0
      };
    }
    
    // フォールバック: TEXT_DETECTIONの結果
    if (response0?.textAnnotations && response0.textAnnotations.length > 0) {
      const fullText = response0.textAnnotations[0]?.description || '';
      const confidence = this.calculateConfidence(response0.textAnnotations);
      
      if (this.debug) {
        console.log('Text Detection結果:', { text: fullText, confidence });
      }
      
      return {
        text: fullText,
        confidence: confidence,
        raw: response0
      };
    }

    throw new Error('テキストが検出されませんでした');
  }

  // デモ用モックOCR（画像の種類に応じて異なる結果を返す）
  async mockOCR(imageFile) {
    // 少し遅延を入れてリアルっぽく
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const fileName = imageFile.name.toLowerCase();
    const fileSize = imageFile.size;

    // ファイル名やサイズに基づいて結果をバリエーション
    let mockResult;

    if (fileName.includes('sample') || fileName.includes('test')) {
      // サンプル画像用の結果
      mockResult = this.getSampleResults();
    } else if (fileSize < 100000) {
      // 小さいファイル = 低品質の可能性
      mockResult = this.getLowQualityResults();
    } else {
      // 通常の結果
      mockResult = this.getRandomMockResult();
    }

    return {
      text: mockResult.text,
      confidence: mockResult.confidence,
      raw: { mock: true, scenario: mockResult.scenario }
    };
  }

  // サンプル結果パターン
  getSampleResults() {
    const samples = [
      {
        text: "BRIDGESTONE\nREGNO GR-XIII\n205/55R16 91V\nSUMMER\nDOT 2023",
        confidence: 0.92,
        scenario: 'perfect_sample'
      },
      {
        text: "YOKOHAMA\nBluEarth-GT AE51\n215/60R16 95H\nM+S\nDOT 2024",
        confidence: 0.89,
        scenario: 'good_sample'
      },
      {
        text: "DUNLOP\nVEURO VE304\n225/55R17 97W\nSUMMER",
        confidence: 0.87,
        scenario: 'decent_sample'
      }
    ];

    return samples[Math.floor(Math.random() * samples.length)];
  }

  // 低品質結果パターン
  getLowQualityResults() {
    const lowQuality = [
      {
        text: "BRI_GEST_NE\nR_GNO\n205/55R16 9_V\nSUM_ER",
        confidence: 0.45,
        scenario: 'blurry_image'
      },
      {
        text: "YO_OHAMA\n__/60R16 __H",
        confidence: 0.38,
        scenario: 'partial_text'
      },
      {
        text: "2_5/55R__ 91_\nSU__ER",
        confidence: 0.42,
        scenario: 'damaged_text'
      }
    ];

    return lowQuality[Math.floor(Math.random() * lowQuality.length)];
  }

  // ランダムモック結果
  getRandomMockResult() {
    const mockResults = [
      {
        text: "TOYO TIRES\nPROXES CF2\n195/65R15 91H\nSUMMER\nDOT 2023",
        confidence: 0.88,
        scenario: 'toyo_tire'
      },
      {
        text: "MICHELIN\nENERGY SAVER 4\n205/55R16 91V\nDOT 2024",
        confidence: 0.91,
        scenario: 'michelin_tire'
      },
      {
        text: "Continental\nPremiumContact 6\n225/45R17 94Y\nSUMMER",
        confidence: 0.85,
        scenario: 'continental_tire'
      },
      {
        text: "Goodyear\nVector 4Seasons\n215/60R16 99V\nALL SEASON",
        confidence: 0.83,
        scenario: 'all_season_tire'
      },
      {
        text: "BRIDGESTONE\nBLIZZAK VRX3\n205/55R16 91Q\nM+S\n3PMSF",
        confidence: 0.90,
        scenario: 'winter_tire'
      }
    ];

    return mockResults[Math.floor(Math.random() * mockResults.length)];
  }

  // ファイルをBase64に変換
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 信頼度計算
  calculateConfidence(textAnnotations) {
    if (!textAnnotations || textAnnotations.length <= 1) return 0;

    const scores = textAnnotations.slice(1).map(annotation => 
      annotation.confidence || 0.8
    );

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  // OCR結果の前処理
  preprocessText(text) {
    return text
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
      .replace(/\s+/g, ' ')
      .trim();
  }

  // デバッグ用：現在の設定確認
  getStatus() {
    return {
      mode: this.mode,
      hasApiKey: !!this.apiKey,
      ready: this.mode === 'mock' || (this.mode === 'cloud' && !!this.apiKey)
    };
  }
}

// シングルトンインスタンス
export const ocrService = new OCRService();