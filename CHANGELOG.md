# Changelog

## v1.0.0 (2026-03-30)

MVP release - 竹細工の編み方パターンをグラフ理論でモデル化し、3Dプレビューで設計できるCADライクなツール。

### Features

- feat: 編み手順ステップバイステップ図解生成 (#16)
- feat: パラメータUIパネル - 竹ひごパラメータのインタラクティブ調整 (#15)
- feat: Three.js 3Dプレビュー - グラフ→メッシュ変換とインタラクティブ描画 (#14)
- feat: コアデータモデル - 竹ひご編みパターンのグラフ構造設計 (#13)
- feat: プロジェクト基盤セットアップ（CI/CD、Vite/Vitest、Rust/WASM） (#12)

### Fixes

- fix: add missing src/main.tsx, guard make wasm, fix E2E tests and vitest config

### Dependencies

- Bump three from 0.172.0 to 0.183.2 (#5)

### Other

- Initial project scaffold from idea #471
