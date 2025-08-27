# SaaS Factory - テスト環境構築ガイド 🧪

このドキュメントでは、SaaS Factoryプロジェクトのテスト環境を構築するための手順と設定を説明します。

## 📋 現在の状況

**⚠️ 現在、テスト環境は未実装です。** このガイドに従って、包括的なテスト戦略を構築してください。

## 🎯 テスト戦略

### テストピラミッド
```
         E2E Tests (少数)
    ┌─────────────────────┐
    │  Integration Tests  │
    │     (中程度)       │
    └─────────────────────┘
   ┌─────────────────────────┐
   │      Unit Tests         │
   │       (多数)           │
   └─────────────────────────┘
```

## 🛠️ テストフレームワークの設定

### 1. Jest + Testing Library（推奨）

**インストール**:
```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest ts-jest
```

**jest.config.js**:
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.jsアプリのパス
  dir: './',
})

// カスタムJest設定
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '<rootDir>/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/**/*.(test|spec).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  }
}

module.exports = createJestConfig(customJestConfig)
```

**jest.setup.js**:
```javascript
import '@testing-library/jest-dom'

// Supabase client のモック
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  }))
}))

// Next.js router のモック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
```

### 2. Vitest（代替案）

**インストール**:
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

**vitest.config.ts**:
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

## 📁 テストディレクトリ構造

```
saas-factory/
├── __tests__/                 # グローバルテスト
├── app/
│   ├── __tests__/            # アプリ固有のテスト
│   ├── auth/
│   │   ├── __tests__/        # 認証関連テスト
│   │   └── login/
│   │       └── page.test.tsx
│   └── dashboard/
│       ├── __tests__/
│       └── page.test.tsx
├── components/
│   ├── __tests__/            # コンポーネントテスト
│   ├── ui/
│   │   ├── Button.test.tsx
│   │   └── LoadingSpinner.test.tsx
│   └── layout/
│       ├── Header.test.tsx
│       └── Footer.test.tsx
├── lib/
│   ├── __tests__/            # ユーティリティテスト
│   ├── auth.test.ts
│   ├── supabase/
│   │   └── client.test.ts
│   └── utils.test.ts
├── e2e/                      # E2Eテスト
│   ├── auth.spec.ts
│   ├── dashboard.spec.ts
│   └── project-creation.spec.ts
└── test/                     # テスト設定・ヘルパー
    ├── setup.ts
    ├── mocks/
    └── fixtures/
```

## 🧪 テストタイプ別実装例

### 1. Unit Tests（単体テスト）

**コンポーネントテスト例**:
```typescript
// components/__tests__/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../ui/Button'

describe('Button', () => {
  it('テキストが正しく表示される', () => {
    render(<Button>クリック</Button>)
    expect(screen.getByText('クリック')).toBeInTheDocument()
  })

  it('クリックイベントが発火される', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>クリック</Button>)
    
    fireEvent.click(screen.getByText('クリック'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabledの時はクリックできない', () => {
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>クリック</Button>)
    
    fireEvent.click(screen.getByText('クリック'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
```

**ユーティリティテスト例**:
```typescript
// lib/__tests__/auth.test.ts
import { validateEmail, generatePassword } from '../utils/auth'

describe('Auth Utils', () => {
  describe('validateEmail', () => {
    it('有効なメールアドレスでtrueを返す', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.jp')).toBe(true)
    })

    it('無効なメールアドレスでfalseを返す', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
    })
  })

  describe('generatePassword', () => {
    it('指定された長さのパスワードを生成する', () => {
      const password = generatePassword(12)
      expect(password).toHaveLength(12)
    })

    it('英数字と記号が含まれる', () => {
      const password = generatePassword(16)
      expect(password).toMatch(/[a-zA-Z]/)
      expect(password).toMatch(/[0-9]/)
      expect(password).toMatch(/[!@#$%^&*]/)
    })
  })
})
```

### 2. Integration Tests（統合テスト）

**認証フロー統合テスト**:
```typescript
// app/auth/__tests__/auth-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider } from '@/lib/auth-context'
import LoginPage from '../login/page'

// Supabaseクライアントのモック
const mockSignIn = jest.fn()
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignIn
    }
  })
}))

describe('認証フロー統合テスト', () => {
  beforeEach(() => {
    mockSignIn.mockClear()
  })

  it('正常なログインフローが動作する', async () => {
    mockSignIn.mockResolvedValueOnce({ 
      data: { user: { id: '1', email: 'test@example.com' } },
      error: null 
    })

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    )

    // フォーム入力
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' }
    })

    // ログインボタンクリック
    fireEvent.click(screen.getByText('ログイン'))

    // API呼び出し確認
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('エラーハンドリングが正しく動作する', async () => {
    mockSignIn.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid credentials' }
    })

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    )

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'wrong@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrongpassword' }
    })

    fireEvent.click(screen.getByText('ログイン'))

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/)).toBeInTheDocument()
    })
  })
})
```

### 3. E2E Tests（エンドツーエンドテスト）

**Playwright設定**:
```bash
npm install -D @playwright/test
npx playwright install
```

**playwright.config.ts**:
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**E2Eテスト例**:
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('認証フロー', () => {
  test('ログインページが正常に表示される', async ({ page }) => {
    await page.goto('/auth/login')
    
    await expect(page.getByText('おかえりなさい')).toBeVisible()
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
  })

  test('バリデーションエラーが表示される', async ({ page }) => {
    await page.goto('/auth/login')
    
    // 空のフォーム送信
    await page.getByText('ログイン').click()
    
    // HTML5バリデーションが動作することを確認
    const emailField = page.getByPlaceholder('you@example.com')
    await expect(emailField).toHaveAttribute('required')
  })

  test('サインアップページへの遷移', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.getByText('新規登録').click()
    await expect(page).toHaveURL('/auth/signup')
    await expect(page.getByText('アカウント作成')).toBeVisible()
  })
})
```

## 🔧 テスト環境の設定

### 環境変数（テスト用）

**.env.test**:
```env
NODE_ENV=test

# テスト用Supabase設定
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
SUPABASE_SERVICE_ROLE_KEY=test-service-role-key

# テスト用Claude API
ANTHROPIC_API_KEY=test-api-key

# テスト用アプリ設定
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=test-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### CI/CD統合

**.github/workflows/test.yml**:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test
      
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
```

### Package.jsonスクリプト

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

## 📊 テストカバレッジ目標

### 最低限の目標
- **Unit Tests**: 70%以上
- **Integration Tests**: 主要フロー（認証、プロジェクト作成）
- **E2E Tests**: クリティカルパス（ユーザー登録〜プロジェクト生成）

### 推奨目標
- **Unit Tests**: 85%以上
- **Integration Tests**: 60%以上
- **E2E Tests**: 主要ユーザージャーニーの100%

## 🚀 テスト環境のセットアップ手順

### 1. 基本設定
```bash
# テストフレームワークのインストール
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest ts-jest

# 設定ファイルの作成
touch jest.config.js jest.setup.js
```

### 2. テストディレクトリの作成
```bash
# テストディレクトリ構造の作成
mkdir -p {app,components,lib}/__tests__
mkdir -p e2e test/{mocks,fixtures}
```

### 3. 初回テスト作成
```bash
# サンプルテストファイルの作成
touch components/__tests__/Button.test.tsx
touch app/__tests__/page.test.tsx
touch e2e/smoke.spec.ts
```

### 4. テスト実行
```bash
# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e

# 全テスト
npm run test:all
```

## ⚠️ 注意事項

### テスト実装時の考慮点

1. **認証状態の管理**: テストごとにクリーンな状態を保つ
2. **非同期処理**: waitFor, act を適切に使用
3. **モック管理**: 過度なモックは避け、必要最小限に
4. **テストデータ**: 実際のプロダクションデータを使用しない
5. **環境分離**: テスト環境とプロダクション環境を完全に分離

### パフォーマンス
- 並列実行でテスト時間を短縮
- 重いE2Eテストは必要最小限に
- テストDBは高速なメモリDB使用を検討

## 📞 サポート

テスト環境構築で問題が発生した場合：
1. まず公式ドキュメントを確認
2. GitHub Issuesで既知の問題を検索
3. 新しいIssueとして報告

---

**次のステップ**: このガイドに従ってテスト環境を構築し、継続的な品質向上を実現しましょう。

最終更新: 2024年12月
バージョン: 1.0.0