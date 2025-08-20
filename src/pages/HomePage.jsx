import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Upload, Edit3 } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="container">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">
            タイヤの写真を撮るだけで、最適なタイヤが見つかります
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            面倒な規格調べは不要。写真1枚で安全で最適なタイヤを推薦します。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/upload" className="card hover:shadow-lg transition-shadow">
            <div className="text-center p-4">
              <Camera className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">写真で検索</h3>
              <p className="text-gray-600">
                タイヤ側面の写真をアップロードして自動で仕様を読み取ります
              </p>
            </div>
          </Link>

          <Link to="/manual" className="card hover:shadow-lg transition-shadow">
            <div className="text-center p-4">
              <Edit3 className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold mb-2">サイズで検索</h3>
              <p className="text-gray-600">
                タイヤサイズを直接入力して検索します
              </p>
            </div>
          </Link>
        </div>

        <div className="card text-left">
          <h3 className="text-xl font-semibold mb-4">📸 撮影のコツ</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</span>
              <div>
                <strong>側面の文字が水平になるように</strong>
                <p className="text-gray-600 text-sm">タイヤサイズ（例：205/55R16）が読みやすく写るように角度を調整</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</span>
              <div>
                <strong>十分な明るさで撮影</strong>
                <p className="text-gray-600 text-sm">文字が影にならないよう、光を当てて撮影してください</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</span>
              <div>
                <strong>近づいてピントを合わせる</strong>
                <p className="text-gray-600 text-sm">文字がぼけないよう、しっかりとピントを合わせて撮影</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <Link 
            to="/upload" 
            className="btn btn-primary btn-lg"
          >
            <Upload className="w-5 h-5" />
            写真をアップロードして開始
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;