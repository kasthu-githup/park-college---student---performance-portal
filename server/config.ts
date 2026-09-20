import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Attempt to load dynamically configured DB settings from local data directory
const dbConfigFile = path.join(process.cwd(), 'server', 'data', 'db-config.json');
let dynamicDbConfig: any = {};
try {
  if (fs.existsSync(dbConfigFile)) {
    const raw = fs.readFileSync(dbConfigFile, 'utf-8');
    dynamicDbConfig = JSON.parse(raw);
  }
} catch (e) {
  // Ignore
}

export const config = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'park-college-enterprise-secret-key-2026-prod-auth',
  jwtExpiresIn: '7d',
  
  // PostgreSQL Database settings
  pg: {
    connectionString: process.env.DATABASE_URL || dynamicDbConfig?.pg?.connectionString,
    host: process.env.PGHOST || process.env.SQL_HOST || dynamicDbConfig?.pg?.host || 'localhost',
    port: Number(process.env.PGPORT || process.env.SQL_PORT || dynamicDbConfig?.pg?.port || 5432),
    user: process.env.PGUSER || process.env.SQL_USER || dynamicDbConfig?.pg?.user || 'postgres',
    password: process.env.PGPASSWORD || process.env.SQL_PASSWORD || dynamicDbConfig?.pg?.password || '',
    database: process.env.PGDATABASE || process.env.SQL_DB_NAME || dynamicDbConfig?.pg?.database || 'postgres',
  },

  // TiDB Cloud (MySQL 8.0) settings
  tidb: {
    host: dynamicDbConfig?.tidb?.host || process.env.TIDB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: Number(dynamicDbConfig?.tidb?.port || process.env.TIDB_PORT || 4000),
    user: dynamicDbConfig?.tidb?.user || process.env.TIDB_USER || '2zWbwkdC8He9zu1.root',
    password: dynamicDbConfig?.tidb?.password || process.env.TIDB_PASSWORD || 'QDlj2w20i9bI6pPt',
    database: dynamicDbConfig?.tidb?.database || process.env.TIDB_DATABASE || 'college_nodue',
    enableSsl: (dynamicDbConfig?.tidb?.enableSsl !== false) && (process.env.TIDB_ENABLE_SSL !== 'false'),
  },

  // Security & limits
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 500, // max requests per window
  },
  
  institution: {
    name: 'Park College of Engineering and Technology',
    affiliation: 'Autonomous Institution Affiliated to Anna University, Chennai',
    academicYear: '2026-2027',
    currentSemester: 5,
    attendanceThreshold: 75,
  }
};

export function saveTiDbConfig(newTidbConfig: {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  enableSsl?: boolean;
}) {
  if (newTidbConfig.host) config.tidb.host = newTidbConfig.host;
  if (newTidbConfig.port) config.tidb.port = Number(newTidbConfig.port);
  if (newTidbConfig.user) config.tidb.user = newTidbConfig.user;
  if (newTidbConfig.password !== undefined) config.tidb.password = newTidbConfig.password;
  if (newTidbConfig.database) config.tidb.database = newTidbConfig.database;
  if (newTidbConfig.enableSsl !== undefined) config.tidb.enableSsl = Boolean(newTidbConfig.enableSsl);

  try {
    const dir = path.dirname(dbConfigFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbConfigFile, JSON.stringify({ tidb: config.tidb, pg: config.pg }, null, 2));
  } catch (err) {
    console.error('Failed to persist dynamic DB config:', err);
  }
}

