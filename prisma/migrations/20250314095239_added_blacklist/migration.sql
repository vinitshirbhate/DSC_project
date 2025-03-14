-- CreateTable
CREATE TABLE "Blacklist" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refershToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Blacklist_pkey" PRIMARY KEY ("id")
);
