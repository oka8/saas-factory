/**
 * 本番環境対応ロガーシステム
 * 開発環境ではconsoleに出力し、本番環境では外部サービスに送信
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel
  message: string
  meta?: Record<string, unknown>
  timestamp: string
  environment: string
}

class Logger {
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  private formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      meta,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
    }
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.isDevelopment) return

    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR']
    const consoleMethods = [console.debug, console.info, console.warn, console.error]
    
    const method = consoleMethods[entry.level] || console.log
    const levelName = levelNames[entry.level] || 'LOG'
    
    if (entry.meta) {
      method(`[${levelName}] ${entry.message}`, entry.meta)
    } else {
      method(`[${levelName}] ${entry.message}`)
    }
  }

  private logToExternalService(entry: LogEntry): void {
    // 本番環境では外部ログサービスに送信
    // 例: Vercel Analytics, Sentry, CloudWatch など
    if (this.isDevelopment) return

    try {
      // TODO: 外部ログサービスの実装
      // 例: fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) })
    } catch (error) {
      // ログ送信失敗時の処理（無限ループを避けるためconsole.errorは使わない）
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    const entry = this.formatMessage(LogLevel.DEBUG, message, meta)
    this.logToConsole(entry)
    this.logToExternalService(entry)
  }

  info(message: string, meta?: Record<string, unknown>): void {
    const entry = this.formatMessage(LogLevel.INFO, message, meta)
    this.logToConsole(entry)
    this.logToExternalService(entry)
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    const entry = this.formatMessage(LogLevel.WARN, message, meta)
    this.logToConsole(entry)
    this.logToExternalService(entry)
  }

  error(message: string, meta?: Record<string, unknown>): void {
    const entry = this.formatMessage(LogLevel.ERROR, message, meta)
    this.logToConsole(entry)
    this.logToExternalService(entry)
  }

  /**
   * セキュアログ - 機密情報をマスクして記録
   */
  secureLog(message: string, meta?: Record<string, unknown>): void {
    const safeMeta = meta ? this.sanitizeMeta(meta) : undefined
    this.info(message, safeMeta)
  }

  private sanitizeMeta(meta: Record<string, unknown>): Record<string, unknown> {
    const sensitive = ['password', 'token', 'apiKey', 'secret', 'auth']
    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(meta)) {
      const isSensitive = sensitive.some(s => key.toLowerCase().includes(s.toLowerCase()))
      sanitized[key] = isSensitive ? '[MASKED]' : value
    }

    return sanitized
  }
}

export const logger = new Logger()

/**
 * 開発専用ログ - 本番では何も出力しない
 */
export const devLog = {
  log: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] ${message}`, ...args)
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[DEV] ${message}`, ...args)
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[DEV] ${message}`, ...args)
    }
  }
}