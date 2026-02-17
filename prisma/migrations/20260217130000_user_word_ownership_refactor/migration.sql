-- CreateTable
CREATE TABLE "UserWord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWordTranslation" (
    "id" TEXT NOT NULL,
    "userWordId" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "translatedLanguageId" TEXT NOT NULL,

    CONSTRAINT "UserWordTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomListUserWord" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "userWordId" TEXT NOT NULL,

    CONSTRAINT "CustomListUserWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWordProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userWordId" TEXT NOT NULL,
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),

    CONSTRAINT "UserWordProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserWord_userId_languageId_text_key" ON "UserWord"("userId", "languageId", "text");

-- CreateIndex
CREATE UNIQUE INDEX "UserWordTranslation_userWordId_translatedLanguageId_translatedText_key" ON "UserWordTranslation"("userWordId", "translatedLanguageId", "translatedText");

-- CreateIndex
CREATE UNIQUE INDEX "CustomListUserWord_listId_userWordId_key" ON "CustomListUserWord"("listId", "userWordId");

-- CreateIndex
CREATE UNIQUE INDEX "UserWordProgress_userId_userWordId_key" ON "UserWordProgress"("userId", "userWordId");

-- AddForeignKey
ALTER TABLE "UserWord" ADD CONSTRAINT "UserWord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWord" ADD CONSTRAINT "UserWord_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWordTranslation" ADD CONSTRAINT "UserWordTranslation_userWordId_fkey" FOREIGN KEY ("userWordId") REFERENCES "UserWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWordTranslation" ADD CONSTRAINT "UserWordTranslation_translatedLanguageId_fkey" FOREIGN KEY ("translatedLanguageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomListUserWord" ADD CONSTRAINT "CustomListUserWord_listId_fkey" FOREIGN KEY ("listId") REFERENCES "CustomList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomListUserWord" ADD CONSTRAINT "CustomListUserWord_userWordId_fkey" FOREIGN KEY ("userWordId") REFERENCES "UserWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWordProgress" ADD CONSTRAINT "UserWordProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWordProgress" ADD CONSTRAINT "UserWordProgress_userWordId_fkey" FOREIGN KEY ("userWordId") REFERENCES "UserWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
