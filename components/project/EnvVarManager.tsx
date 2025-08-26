'use client'

import { useState } from 'react'
import { Plus, Trash2, Eye, EyeOff, Copy, Check } from 'lucide-react'

interface EnvVar {
  key: string
  value: string
  description?: string
}

interface EnvVarManagerProps {
  envVars: EnvVar[]
  onChange: (envVars: EnvVar[]) => void
  readonly?: boolean
}

export function EnvVarManager({ envVars, onChange, readonly = false }: EnvVarManagerProps) {
  const [showValues, setShowValues] = useState<{ [key: string]: boolean }>({})
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const addEnvVar = () => {
    const newEnvVar: EnvVar = {
      key: '',
      value: '',
      description: ''
    }
    onChange([...envVars, newEnvVar])
  }

  const updateEnvVar = (index: number, field: keyof EnvVar, value: string) => {
    const updated = envVars.map((env, i) => 
      i === index ? { ...env, [field]: value } : env
    )
    onChange(updated)
  }

  const removeEnvVar = (index: number) => {
    const updated = envVars.filter((_, i) => i !== index)
    onChange(updated)
  }

  const toggleShowValue = (key: string) => {
    setShowValues(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const copyValue = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // デフォルトの環境変数テンプレート
  const defaultEnvVars: EnvVar[] = [
    {
      key: 'DATABASE_URL',
      value: '',
      description: 'データベース接続URL'
    },
    {
      key: 'NEXTAUTH_URL',
      value: 'https://your-app.vercel.app',
      description: 'アプリケーションのベースURL'
    },
    {
      key: 'NEXTAUTH_SECRET',
      value: '',
      description: 'NextAuth.js認証シークレット'
    },
    {
      key: 'API_KEY',
      value: '',
      description: 'API キー（必要に応じて）'
    }
  ]

  const loadDefaults = () => {
    onChange([...envVars, ...defaultEnvVars.filter(defaultVar => 
      !envVars.some(env => env.key === defaultVar.key)
    )])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">環境変数</h4>
        {!readonly && (
          <div className="flex gap-2">
            <button
              onClick={loadDefaults}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              デフォルトを追加
            </button>
            <button
              onClick={addEnvVar}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              追加
            </button>
          </div>
        )}
      </div>

      {envVars.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-gray-500 text-sm">環境変数が設定されていません</p>
          {!readonly && (
            <button
              onClick={loadDefaults}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              デフォルトの環境変数を追加
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {envVars.map((envVar, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Key */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    変数名
                  </label>
                  {readonly ? (
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border text-sm font-mono">
                      {envVar.key}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={envVar.key}
                      onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                      placeholder="VARIABLE_NAME"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono bg-white dark:bg-gray-800"
                    />
                  )}
                </div>

                {/* Value */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    値
                  </label>
                  <div className="relative">
                    {readonly ? (
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border text-sm font-mono flex-1">
                          {showValues[envVar.key] ? envVar.value : '••••••••••••'}
                        </div>
                        <button
                          onClick={() => toggleShowValue(envVar.key)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {showValues[envVar.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyValue(envVar.value, envVar.key)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {copiedKey === envVar.key ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type={showValues[envVar.key] ? "text" : "password"}
                          value={envVar.value}
                          onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                          placeholder="値を入力"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono bg-white dark:bg-gray-800"
                        />
                        <button
                          onClick={() => toggleShowValue(envVar.key)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {showValues[envVar.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  説明（オプション）
                </label>
                {readonly ? (
                  envVar.description && (
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border text-sm">
                      {envVar.description}
                    </div>
                  )
                ) : (
                  <input
                    type="text"
                    value={envVar.description || ''}
                    onChange={(e) => updateEnvVar(index, 'description', e.target.value)}
                    placeholder="この環境変数の説明"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
                  />
                )}
              </div>

              {!readonly && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => removeEnvVar(index)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!readonly && envVars.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 ヒント: 本番環境では機密情報（API キー、パスワードなど）を環境変数として設定してください。
          </p>
        </div>
      )}
    </div>
  )
}