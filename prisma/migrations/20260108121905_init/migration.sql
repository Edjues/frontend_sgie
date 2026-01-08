/*
  Warnings:

  - Added the required column `codigo` to the `permiso` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "permiso" ADD COLUMN     "codigo" TEXT NOT NULL;
