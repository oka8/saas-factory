'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

// Monaco Editor types
declare global {
  interface Window {
    monaco: any
    MonacoEnvironment: any
  }
}

interface CodeFile {
  path: string
  content: string
  language: string
}

interface CodeEditorProps {
  files: CodeFile[]
  onFilesChange: (files: CodeFile[]) => void
  className?: string
  readOnly?: boolean
}

export default function CodeEditor({ 
  files, 
  onFilesChange, 
  className = '',
  readOnly = false 
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoEditorRef = useRef<any>(null)
  const [monaco, setMonaco] = useState<any>(null)
  const [activeFile, setActiveFile] = useState<string>(files[0]?.path || '')
  const [isLoading, setIsLoading] = useState(true)
  const { theme, resolvedTheme } = useTheme()

  // Monaco Editorを初期化
  useEffect(() => {
    let isCancelled = false

    const initMonaco = async () => {
      try {
        if (typeof window === 'undefined') return

        // Monaco Environment設定
        window.MonacoEnvironment = {
          getWorkerUrl: function (workerId: string, label: string) {
            return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
              self.MonacoEnvironment = {
                baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/'
              };
              importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/base/worker/workerMain.js');
            `)}`
          }
        }

        // Monaco Editorをロード
        if (!window.monaco) {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js'
          document.head.appendChild(script)

          await new Promise((resolve) => {
            script.onload = resolve
          })

          await new Promise((resolve) => {
            window.require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } })
            window.require(['vs/editor/editor.main'], resolve)
          })
        }

        if (isCancelled) return

        setMonaco(window.monaco)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading Monaco Editor:', error)
        setIsLoading(false)
      }
    }

    initMonaco()

    return () => {
      isCancelled = true
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose()
      }
    }
  }, [])

  // エディタを作成・更新
  useEffect(() => {
    if (!monaco || !editorRef.current || !activeFile) return

    const activeFileData = files.find(f => f.path === activeFile)
    if (!activeFileData) return

    // 既存のエディタを破棄
    if (monacoEditorRef.current) {
      monacoEditorRef.current.dispose()
    }

    // 新しいエディタを作成
    monacoEditorRef.current = monaco.editor.create(editorRef.current, {
      value: activeFileData.content,
      language: activeFileData.language,
      theme: resolvedTheme === 'dark' ? 'vs-dark' : 'vs-light',
      readOnly,
      automaticLayout: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      folding: true,
      bracketPairColorization: { enabled: true },
      quickSuggestions: true,
      parameterHints: { enabled: true },
      formatOnPaste: true,
      formatOnType: true
    })

    // 内容変更時のハンドラ
    const handleContentChange = () => {
      if (readOnly) return
      
      const newContent = monacoEditorRef.current.getValue()
      const updatedFiles = files.map(file =>
        file.path === activeFile
          ? { ...file, content: newContent }
          : file
      )
      onFilesChange(updatedFiles)
    }

    monacoEditorRef.current.onDidChangeModelContent(handleContentChange)

  }, [monaco, activeFile, files, resolvedTheme, readOnly, onFilesChange])

  // テーマ変更時にエディタのテーマを更新
  useEffect(() => {
    if (monaco && monacoEditorRef.current) {
      monaco.editor.setTheme(resolvedTheme === 'dark' ? 'vs-dark' : 'vs-light')
    }
  }, [monaco, resolvedTheme])

  const getFileIcon = (language: string) => {
    const iconMap: Record<string, string> = {
      javascript: '📄',
      typescript: '📘',
      jsx: '⚛️',
      tsx: '⚛️',
      html: '🌐',
      css: '🎨',
      json: '📋',
      markdown: '📝',
      python: '🐍',
      php: '🐘',
      java: '☕',
      cpp: '⚙️',
      c: '⚙️',
      go: '🐹',
      rust: '🦀',
      sql: '🗄️',
      xml: '📰',
      yaml: '📄',
      dockerfile: '🐳',
      shell: '🖥️'
    }
    return iconMap[language] || '📄'
  }

  const createNewFile = () => {
    const fileName = prompt('新しいファイル名を入力してください:')
    if (!fileName) return

    const extension = fileName.split('.').pop() || ''
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'jsx',
      ts: 'typescript',
      tsx: 'tsx',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      py: 'python',
      php: 'php',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rs: 'rust',
      sql: 'sql',
      xml: 'xml',
      yml: 'yaml',
      yaml: 'yaml'
    }

    const language = languageMap[extension] || 'plaintext'
    const newFile: CodeFile = {
      path: fileName,
      content: '',
      language
    }

    const updatedFiles = [...files, newFile]
    onFilesChange(updatedFiles)
    setActiveFile(fileName)
  }

  const deleteFile = (filePath: string) => {
    if (files.length <= 1) {
      alert('最低1つのファイルが必要です')
      return
    }

    if (!confirm(`${filePath} を削除してもよろしいですか？`)) return

    const updatedFiles = files.filter(f => f.path !== filePath)
    onFilesChange(updatedFiles)

    if (activeFile === filePath) {
      setActiveFile(updatedFiles[0]?.path || '')
    }
  }

  const formatCode = () => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current.getAction('editor.action.formatDocument').run()
    }
  }

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center h-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">コードエディタを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800`}>
      {/* ファイルタブとツールバー */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-4 py-2">
        <div className="flex items-center overflow-x-auto">
          {files.map((file) => (
            <button
              key={file.path}
              onClick={() => setActiveFile(file.path)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors whitespace-nowrap ${
                activeFile === file.path
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <span>{getFileIcon(file.language)}</span>
              <span>{file.path}</span>
              {!readOnly && files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteFile(file.path)
                  }}
                  className="ml-1 text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </button>
          ))}
        </div>
        
        {!readOnly && (
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={createNewFile}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
              title="新しいファイル"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button
              onClick={formatCode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
              title="コードを整形"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* エディタエリア */}
      <div className="flex-1 h-full">
        <div ref={editorRef} className="w-full h-full" />
      </div>

      {/* ステータスバー */}
      <div className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            {activeFile && (
              <>
                <span>{getFileIcon(files.find(f => f.path === activeFile)?.language || '')} {activeFile}</span>
                <span>{files.find(f => f.path === activeFile)?.language.toUpperCase()}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>UTF-8</span>
            <span>LF</span>
            {readOnly && <span className="text-orange-500">読み取り専用</span>}
          </div>
        </div>
      </div>
    </div>
  )
}