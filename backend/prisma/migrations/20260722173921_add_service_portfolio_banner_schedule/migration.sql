-- Эта миграция добивает расхождение между schema.prisma и реальной БД:
-- таблицы Service/PortfolioItem/Banner/ScheduleBlock и колонка
-- Appointment.source были добавлены в schema.prisma, но так и не попали
-- в миграции (видимо, применялись через `prisma db push` локально).
-- Все операции защищены IF NOT EXISTS/DO $$ ... $$, чтобы миграция
-- не упала, даже если часть объектов уже существует в базе.

-- AddColumn (Appointment.source)
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'online';

-- CreateTable
CREATE TABLE IF NOT EXISTS "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PortfolioItem" (
    "id" TEXT NOT NULL,
    "imageData" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Banner" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "imageData" TEXT,
    "linkUrl" TEXT NOT NULL DEFAULT '',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ScheduleBlock" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TEXT,
    "dateFrom" TEXT,
    "dateTo" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "reason" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Service_slug_key') THEN
        CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");
    END IF;
END $$;
