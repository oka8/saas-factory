'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectTitle: string
  currentShareSettings?: {
    is_public: boolean
    share_token: string | null
    allowed_emails: string[]
  }
}

export default function ShareModal({ 
  isOpen, 
  onClose, 
  projectId, 
  projectTitle,
  currentShareSettings 
}: ShareModalProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const { showToast, Toast } = useToast()
  
  const [isPublic, setIsPublic] = useState(currentShareSettings?.is_public || false)
  const [allowedEmails, setAllowedEmails] = useState<string[]>(currentShareSettings?.allowed_emails || [])
  const [newEmail, setNewEmail] = useState('')
  const [shareToken, setShareToken] = useState(currentShareSettings?.share_token || '')
  const [loading, setSaving] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  if (!isOpen) return null

  const generateShareUrl = () => {
    if (!shareToken) return ''
    return `${window.location.origin}/shared/${shareToken}`
  }

  const handleGenerateToken = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      // 新しい共有トークンを生成
      const newToken = `share_${projectId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const { error } = await supabase
        .from('project_shares')
        .upsert({
          project_id: projectId,
          user_id: user.id,
          share_token: newToken,
          is_public: isPublic,
          allowed_emails: allowedEmails,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setShareToken(newToken)
      showToast('共有リンクを生成しました', 'success')
    } catch (error: any) {
      console.error('Error generating share token:', error)
      showToast('共有リンクの生成に失敗しました', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!user || !shareToken) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('project_shares')
        .update({
          is_public: isPublic,
          allowed_emails: allowedEmails,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .eq('user_id', user.id)

      if (error) throw error

      showToast('共有設定を更新しました', 'success')
      onClose()
    } catch (error: any) {
      console.error('Error updating share settings:', error)
      showToast('共有設定の更新に失敗しました', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleRevokeAccess = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('project_shares')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id)

      if (error) throw error

      setShareToken('')
      setIsPublic(false)
      setAllowedEmails([])
      showToast('共有アクセスを取り消しました', 'success')
    } catch (error: any) {
      console.error('Error revoking access:', error)
      showToast('アクセス取り消しに失敗しました', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyLink = async () => {
    const shareUrl = generateShareUrl()
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      showToast('リンクをクリップボードにコピーしました', 'success')
      setTimeout(() => setCopySuccess(false), 3000)
    } catch (error) {
      showToast('リンクのコピーに失敗しました', 'error')
    }
  }

  const handleAddEmail = () => {
    if (!newEmail || !newEmail.includes('@')) {
      showToast('有効なメールアドレスを入力してください', 'error')
      return
    }
    
    if (allowedEmails.includes(newEmail)) {
      showToast('このメールアドレスは既に追加されています', 'error')
      return
    }
    
    setAllowedEmails([...allowedEmails, newEmail])
    setNewEmail('')
  }

  const handleRemoveEmail = (email: string) => {
    setAllowedEmails(allowedEmails.filter(e => e !== email))
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* オーバーレイ */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* モーダルコンテンツ */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                プロジェクトを共有
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                {projectTitle}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                他のユーザーとプロジェクトを共有して、閲覧や共同編集を可能にします。
              </p>
            </div>

            {/* 共有リンクセクション */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">共有リンク</h4>
                {!shareToken && (
                  <button
                    onClick={handleGenerateToken}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? <LoadingSpinner size="sm" color="white" /> : 'リンク生成'}
                  </button>
                )}
              </div>

              {shareToken && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generateShareUrl()}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {copySuccess ? '✓' : 'コピー'}
                    </button>
                  </div>

                  {/* 公開設定 */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
                      パブリック（リンクを知っている人は誰でもアクセス可能）
                    </label>
                  </div>

                  {/* プライベート共有設定 */}
                  {!isPublic && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        許可されたメールアドレス
                      </h5>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="example@email.com"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                          />
                          <button
                            onClick={handleAddEmail}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            追加
                          </button>
                        </div>
                        
                        {allowedEmails.length > 0 && (
                          <div className="space-y-1">
                            {allowedEmails.map((email, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                                <span className="text-sm text-gray-700 dark:text-gray-300">{email}</span>
                                <button
                                  onClick={() => handleRemoveEmail(email)}
                                  className="text-red-600 hover:text-red-700 text-sm"
                                >
                                  削除
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* アクションボタン */}
            <div className="flex justify-between">
              <div>
                {shareToken && (
                  <button
                    onClick={handleRevokeAccess}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    共有を停止
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  キャンセル
                </button>
                {shareToken && (
                  <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? <LoadingSpinner size="sm" color="white" /> : '設定を保存'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast />
    </div>
  )
}