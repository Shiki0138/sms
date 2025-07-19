# Build Error Reference Rule

## 重要：ビルド/デプロイエラー参照ルール
このプロジェクトで作業する際は、**必ず** `frontend/BUILD_ERROR_REFERENCE.md` を参照してください。
- ビルド関連のエラーが発生した場合、まずこのリファレンスの E01-E120 を確認
- エラーパターンに該当する場合は、対応する解決策を優先的に適用
- 新しいエラーパターンを発見した場合は、リファレンスに追記

## Agent Communication System

## エージェント構成
- **PRESIDENT** (別セッション): 統括責任者
- **boss1** (multiagent:0.0): チームリーダー
- **worker1,2,3** (multiagent:0.1-3): 実行担当

## あなたの役割
- **PRESIDENT**: @instructions/president.md
- **boss1**: @instructions/boss.md
- **worker1,2,3**: @instructions/worker.md

## メッセージ送信
```bash
./agent-send.sh [相手] "[メッセージ]"
```

## 基本フロー
PRESIDENT → boss1 → workers → boss1 → PRESIDENT 