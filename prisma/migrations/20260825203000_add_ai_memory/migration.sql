-- AlterTable
ALTER TABLE "Project" ADD COLUMN "persistAiData" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ProjectSpec" ADD COLUMN "title" TEXT NOT NULL DEFAULT 'Technical specification';
ALTER TABLE "ProjectSpec" ADD COLUMN "snippet" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "ProjectChatMessage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectChatMessage_projectId_timestamp_idx" ON "ProjectChatMessage"("projectId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectChatMessage_projectId_messageId_key" ON "ProjectChatMessage"("projectId", "messageId");

-- AddForeignKey
ALTER TABLE "ProjectChatMessage" ADD CONSTRAINT "ProjectChatMessage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
