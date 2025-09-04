/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `configuracoes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `configuracoes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "configuracoes" ADD COLUMN "show_clock" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "configuracoes" ADD COLUMN "user_id" TEXT;

UPDATE "configuracoes" 
SET "user_id" = (
    SELECT "id" 
    FROM "usuarios" 
    ORDER BY "created_at" ASC 
    LIMIT 1
) WHERE "user_id" IS NULL;

ALTER TABLE "configuracoes" ALTER COLUMN "user_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_user_id_key" ON "configuracoes"("user_id");

-- AddForeignKey
ALTER TABLE "configuracoes" ADD CONSTRAINT "configuracoes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
