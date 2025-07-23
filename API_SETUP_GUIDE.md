# 外部API設定ガイド

このガイドでは、LINE、Instagram、Google Calendarの各APIを設定する手順を説明します。

## 📋 事前準備

### 必要なアカウント
- **LINE**: LINE Developersアカウント
- **Instagram**: Facebook Developersアカウント
- **Google**: Google Cloud Platformアカウント

## 🟢 LINE API設定手順

### 1. LINE Developersコンソールにアクセス
1. https://developers.line.biz/console/ にアクセス
2. LINEビジネスIDでログイン

### 2. プロバイダーを作成
1. 「新規プロバイダー作成」をクリック
2. プロバイダー名を入力（例：美容室管理システム）

### 3. Messaging APIチャンネルを作成
1. 作成したプロバイダーを選択
2. 「新規チャンネル作成」→「Messaging API」を選択
3. 必要項目を入力：
   - チャンネル名：サロン名など
   - チャンネル説明：美容室予約システム連携用
   - 大業種・小業種：適切なものを選択
   - メールアドレス：管理者のメール

### 4. 認証情報を取得
1. 作成したチャンネルの「Messaging API設定」タブを開く
2. 以下の情報をコピー：
   - **Channel Access Token**: 「チャンネルアクセストークン」の「発行」をクリック
   - **Channel Secret**: 「チャンネル基本設定」タブ内

### 5. Webhook設定
1. Webhook URLを設定：
   ```
   https://your-domain.vercel.app/api/v1/webhooks/line
   ```
2. 「Webhookの利用」をONに設定
3. 「応答メッセージ」をOFFに設定（システムから返信するため）

### 6. システムに設定を登録
1. 設定 → 外部API設定 → LINE API設定
2. 取得した情報を入力：
   - Channel Access Token
   - Channel Secret
   - Channel ID（オプション）
3. 「接続テスト」で動作確認
4. 「保存」をクリック

## 📱 Instagram API設定手順

### 1. Facebook Developersにアクセス
1. https://developers.facebook.com/ にアクセス
2. Facebookアカウントでログイン

### 2. アプリを作成
1. 「マイアプリ」→「アプリを作成」
2. アプリタイプ：「ビジネス」を選択
3. アプリ名とメールアドレスを入力

### 3. Instagram Basic Display APIを追加
1. ダッシュボードで「製品を追加」
2. 「Instagram Basic Display」の「設定」をクリック

### 4. Instagram Business Account設定
1. FacebookページとInstagramアカウントを連携
2. ビジネスアカウントに変換（必須）

### 5. アクセストークンを生成
1. 「Instagram Basic Display」→「Basic Display」
2. 「Add or Remove Instagram Testers」でテスターを追加
3. 認証フローを実行してアクセストークンを取得

### 6. 必要な情報を取得
- **Access Token**: 生成したトークン
- **Page ID**: FacebookページID
- **App ID**: アプリID（ダッシュボードに表示）
- **App Secret**: 設定→基本設定

### 7. システムに設定を登録
1. 設定 → 外部API設定 → Instagram API設定
2. 取得した情報を入力
3. 「接続テスト」で動作確認
4. 「保存」をクリック

## 📅 Google Calendar API設定手順

### 1. Google Cloud Consoleにアクセス
1. https://console.cloud.google.com/ にアクセス
2. Googleアカウントでログイン

### 2. プロジェクトを作成
1. 「プロジェクトを選択」→「新しいプロジェクト」
2. プロジェクト名を入力（例：美容室予約システム）

### 3. Google Calendar APIを有効化
1. 「APIとサービス」→「ライブラリ」
2. 「Google Calendar API」を検索
3. 「有効にする」をクリック

### 4. OAuth 2.0認証情報を作成
1. 「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「OAuth クライアント ID」
3. アプリケーションの種類：「ウェブアプリケーション」
4. 承認済みのリダイレクトURI：
   ```
   https://your-domain.vercel.app/api/auth/google/callback
   ```

### 5. 必要な情報を取得
- **Client ID**: 作成したOAuth 2.0クライアントID
- **Client Secret**: 同じく表示されるシークレット

### 6. システムに設定を登録
1. 設定 → 外部API設定 → Google Calendar API設定
2. 取得した情報を入力
3. 「接続テスト」で動作確認
4. 「保存」をクリック

## ⚠️ 注意事項

### セキュリティ
- APIキーやトークンは絶対に外部に漏らさない
- 定期的にトークンを更新する
- 不要になったアプリは削除する

### 料金
- **LINE**: 基本無料（月1000通まで）
- **Instagram**: 基本無料（API制限あり）
- **Google Calendar**: 基本無料（割り当て制限あり）

### トラブルシューティング

#### LINE接続エラー
- Webhook URLが正しいか確認
- Channel Access Tokenの有効期限を確認
- IP制限を確認

#### Instagram接続エラー
- ビジネスアカウントか確認
- アクセストークンの有効期限（60日）を確認
- アプリがライブモードか確認

#### Google Calendar接続エラー
- リダイレクトURIが完全一致か確認
- APIが有効化されているか確認
- 認証スコープが適切か確認

## 📞 サポート

設定でお困りの場合は、以下の情報と共にお問い合わせください：
- エラーメッセージのスクリーンショット
- 設定手順のどこで問題が発生したか
- 使用しているブラウザとOS

## 🔄 更新履歴

- 2025-01-23: 初版作成
- API設定モーダル実装
- 送信確認画面追加