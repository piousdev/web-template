import Bull, { type Job, type JobOptions, type Queue } from "bull";

// Parse Redis URL for Bull configuration
const redisUrl = new URL(process.env.REDIS_URL || "redis://localhost:6379");

// Redis connection configuration optimized for production
const redisConfig = {
  host: process.env.REDIS_HOST || redisUrl.hostname,
  port: parseInt(process.env.REDIS_PORT || redisUrl.port || "6379", 10),
  password: redisUrl.password || undefined,
  maxRetriesPerRequest: null, // Critical for long-running workers in production
  enableReadyCheck: false,
  retryStrategy: (times: number) => {
    // Exponential backoff with max delay of 30 seconds
    return Math.min(times * 1000, 30000);
  },
};

// Default job options for all queues
const defaultJobOptions: JobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2000, // Start with 2 seconds, then exponential backoff
  },
  removeOnComplete: 100, // Keep last 100 completed jobs for debugging
  removeOnFail: 500, // Keep last 500 failed jobs for analysis
};

// Email queue for sending emails via Resend
export const emailQueue = new Bull("email", {
  redis: redisConfig,
  defaultJobOptions,
  settings: {
    lockDuration: 30000, // 30 seconds lock duration
    maxStalledCount: 2, // Retry stalled jobs twice
  },
});

// Notification queue for push notifications and alerts
export const notificationQueue = new Bull("notifications", {
  redis: redisConfig,
  defaultJobOptions,
  settings: {
    lockDuration: 30000,
    maxStalledCount: 2,
  },
});

// Generic queue job data types
export interface EmailJobData {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export interface NotificationJobData {
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  data?: Record<string, unknown>;
}

// Queue helpers
export const queueHelpers = {
  /**
   * Add an email job to the queue
   * @param data Email data
   * @param options Optional job options
   */
  addEmailJob: async (
    data: EmailJobData,
    options?: JobOptions,
  ): Promise<Job<EmailJobData>> => {
    return emailQueue.add("send-email", data, options);
  },

  /**
   * Add a notification job to the queue
   * @param data Notification data
   * @param options Optional job options
   */
  addNotificationJob: async (
    data: NotificationJobData,
    options?: JobOptions,
  ): Promise<Job<NotificationJobData>> => {
    return notificationQueue.add("send-notification", data, options);
  },

  /**
   * Get queue statistics for monitoring
   * @param queue The queue to check
   */
  getQueueStats: async (queue: Queue) => {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  },

  /**
   * Clean up old jobs from all queues
   * Removes completed jobs older than 24 hours and failed jobs older than 7 days
   */
  cleanupQueues: async (): Promise<void> => {
    const queues = [emailQueue, notificationQueue];
    const oneDayAgo = 24 * 60 * 60 * 1000;
    const oneWeekAgo = 7 * 24 * 60 * 60 * 1000;

    await Promise.all(
      queues.map(async (queue) => {
        await queue.clean(oneDayAgo, "completed");
        await queue.clean(oneWeekAgo, "failed");
      }),
    );
  },
};

// Graceful shutdown for all queues
export const shutdownQueues = async (): Promise<void> => {
  console.log("Shutting down queues...");
  await Promise.all([emailQueue.close(), notificationQueue.close()]);
  console.log("Queues shut down successfully");
};

// Handle process termination
process.on("SIGTERM", shutdownQueues);
process.on("SIGINT", shutdownQueues);
