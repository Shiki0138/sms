import sharp from 'sharp';
import { Storage } from '@google-cloud/storage';
import { logger } from '../utils/logger';

export class ImageProcessingService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    // Google Cloud Storage初期化
    this.storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE
    });
    this.bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'salon-images-prod';
  }

  /**
   * 顧客写真を処理してアップロード
   */
  async processCustomerPhoto(file: Buffer, customerId: string, tenantId: string): Promise<string> {
    try {
      // 1. 画像フォーマット検証
      const isValid = await this.validateImageFormat(file);
      if (!isValid) {
        throw new Error('サポートされていない画像形式です。JPEG、PNG、WebPをご利用ください。');
      }

      // 2. 画像メタデータ取得
      const metadata = await sharp(file).metadata();
      logger.info('Processing image:', {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: metadata.size
      });

      // 3. 画像リサイズと最適化
      const processedImages = await Promise.all([
        // サムネイル (150x150px)
        this.resizeImage(file, 150, 150, 'thumbnail'),
        // 中サイズ (400x400px)  
        this.resizeImage(file, 400, 400, 'medium'),
        // 大サイズ (800x800px)
        this.resizeImage(file, 800, 800, 'large')
      ]);

      // 4. Google Cloud Storageにアップロード
      const uploadPromises = processedImages.map(async (image) => {
        const filename = `customers/${tenantId}/${customerId}/${image.size}_${Date.now()}.webp`;
        const url = await this.uploadToGCS(image.buffer, filename);
        return { size: image.size, url };
      });

      const uploadResults = await Promise.all(uploadPromises);

      // 5. CDN配信用URL生成
      const cdnUrls = uploadResults.reduce((acc, result) => {
        acc[result.size] = this.generateCDNUrl(result.url);
        return acc;
      }, {} as Record<string, string>);

      logger.info('Image processing completed:', {
        customerId,
        tenantId,
        urls: cdnUrls
      });

      return cdnUrls.medium; // デフォルトで中サイズのURLを返す
    } catch (error) {
      logger.error('Image processing failed:', {
        customerId,
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 画像フォーマット検証
   */
  private async validateImageFormat(file: Buffer): Promise<boolean> {
    try {
      const metadata = await sharp(file).metadata();
      const supportedFormats = ['jpeg', 'jpg', 'png', 'webp'];
      return supportedFormats.includes(metadata.format || '');
    } catch (error) {
      return false;
    }
  }

  /**
   * 画像リサイズ処理
   */
  private async resizeImage(
    file: Buffer, 
    width: number, 
    height: number, 
    size: string
  ): Promise<{ buffer: Buffer; size: string }> {
    const resized = await sharp(file)
      .resize(width, height, { 
        fit: 'cover',
        position: 'center'
      })
      .webp({ 
        quality: size === 'thumbnail' ? 80 : size === 'medium' ? 90 : 95,
        effort: 6
      })
      .toBuffer();

    return { buffer: resized, size };
  }

  /**
   * Google Cloud Storageアップロード
   */
  private async uploadToGCS(buffer: Buffer, filename: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(filename);

      await file.save(buffer, {
        metadata: {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000', // 1年間キャッシュ
        },
        public: true
      });

      // パブリックURLを取得
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // 長期間有効なURL
      });

      return url;
    } catch (error) {
      logger.error('GCS upload failed:', error);
      throw new Error('画像のアップロードに失敗しました');
    }
  }

  /**
   * CDN配信用URL生成
   */
  private generateCDNUrl(gcsUrl: string): string {
    const cdnBaseUrl = process.env.CDN_BASE_URL;
    if (!cdnBaseUrl) {
      return gcsUrl;
    }

    // GCSのURLをCDN URLに変換
    const gcsPath = gcsUrl.split(`${this.bucketName}/`)[1];
    return `${cdnBaseUrl}/${gcsPath}`;
  }

  /**
   * 画像削除
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // URLからファイル名を抽出
      const filename = this.extractFilenameFromUrl(imageUrl);
      if (!filename) {
        logger.warn('Cannot extract filename from URL:', imageUrl);
        return false;
      }

      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(filename);

      await file.delete();
      logger.info('Image deleted successfully:', filename);
      return true;
    } catch (error) {
      logger.error('Image deletion failed:', {
        imageUrl,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * URLからファイル名を抽出
   */
  private extractFilenameFromUrl(url: string): string | null {
    try {
      // CDN URLまたはGCS URLからファイルパスを抽出
      const cdnBaseUrl = process.env.CDN_BASE_URL;
      
      if (cdnBaseUrl && url.startsWith(cdnBaseUrl)) {
        return url.replace(`${cdnBaseUrl}/`, '');
      }
      
      // GCS URLの場合
      const match = url.match(new RegExp(`${this.bucketName}/(.+)`));
      return match ? match[1] : null;
    } catch (error) {
      logger.error('Failed to extract filename from URL:', { url, error });
      return null;
    }
  }

  /**
   * 画像サイズ別URL取得
   */
  async getImageVariants(baseUrl: string): Promise<Record<string, string>> {
    try {
      const filename = this.extractFilenameFromUrl(baseUrl);
      if (!filename) {
        return { original: baseUrl };
      }

      const basePath = filename.replace(/\/[^/]+$/, '');
      const timestamp = filename.match(/_(\d+)\.webp$/)?.[1];
      
      if (!timestamp) {
        return { original: baseUrl };
      }

      const variants = {
        thumbnail: `thumbnail_${timestamp}.webp`,
        medium: `medium_${timestamp}.webp`,
        large: `large_${timestamp}.webp`
      };

      const urls: Record<string, string> = {};
      for (const [size, variant] of Object.entries(variants)) {
        const fullPath = `${basePath}/${variant}`;
        urls[size] = this.generateCDNUrl(`gs://${this.bucketName}/${fullPath}`);
      }

      return urls;
    } catch (error) {
      logger.error('Failed to get image variants:', { baseUrl, error });
      return { original: baseUrl };
    }
  }

  /**
   * 画像の圧縮統計を取得
   */
  async getCompressionStats(originalBuffer: Buffer): Promise<{
    originalSize: number;
    compressedSizes: Record<string, number>;
    compressionRatio: Record<string, number>;
  }> {
    try {
      const originalSize = originalBuffer.length;
      
      const compressed = await Promise.all([
        this.resizeImage(originalBuffer, 150, 150, 'thumbnail'),
        this.resizeImage(originalBuffer, 400, 400, 'medium'),
        this.resizeImage(originalBuffer, 800, 800, 'large')
      ]);

      const compressedSizes: Record<string, number> = {};
      const compressionRatio: Record<string, number> = {};

      compressed.forEach(({ buffer, size }) => {
        compressedSizes[size] = buffer.length;
        compressionRatio[size] = Math.round((1 - buffer.length / originalSize) * 100);
      });

      return {
        originalSize,
        compressedSizes,
        compressionRatio
      };
    } catch (error) {
      logger.error('Failed to get compression stats:', error);
      throw error;
    }
  }
}

export const imageProcessingService = new ImageProcessingService();