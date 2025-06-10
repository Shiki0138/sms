import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateDatabase() {
  console.log('🔄 Running database migration for auto-messages...');

  try {
    // Check if tables exist and create default templates
    const tenants = await prisma.tenant.findMany();

    for (const tenant of tenants) {
      console.log(`Setting up auto-message templates for tenant: ${tenant.name}`);

      // Create default templates
      const defaultTemplates = [
        {
          type: 'REMINDER_1_WEEK',
          title: '1週間前リマインダー',
          content: '{customerName}様\n\nいつもありがとうございます。\n{reservationDate} {reservationTime}からのご予約のリマインダーです。\n\nメニュー: {menuContent}\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\nお待ちしております。',
          isActive: true,
          tenantId: tenant.id
        },
        {
          type: 'REMINDER_3_DAYS',
          title: '3日前リマインダー',
          content: '{customerName}様\n\nご予約まであと3日となりました。\n{reservationDate} {reservationTime}からお待ちしております。\n\nメニュー: {menuContent}\n\n当日は少し早めにお越しいただけますと幸いです。\n\nお会いできることを楽しみにしております。',
          isActive: true,
          tenantId: tenant.id
        },
        {
          type: 'FOLLOWUP_VISIT',
          title: '来店促進メッセージ',
          content: '{customerName}様\n\nいつもご利用いただきありがとうございます。\n\n前回のご来店から時間が経ちましたが、お元気でお過ごしでしょうか？\n\n髪の調子はいかがですか？そろそろお手入れの時期かもしれませんね。\n\nご都合の良い時にぜひお越しください。お待ちしております。',
          isActive: true,
          tenantId: tenant.id
        }
      ];

      for (const template of defaultTemplates) {
        await prisma.autoMessageTemplate.upsert({
          where: {
            tenantId_type: {
              tenantId: tenant.id,
              type: template.type
            }
          },
          update: {},
          create: template
        });
      }

      // Create default settings
      await prisma.tenantSetting.upsert({
        where: {
          tenantId_key: {
            tenantId: tenant.id,
            key: 'auto_reminder_enabled'
          }
        },
        update: {},
        create: {
          tenantId: tenant.id,
          key: 'auto_reminder_enabled',
          value: 'false' // Default to disabled
        }
      });

      await prisma.tenantSetting.upsert({
        where: {
          tenantId_key: {
            tenantId: tenant.id,
            key: 'auto_followup_enabled'
          }
        },
        update: {},
        create: {
          tenantId: tenant.id,
          key: 'auto_followup_enabled',
          value: 'false' // Default to disabled
        }
      });

      console.log(`✅ Templates and settings created for tenant: ${tenant.name}`);
    }

    console.log('✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase();
}

export default migrateDatabase;