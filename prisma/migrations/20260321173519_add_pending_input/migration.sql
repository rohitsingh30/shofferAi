-- CreateTable
CREATE TABLE "SkillLesson" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "errorPattern" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'auto',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "SkillLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingInput" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "question" TEXT,
    "inputType" TEXT,
    "options" TEXT,
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingInput_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SkillLesson_skillId_idx" ON "SkillLesson"("skillId");

-- CreateIndex
CREATE INDEX "SkillLesson_skillId_confidence_idx" ON "SkillLesson"("skillId", "confidence");

-- CreateIndex
CREATE INDEX "PendingInput_taskId_idx" ON "PendingInput"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "PendingInput_taskId_stepId_key" ON "PendingInput"("taskId", "stepId");
