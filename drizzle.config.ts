import "dotenv/config"; // 确保可以读取.env 文件中的 DATABASE_URL
import { defineConfig } from "drizzle-kit";
console.log(process.env.DATABASE_URL, "process.env.DATABASE_URL");
export default defineConfig({
  // 指定数据库模式文件的路径
  schema: "./src/db/schema.ts", // [5, 8, 9]
  // 指定生成的迁移文件存放的目录
  out: "./drizzle", // [5, 8, 9]
  // 指定数据库方言为 PostgreSQL
  dialect: "postgresql", // [8, 9, 10]
  // 提供数据库连接凭证
  dbCredentials: {
    // 对于 PostgreSQL，drizzle-kit 可以直接使用连接 URL [8, 9]
    url: process.env.DATABASE_URL!,
  },
  // 可选：在日志中显示更多信息
  verbose: true,
  // 可选：严格模式，有助于捕捉潜在问题
  strict: true,
});
