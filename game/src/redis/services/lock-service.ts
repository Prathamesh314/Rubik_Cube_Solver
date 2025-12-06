import { randomUUID } from 'crypto';
import type { RedisClientType } from 'redis';
import { RedisConfig } from '../config';
import type { LockOptions } from '../types';

export class LockService {
    constructor(private readonly client: RedisClientType) {}

    async withLock<T>(
        lockKey: string,
        fn: () => Promise<T>,
        options: LockOptions = {}
    ): Promise<T> {
        const {
            ttlSeconds = RedisConfig.LOCK.TTL_SECONDS,
            maxRetries = RedisConfig.LOCK.MAX_RETRIES,
            retryDelayMs = RedisConfig.LOCK.RETRY_DELAY_MS,
        } = options;

        const lockId = randomUUID();
        let acquired = false;
        let retries = 0;

        // Try to acquire lock with retries
        while (!acquired && retries < maxRetries) {
            acquired = await this.acquireLock(lockKey, lockId, ttlSeconds);
            
            if (!acquired) {
                retries++;
                if (retries < maxRetries) {
                    await this.delay(retryDelayMs * retries);
                }
            }
        }

        if (!acquired) {
            throw new Error(`Could not acquire lock: ${lockKey} after ${maxRetries} attempts`);
        }

        try {
            return await fn();
        } finally {
            await this.releaseLock(lockKey, lockId);
        }
    }

    private async acquireLock(
        lockKey: string,
        lockId: string,
        ttlSeconds: number
    ): Promise<boolean> {
        try {
            const result = await this.client.set(lockKey, lockId, {
                NX: true,
                EX: ttlSeconds,
            });
            return result === 'OK';
        } catch (error) {
            console.error(`Failed to acquire lock ${lockKey}:`, error);
            return false;
        }
    }

    private async releaseLock(lockKey: string, lockId: string): Promise<void> {
        try {
            const currentLockId = await this.client.get(lockKey);
            if (currentLockId === lockId) {
                await this.client.del(lockKey);
            }
        } catch (error) {
            console.error(`Failed to release lock ${lockKey}:`, error);
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}