-- CreateTable
CREATE TABLE "TelemetryEvent" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "userId" TEXT,
    "taskId" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "durationMs" INTEGER,
    "metadata" TEXT,

    CONSTRAINT "TelemetryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TelemetryEvent_event_idx" ON "TelemetryEvent"("event");

-- CreateIndex
CREATE INDEX "TelemetryEvent_category_idx" ON "TelemetryEvent"("category");

-- CreateIndex
CREATE INDEX "TelemetryEvent_timestamp_idx" ON "TelemetryEvent"("timestamp");

-- CreateIndex
CREATE INDEX "TelemetryEvent_userId_idx" ON "TelemetryEvent"("userId");

-- CreateIndex
CREATE INDEX "TelemetryEvent_taskId_idx" ON "TelemetryEvent"("taskId");
