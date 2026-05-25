-- Category self-relation (parentId FK)
-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE INDEX "Supervisor_pointId_idx" ON "Supervisor"("pointId");

-- CreateIndex
CREATE INDEX "Driver_supervisorId_idx" ON "Driver"("supervisorId");

-- CreateIndex
CREATE INDEX "Driver_pointId_idx" ON "Driver"("pointId");

-- CreateIndex
CREATE INDEX "RecycleRequest_userId_idx" ON "RecycleRequest"("userId");

-- CreateIndex
CREATE INDEX "RecycleRequest_supervisorId_idx" ON "RecycleRequest"("supervisorId");

-- CreateIndex
CREATE INDEX "RecycleRequest_assignedDriverId_idx" ON "RecycleRequest"("assignedDriverId");

-- CreateIndex
CREATE INDEX "RecycleCollection_requestId_idx" ON "RecycleCollection"("requestId");

-- CreateIndex
CREATE INDEX "RecycleCollection_driverId_idx" ON "RecycleCollection"("driverId");

-- CreateIndex
CREATE INDEX "RecycleComplaint_requestId_idx" ON "RecycleComplaint"("requestId");
