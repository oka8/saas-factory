'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ - ADHD配慮：大きく明確 */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              SaaS Factory
            </span>
          </Link>

          {/* デスクトップナビゲーション - ADHD配慮：シンプルで明確 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/features" 
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              機能
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              料金
            </Link>
            <Link 
              href="/docs" 
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              ドキュメント
            </Link>
          </nav>

          {/* CTAボタン - ADHD配慮：高コントラスト、大きなタッチターゲット */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              ログイン
            </Link>
            <Link 
              href="/signup" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              無料で始める
            </Link>
          </div>

          {/* モバイルメニューボタン */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-expanded={isMenuOpen}
            aria-label="メインメニューを開く"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* モバイルメニュー - ADHD配慮：大きなタッチターゲット、明確な区切り */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/features" 
                className="text-gray-600 hover:text-blue-600 px-4 py-3 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:bg-gray-50"
              >
                機能
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-600 hover:text-blue-600 px-4 py-3 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:bg-gray-50"
              >
                料金
              </Link>
              <Link 
                href="/docs" 
                className="text-gray-600 hover:text-blue-600 px-4 py-3 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:bg-gray-50"
              >
                ドキュメント
              </Link>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Link 
                  href="/login" 
                  className="block text-gray-600 hover:text-gray-900 px-4 py-3 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:bg-gray-50"
                >
                  ログイン
                </Link>
                <Link 
                  href="/signup" 
                  className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 mt-2 mx-4 rounded-lg text-base font-medium text-center shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  無料で始める
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}