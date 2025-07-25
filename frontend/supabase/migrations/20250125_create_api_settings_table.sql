-- 外部API設定テーブルの作成
-- LINE, Instagram, Google, Stripe などの外部API認証情報を保存

CREATE TABLE IF NOT EXISTS api_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  service TEXT NOT NULL CHECK (service IN ('line', 'instagram', 'google', 'stripe', 'openai')),
  credentials JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("tenantId", service)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_api_settings_tenant ON api_settings("tenantId");
CREATE INDEX IF NOT EXISTS idx_api_settings_service ON api_settings(service);

-- RLS（Row Level Security）を有効化
ALTER TABLE api_settings ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの作成
-- 読み取り: 自分のテナントの設定のみ読み取り可能
CREATE POLICY "Users can read own api settings" ON api_settings
  FOR SELECT USING (true); -- 一時的に全員読み取り可能（本番では適切な条件に変更）

-- 書き込み: 自分のテナントの設定のみ書き込み可能
CREATE POLICY "Users can write own api settings" ON api_settings
  FOR ALL USING (true); -- 一時的に全員書き込み可能（本番では適切な条件に変更）

-- 更新時にupdatedAtを自動更新するトリガー
CREATE TRIGGER update_api_settings_updated_at
  BEFORE UPDATE ON api_settings
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- デモデータの挿入（必要に応じて）
-- INSERT INTO api_settings ("tenantId", service, credentials)
-- VALUES 
--   ('demo-user', 'line', '{"channelAccessToken": "", "channelSecret": "", "channelId": ""}'::jsonb),
--   ('demo-user', 'instagram', '{"accessToken": "", "pageId": "", "appId": "", "appSecret": ""}'::jsonb),
--   ('demo-user', 'google', '{"clientId": "", "clientSecret": "", "redirectUri": ""}'::jsonb)
-- ON CONFLICT ("tenantId", service) DO NOTHING;

-- 確認用のクエリ
-- SELECT * FROM api_settings;