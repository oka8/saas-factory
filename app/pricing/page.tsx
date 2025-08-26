'use client'

import Link from 'next/link'

export default function PricingPage() {
  const plans = [
    {
      name: '無料プラン',
      price: '¥0',
      period: '月額',
      description: 'スタートアップや個人開発者向け',
      features: [
        '月1プロジェクト生成',
        '基本テンプレート利用',
        '標準サポート',
        'コミュニティアクセス',
        'Vercelデプロイ対応'
      ],
      limitations: [
        'カスタムテンプレート不可',
        'プレミアムサポートなし'
      ],
      buttonText: '無料で始める',
      buttonLink: '/auth/signup',
      popular: false
    },
    {
      name: 'スタータープラン',
      price: '¥3,000',
      period: '月額',
      description: '本格的な開発者向け',
      features: [
        '月5プロジェクト生成',
        '全テンプレート利用',
        '優先サポート',
        'カスタムテンプレート',
        '複数デプロイ対応',
        'GitHub連携',
        'チーム機能（3名まで）'
      ],
      limitations: [],
      buttonText: '14日間無料トライアル',
      buttonLink: '/auth/signup?plan=starter',
      popular: false
    },
    {
      name: 'プロプラン',
      price: '¥15,000',
      period: '月額',
      description: 'プロフェッショナル開発者向け',
      features: [
        '無制限プロジェクト生成',
        '全機能利用',
        '24時間サポート',
        '高度なカスタマイズ',
        'エンタープライズデプロイ',
        'API アクセス',
        '無制限チームメンバー',
        'ホワイトラベル対応'
      ],
      limitations: [],
      buttonText: '14日間無料トライアル',
      buttonLink: '/auth/signup?plan=pro',
      popular: true
    },
    {
      name: 'エンタープライズ',
      price: '¥30,000',
      period: '月額〜',
      description: '大企業・組織向け',
      features: [
        '全プロ機能',
        'オンプレミス対応',
        '専任サポート',
        'カスタム開発',
        'SLA保証',
        'セキュリティ監査',
        'トレーニング提供',
        '導入コンサルティング'
      ],
      limitations: [],
      buttonText: 'お問い合わせ',
      buttonLink: '/contact',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローセクション */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              シンプルで透明性の高い料金体系
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              スタートアップから大企業まで、あなたのニーズに合わせたプランをご用意。
              すべてのプランで14日間の無料トライアルをお試しいただけます。
            </p>
            <div className="flex justify-center items-center gap-4 mb-8">
              <Link
                href="/demo"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                まずはデモを試す →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 料金プランセクション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-sm border-2 hover:shadow-lg transition-shadow relative ${
                plan.popular ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  人気
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 ml-1">
                      /{plan.period}
                    </span>
                  </div>
                </div>

                <Link
                  href={plan.buttonLink}
                  className={`block w-full text-center px-4 py-3 rounded-lg font-medium transition-colors mb-6 ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {plan.buttonText}
                </Link>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 text-sm">
                    含まれる機能:
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <svg
                          className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <>
                      <h4 className="font-medium text-gray-900 text-sm mt-4">
                        制限事項:
                      </h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, limitationIndex) => (
                          <li
                            key={limitationIndex}
                            className="flex items-start gap-2 text-sm text-gray-500"
                          >
                            <svg
                              className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ セクション */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              よくある質問
            </h2>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                無料プランでできることは？
              </h3>
              <p className="text-gray-600">
                無料プランでは月1回まで、基本的なSaaSプロジェクトを生成できます。
                生成されたコードのダウンロードと、Vercelへのデプロイが可能です。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                プランの変更はいつでも可能ですか？
              </h3>
              <p className="text-gray-600">
                はい、いつでもプランの変更が可能です。アップグレードは即座に反映され、
                ダウングレードは次回の請求サイクルから適用されます。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                支払い方法は何が利用できますか？
              </h3>
              <p className="text-gray-600">
                クレジットカード（Visa、MasterCard、American Express）、
                デビットカード、およびPayPalがご利用いただけます。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                生成されたコードの著作権は？
              </h3>
              <p className="text-gray-600">
                生成されたすべてのコードの著作権は、お客様に帰属します。
                商用・非商用問わず、自由にご利用いただけます。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                サポートはどのような方法で提供されますか？
              </h3>
              <p className="text-gray-600">
                無料プランはコミュニティフォーラム、有料プランはメールサポート、
                プロプラン以上では優先サポートとチャットサポートを提供しています。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA セクション */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            今すぐ始めましょう
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            14日間の無料トライアルで、すべての機能をお試しください
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              無料トライアル開始
            </Link>
            <Link
              href="/demo"
              className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              デモを見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}