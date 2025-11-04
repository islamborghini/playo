-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "stats" TEXT NOT NULL DEFAULT '{}',
    "preferences" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "recurrenceRule" TEXT,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "lastCompleted" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "story_progressions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "currentChapter" INTEGER NOT NULL DEFAULT 1,
    "chapterData" TEXT NOT NULL DEFAULT '{}',
    "branchesTaken" TEXT NOT NULL DEFAULT '[]',
    "lastUpdated" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "story_progressions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "currentChapter" INTEGER NOT NULL DEFAULT 1,
    "totalChapters" INTEGER NOT NULL DEFAULT 10,
    "chapterData" TEXT NOT NULL DEFAULT '{}',
    "branchesTaken" TEXT NOT NULL DEFAULT '[]',
    "activeQuests" TEXT NOT NULL DEFAULT '[]',
    "unlockedChallenges" TEXT NOT NULL DEFAULT '[]',
    "worldState" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "completed_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xpGained" INTEGER NOT NULL DEFAULT 0,
    "storyUnlocked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "completed_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "completed_tasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "character_inventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "obtainedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "character_inventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_generation_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "cost" REAL NOT NULL DEFAULT 0.0,
    "generationTime" INTEGER NOT NULL DEFAULT 0,
    "purpose" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_generation_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_level_idx" ON "users"("level");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "tasks_userId_idx" ON "tasks"("userId");

-- CreateIndex
CREATE INDEX "tasks_type_idx" ON "tasks"("type");

-- CreateIndex
CREATE INDEX "tasks_difficulty_idx" ON "tasks"("difficulty");

-- CreateIndex
CREATE INDEX "tasks_category_idx" ON "tasks"("category");

-- CreateIndex
CREATE INDEX "tasks_isActive_idx" ON "tasks"("isActive");

-- CreateIndex
CREATE INDEX "tasks_lastCompleted_idx" ON "tasks"("lastCompleted");

-- CreateIndex
CREATE INDEX "tasks_createdAt_idx" ON "tasks"("createdAt");

-- CreateIndex
CREATE INDEX "story_progressions_userId_idx" ON "story_progressions"("userId");

-- CreateIndex
CREATE INDEX "story_progressions_storyId_idx" ON "story_progressions"("storyId");

-- CreateIndex
CREATE INDEX "story_progressions_currentChapter_idx" ON "story_progressions"("currentChapter");

-- CreateIndex
CREATE INDEX "story_progressions_lastUpdated_idx" ON "story_progressions"("lastUpdated");

-- CreateIndex
CREATE UNIQUE INDEX "story_progressions_userId_storyId_key" ON "story_progressions"("userId", "storyId");

-- CreateIndex
CREATE INDEX "stories_userId_idx" ON "stories"("userId");

-- CreateIndex
CREATE INDEX "stories_isActive_idx" ON "stories"("isActive");

-- CreateIndex
CREATE INDEX "stories_currentChapter_idx" ON "stories"("currentChapter");

-- CreateIndex
CREATE INDEX "stories_createdAt_idx" ON "stories"("createdAt");

-- CreateIndex
CREATE INDEX "stories_updatedAt_idx" ON "stories"("updatedAt");

-- CreateIndex
CREATE INDEX "completed_tasks_userId_idx" ON "completed_tasks"("userId");

-- CreateIndex
CREATE INDEX "completed_tasks_taskId_idx" ON "completed_tasks"("taskId");

-- CreateIndex
CREATE INDEX "completed_tasks_completedAt_idx" ON "completed_tasks"("completedAt");

-- CreateIndex
CREATE INDEX "completed_tasks_storyUnlocked_idx" ON "completed_tasks"("storyUnlocked");

-- CreateIndex
CREATE INDEX "character_inventory_userId_idx" ON "character_inventory"("userId");

-- CreateIndex
CREATE INDEX "character_inventory_itemType_idx" ON "character_inventory"("itemType");

-- CreateIndex
CREATE INDEX "character_inventory_equipped_idx" ON "character_inventory"("equipped");

-- CreateIndex
CREATE INDEX "character_inventory_obtainedAt_idx" ON "character_inventory"("obtainedAt");

-- CreateIndex
CREATE UNIQUE INDEX "character_inventory_userId_itemId_key" ON "character_inventory"("userId", "itemId");

-- CreateIndex
CREATE INDEX "ai_generation_logs_userId_idx" ON "ai_generation_logs"("userId");

-- CreateIndex
CREATE INDEX "ai_generation_logs_modelUsed_idx" ON "ai_generation_logs"("modelUsed");

-- CreateIndex
CREATE INDEX "ai_generation_logs_purpose_idx" ON "ai_generation_logs"("purpose");

-- CreateIndex
CREATE INDEX "ai_generation_logs_success_idx" ON "ai_generation_logs"("success");

-- CreateIndex
CREATE INDEX "ai_generation_logs_createdAt_idx" ON "ai_generation_logs"("createdAt");

-- CreateIndex
CREATE INDEX "ai_generation_logs_cost_idx" ON "ai_generation_logs"("cost");

-- CreateIndex
CREATE INDEX "ai_generation_logs_tokensUsed_idx" ON "ai_generation_logs"("tokensUsed");
