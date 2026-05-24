-- Product query performance indexes
CREATE INDEX IF NOT EXISTS "Product_status_createdAt_idx" ON "Product"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Product_category_status_idx" ON "Product"("category", "status");
