import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ブランド・説明 */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">SaaS Factory</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              テキストからSaaSアプリケーションを自動生成。<br />
              ADHD配慮の開発ワークフローで効率的なサービス構築を実現します。
            </p>
            <p className="text-xs text-gray-500">
              © 2024 SaaS Factory. All rights reserved.
            </p>
          </div>

          {/* プロダクト */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">プロダクト</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/features" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  機能一覧
                </Link>
              </li>
              <li>
                <Link 
                  href="/templates" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  テンプレート
                </Link>
              </li>
              <li>
                <Link 
                  href="/integrations" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  連携サービス
                </Link>
              </li>
              <li>
                <Link 
                  href="/roadmap" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  開発予定
                </Link>
              </li>
            </ul>
          </div>

          {/* サポート */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">サポート</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/docs" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  ドキュメント
                </Link>
              </li>
              <li>
                <Link 
                  href="/tutorials" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  チュートリアル
                </Link>
              </li>
              <li>
                <Link 
                  href="/community" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  コミュニティ
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 下部セクション */}
        <div className="border-t border-gray-200 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex space-x-6 mb-4 sm:mb-0">
            <Link 
              href="/privacy" 
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              プライバシーポリシー
            </Link>
            <Link 
              href="/terms" 
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              利用規約
            </Link>
            <Link 
              href="/accessibility" 
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              アクセシビリティ
            </Link>
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <span className="mr-2">Made with</span>
            <span className="text-red-500 mx-1">♡</span>
            <span>for ADHD developers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}