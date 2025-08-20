import React, { useState, useRef } from 'react';
import { Upload, Camera, Image as ImageIcon, X } from 'lucide-react';

const ImageUpload = ({ onImageUpload, disabled = false }) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    // ファイル形式チェック
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      alert('JPEG、PNG、WEBP、HEIC形式の画像ファイルを選択してください。');
      return;
    }

    // ファイルサイズチェック（10MB制限）
    if (file.size > 10 * 1024 * 1024) {
      alert('ファイルサイズは10MB以下にしてください。');
      return;
    }

    // プレビュー表示
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // 親コンポーネントに通知
    onImageUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!preview ? (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="w-12 h-12 text-gray-400" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                タイヤの写真をアップロード
              </p>
              <p className="text-sm text-gray-500 mb-4">
                ドラッグ＆ドロップまたはクリックしてファイルを選択
              </p>
              
              <div className="flex justify-center gap-2 mb-4">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCameraClick();
                  }}
                  disabled={disabled}
                >
                  <Camera className="w-4 h-4" />
                  カメラで撮影
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={disabled}
                >
                  <ImageIcon className="w-4 h-4" />
                  ファイル選択
                </button>
              </div>
              
              <p className="text-xs text-gray-400">
                対応形式: JPEG, PNG, WEBP, HEIC (最大10MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
            <div className="relative">
              <img
                src={preview}
                alt="アップロード画像プレビュー"
                className="w-full h-64 object-contain rounded"
              />
              <button
                type="button"
                onClick={clearPreview}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">
                画像をアップロードしました
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 text-sm hover:underline"
                disabled={disabled}
              >
                別の画像を選択
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        capture="camera"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

export default ImageUpload;