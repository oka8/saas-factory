import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* ヒーローセクション - ADHD配慮：明確なフォーカス、シンプルな構造 */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* メイン見出し - 大きく、明確に */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="text-blue-600">アイディア</span>から
            <br />
            <span className="text-purple-600">SaaS</span>を自動生成
          </h1>
          
          {/* サブタイトル - 簡潔で理解しやすく */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            テキストで記述したアイディアを、完動するSaaSアプリケーションに変換。
            <br className="hidden sm:block" />
            ADHD配慮の開発ワークフローで効率的なサービス構築を実現します。
          </p>

          {/* CTA - 高コントラスト、大きなボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link 
              href="/auth/signup" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 min-w-[200px]"
            >
              無料で始める
            </Link>
            <Link 
              href="/demo" 
              className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-offset-2 min-w-[200px]"
            >
              デモを見る
            </Link>
          </div>

          {/* 信頼性表示 */}
          <p className="text-sm text-gray-500 mb-8">
            ✨ クレジットカード不要 • 🚀 30秒でセットアップ完了 • 🎯 ADHD配慮設計
          </p>
        </div>
      </section>

      {/* 特徴セクション - 3つの主要機能を明確に */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              なぜSaaS Factoryなのか？
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              従来の開発課題を解決し、個人開発者が効率的にSaaSを構築できる環境を提供
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* 特徴1: テキスト入力 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                シンプルなテキスト入力
              </h3>
              <p className="text-gray-600 leading-relaxed">
                アイディアを自然な日本語で記述するだけ。複雑な設計書やワイヤーフレームは不要です。
              </p>
            </div>

            {/* 特徴2: 自動生成 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                AI自動生成
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Claude AIとClaude Codeを活用し、フロントエンド・バックエンド・データベースを自動構築。
              </p>
            </div>

            {/* 特徴3: ADHD配慮 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ADHD配慮設計
              </h3>
              <p className="text-gray-600 leading-relaxed">
                25分フォーカスセッション、視覚的進捗表示、認知負荷軽減で持続可能な開発を実現。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 料金セクション - シンプルで明確 */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            シンプルな料金体系
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            小さく始めて、成長に合わせてスケール
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 無料プラン */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">無料</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">¥0</div>
              <p className="text-sm text-gray-600 mb-4">月1プロジェクト</p>
              <Link href="/auth/signup" className="block bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors">
                始める
              </Link>
            </div>

            {/* スタータープラン */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">スターター</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">¥3,000</div>
              <p className="text-sm text-gray-600 mb-4">月5プロジェクト</p>
              <Link href="/auth/signup" className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                選択
              </Link>
            </div>

            {/* プロプラン */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-500 hover:shadow-md transition-shadow relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                人気
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">プロ</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">¥15,000</div>
              <p className="text-sm text-gray-600 mb-4">無制限</p>
              <Link href="/auth/signup" className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                選択
              </Link>
            </div>

            {/* エンタープライズ */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">エンタープライズ</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">¥30,000</div>
              <p className="text-sm text-gray-600 mb-4">チーム機能</p>
              <Link href="/contact" className="block bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors">
                相談
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 最終CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            今すぐSaaS構築を始めましょう
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            アイディアがあるなら、それをSaaSにする時です。
            無料で始めて、最初のプロジェクトを30秒で作成。
          </p>
          <Link 
            href="/auth/signup" 
            className="inline-block bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
          >
            無料アカウントを作成
          </Link>
        </div>
      </section>
    </>
  );
}
