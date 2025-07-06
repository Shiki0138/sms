const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Firestore最適化設定
const initializeOptimizedFirestore = () => {
  const app = initializeApp({
    projectId: 'salon-management-prod'
  });
  
  const db = getFirestore(app);
  
  // 読み取り最適化の設定
  const optimizedSettings = {
    ignoreUndefinedProperties: true,
    // キャッシュ設定
    cacheSizeBytes: 40 * 1024 * 1024, // 40MB
  };
  
  return db;
};

// コスト効率的なクエリヘルパー
const costEfficientQueries = {
  // ページネーション付きクエリ（読み取り数を制限）
  getCustomersPage: async (db, lastDoc = null, limit = 20) => {
    let query = db.collection('customers')
      .orderBy('createdAt', 'desc')
      .limit(limit);
    
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }
    
    const snapshot = await query.get();
    return snapshot.docs;
  },
  
  // インデックス効率的な検索
  searchCustomers: async (db, searchTerm, limit = 10) => {
    // 複合インデックスを使用した効率的な検索
    const snapshot = await db.collection('customers')
      .where('name', '>=', searchTerm)
      .where('name', '<=', searchTerm + '\uf8ff')
      .limit(limit)
      .get();
    
    return snapshot.docs;
  },
  
  // バッチ処理（書き込みコスト削減）
  batchUpdateCustomers: async (db, updates) => {
    const batch = db.batch();
    
    updates.forEach(update => {
      const docRef = db.collection('customers').doc(update.id);
      batch.update(docRef, update.data);
    });
    
    await batch.commit();
  }
};

// 使用量監視
const monitorUsage = {
  logOperation: (operation, docCount = 1) => {
    console.log(`Firestore ${operation}: ${docCount} documents`);
    // 実際の監視システムに送信
  }
};

module.exports = {
  initializeOptimizedFirestore,
  costEfficientQueries,
  monitorUsage
};