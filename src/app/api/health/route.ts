import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Health Check API
 *
 * Returns the health status of the application and its dependencies
 *
 * Response:
 * - status: "ok" | "error"
 * - timestamp: ISO 8601 timestamp
 * - version: Application version (from package.json)
 * - services: Status of each service
 *   - database: Database connection status
 *   - redis: Redis connection status (if configured)
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();

  // Check database connection
  let databaseStatus = "ok";
  let databaseLatency = 0;
  try {
    const dbStartTime = Date.now();
    await db.execute("SELECT 1");
    databaseLatency = Date.now() - dbStartTime;
  } catch (error) {
    console.error("[Health Check] Database check failed:", error);
    databaseStatus = "error";
  }

  // Check Redis connection (if configured)
  let redisStatus = "ok";
  const redisLatency = 0;
  try {
    // TODO: Uncomment when Redis is properly configured
    // const redisStartTime = Date.now();
    // const redis = await getRedisClient();
    // await redis.ping();
    // redisLatency = Date.now() - redisStartTime;
    redisStatus = "not_configured";
  } catch (error) {
    console.error("[Health Check] Redis check failed:", error);
    redisStatus = "error";
  }

  const totalLatency = Date.now() - startTime;

  // Determine overall status
  const overallStatus =
    databaseStatus === "error" || redisStatus === "error" ? "error" : "ok";

  const response = {
    status: overallStatus,
    timestamp,
    version: process.env.npm_package_version || "1.0.0",
    uptime: process.uptime(),
    services: {
      database: {
        status: databaseStatus,
        latency: `${databaseLatency}ms`,
      },
      redis: {
        status: redisStatus,
        latency: redisStatus === "not_configured" ? "n/a" : `${redisLatency}ms`,
      },
    },
    latency: `${totalLatency}ms`,
  };

  const statusCode = overallStatus === "ok" ? 200 : 503;

  return NextResponse.json(response, { status: statusCode });
}
