# take-waza

竹細工の編み方パターンをグラフ理論でモデル化し、3Dプレビューで設計できるCADライクなツール。

## 技術スタック
- TypeScript / React + Three.js（フロントエンド・3D描画）
- Rust / WASM（編みパターン計算エンジン）
- Vite（バンドラ）
- Vitest + Playwright（テスト）
- Biome + oxlint（リンター・フォーマッター）

## ルール
- TypeScript: ~/.claude/rules/typescript.md 参照

## コマンド
```
make check       # format → lint → typecheck → test → build
make quality     # 品質ゲート
make wasm        # Rust/WASM ビルド（wasm-pack）
npm run dev      # 開発サーバー起動
```

## ディレクトリ構造
```
src/             # React アプリケーション
  components/    # UIコンポーネント
  hooks/         # カスタムフック
  lib/           # ユーティリティ・ビジネスロジック
  types/         # 型定義
public/          # 静的ファイル
test/e2e/        # Playwright E2Eテスト
docs/            # 品質チェックリスト
```
