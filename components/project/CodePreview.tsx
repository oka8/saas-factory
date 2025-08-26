'use client'

import { useState, useMemo } from 'react'
import { X, ChevronRight, ChevronDown, File, Folder, Copy, Download, Check } from 'lucide-react'

interface FileNode {
  path: string
  name: string
  type: 'file' | 'directory'
  content?: string
  children?: FileNode[]
}

interface CodePreviewProps {
  isOpen: boolean
  onClose: () => void
  fileStructure?: any[]
  generatedCode?: any
  projectTitle: string
  projectId?: string
}

export function CodePreview({ 
  isOpen, 
  onClose, 
  fileStructure = [], 
  generatedCode,
  projectTitle,
  projectId 
}: CodePreviewProps) {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [copiedPath, setCopiedPath] = useState<string | null>(null)

  // ファイル構造を整理
  const organizedFiles = useMemo(() => {
    const files: FileNode[] = []
    
    // fileStructureから変換
    if (fileStructure && fileStructure.length > 0) {
      fileStructure.forEach((item) => {
        if (item.type === 'file') {
          files.push({
            path: item.path,
            name: item.path.split('/').pop() || '',
            type: 'file',
            content: item.content || ''
          })
        }
      })
    }

    // generatedCodeから追加情報を取得
    if (generatedCode) {
      // database_schemaをSQLファイルとして追加
      if (generatedCode.database_schema) {
        files.push({
          path: 'database/schema.sql',
          name: 'schema.sql',
          type: 'file',
          content: generatedCode.database_schema
        })
      }

      // package.jsonを追加
      if (generatedCode.package_json) {
        files.push({
          path: 'package.json',
          name: 'package.json',
          type: 'file',
          content: JSON.stringify(generatedCode.package_json, null, 2)
        })
      }
    }

    // ディレクトリ構造を構築
    const root: FileNode = {
      path: '',
      name: projectTitle,
      type: 'directory',
      children: []
    }

    files.forEach(file => {
      const parts = file.path.split('/')
      let current = root
      
      for (let i = 0; i < parts.length - 1; i++) {
        const dirName = parts[i]
        let dir = current.children?.find(c => c.name === dirName && c.type === 'directory')
        
        if (!dir) {
          dir = {
            path: parts.slice(0, i + 1).join('/'),
            name: dirName,
            type: 'directory',
            children: []
          }
          current.children = current.children || []
          current.children.push(dir)
        }
        
        current = dir
      }
      
      current.children = current.children || []
      current.children.push(file)
    })

    return root.children || []
  }, [fileStructure, generatedCode, projectTitle])

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const handleCopy = async (content: string, path: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedPath(path)
      setTimeout(() => setCopiedPath(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = async () => {
    try {
      // プロジェクトIDを使用（propから取得、なければデフォルト）
      const downloadProjectId = projectId || 'demo-project-1'
      
      const response = await fetch(`/api/projects/${downloadProjectId}/download`)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${projectTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.tar`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const iconMap: Record<string, string> = {
      'tsx': '⚛️',
      'ts': '📘',
      'jsx': '⚛️',
      'js': '📜',
      'json': '📋',
      'sql': '🗃️',
      'css': '🎨',
      'md': '📝',
      'env': '🔐'
    }
    return iconMap[ext || ''] || '📄'
  }

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => {
      const isExpanded = expandedFolders.has(node.path)
      
      if (node.type === 'directory') {
        return (
          <div key={node.path}>
            <div
              className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onClick={() => toggleFolder(node.path)}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Folder className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
              <span className="text-sm">{node.name}</span>
            </div>
            {isExpanded && node.children && renderFileTree(node.children, level + 1)}
          </div>
        )
      }

      return (
        <div
          key={node.path}
          className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded ${
            selectedFile?.path === node.path ? 'bg-blue-100 dark:bg-blue-900' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => setSelectedFile(node)}
        >
          <span className="text-sm">{getFileIcon(node.name)}</span>
          <span className="text-sm">{node.name}</span>
        </div>
      )
    })
  }

  const renderCodeContent = () => {
    if (!selectedFile || selectedFile.type === 'directory') {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>ファイルを選択してください</p>
        </div>
      )
    }

    const language = selectedFile.name.split('.').pop() || 'text'
    
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <span>{getFileIcon(selectedFile.name)}</span>
            <span className="text-sm font-medium">{selectedFile.path}</span>
          </div>
          <button
            onClick={() => handleCopy(selectedFile.content || '', selectedFile.path)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {copiedPath === selectedFile.path ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-gray-900 dark:bg-black">
          <pre className="text-sm text-gray-300">
            <code>{selectedFile.content || '// Empty file'}</code>
          </pre>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">コードプレビュー - {projectTitle}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - File Tree */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 overflow-auto">
            <div className="p-2">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">
                ファイル構造
              </div>
              {organizedFiles.length > 0 ? (
                renderFileTree(organizedFiles)
              ) : (
                <div className="text-sm text-gray-500 px-2">
                  ファイルがありません
                </div>
              )}
            </div>
          </div>

          {/* Main - Code Display */}
          <div className="flex-1 overflow-hidden">
            {renderCodeContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500">
            {organizedFiles.length} フォルダ・ファイル
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              ダウンロード
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}