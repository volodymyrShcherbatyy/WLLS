import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.wordSentence.deleteMany();
  await prisma.translation.deleteMany();
  await prisma.customListWord.deleteMany();
  await prisma.customList.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.sentence.deleteMany();
  await prisma.word.deleteMany();
  await prisma.user.deleteMany();
  await prisma.language.deleteMany();

  const [uk, en, sv] = await Promise.all([
    prisma.language.create({ data: { code: "uk", name: "Ukrainian" } }),
    prisma.language.create({ data: { code: "en", name: "English" } }),
    prisma.language.create({ data: { code: "sv", name: "Swedish" } })
  ]);

  const wordsData = [
    { languageId: en.id, text: "apple", imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6", difficulty: 1 },
    { languageId: uk.id, text: "яблуко", imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6", difficulty: 1 },
    { languageId: sv.id, text: "äpple", imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6", difficulty: 1 },
    { languageId: en.id, text: "water", imageUrl: "https://images.unsplash.com/photo-1564419320461-6870880221ad", difficulty: 1 },
    { languageId: uk.id, text: "вода", imageUrl: "https://images.unsplash.com/photo-1564419320461-6870880221ad", difficulty: 1 },
    { languageId: sv.id, text: "vatten", imageUrl: "https://images.unsplash.com/photo-1564419320461-6870880221ad", difficulty: 1 },
    { languageId: en.id, text: "book", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794", difficulty: 2 },
    { languageId: uk.id, text: "книга", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794", difficulty: 2 },
    { languageId: sv.id, text: "bok", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794", difficulty: 2 },
    { languageId: en.id, text: "sun", imageUrl: "https://images.unsplash.com/photo-1601297183305-6df142704ea2", difficulty: 1 },
    { languageId: uk.id, text: "сонце", imageUrl: "https://images.unsplash.com/photo-1601297183305-6df142704ea2", difficulty: 1 },
    { languageId: sv.id, text: "sol", imageUrl: "https://images.unsplash.com/photo-1601297183305-6df142704ea2", difficulty: 1 },
    { languageId: en.id, text: "house", imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be", difficulty: 2 },
    { languageId: uk.id, text: "будинок", imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be", difficulty: 2 },
    { languageId: sv.id, text: "hus", imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be", difficulty: 2 }
  ];

  const words = await Promise.all(wordsData.map((word) => prisma.word.create({ data: word })));

  const findWord = (text: string) => {
    const word = words.find((w) => w.text === text);
    if (!word) {
      throw new Error(`Word not found: ${text}`);
    }
    return word;
  };

  const translationPairs = [
    ["apple", "яблуко"],
    ["apple", "äpple"],
    ["water", "вода"],
    ["water", "vatten"],
    ["book", "книга"],
    ["book", "bok"],
    ["sun", "сонце"],
    ["sun", "sol"],
    ["house", "будинок"],
    ["house", "hus"],
    ["яблуко", "äpple"],
    ["вода", "vatten"],
    ["книга", "bok"],
    ["сонце", "sol"],
    ["будинок", "hus"]
  ] as const;

  for (const [a, b] of translationPairs) {
    const wordA = findWord(a);
    const wordB = findWord(b);
    await prisma.translation.createMany({
      data: [
        { wordId: wordA.id, translatedWordId: wordB.id },
        { wordId: wordB.id, translatedWordId: wordA.id }
      ],
      skipDuplicates: true
    });
  }

  const sentenceRecords = await Promise.all([
    prisma.sentence.create({ data: { text: "I read a book", languageId: en.id } }),
    prisma.sentence.create({ data: { text: "Я п'ю воду", languageId: uk.id } }),
    prisma.sentence.create({ data: { text: "Solen är varm", languageId: sv.id } }),
    prisma.sentence.create({ data: { text: "The apple is red", languageId: en.id } })
  ]);

  await prisma.wordSentence.createMany({
    data: [
      { wordId: findWord("book").id, sentenceId: sentenceRecords[0].id },
      { wordId: findWord("вода").id, sentenceId: sentenceRecords[1].id },
      { wordId: findWord("sol").id, sentenceId: sentenceRecords[2].id },
      { wordId: findWord("apple").id, sentenceId: sentenceRecords[3].id }
    ]
  });

  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      email: "learner@example.com",
      name: "Demo Learner",
      passwordHash,
      nativeLanguageId: uk.id,
      targetLanguageId: en.id
    }
  });

  await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Demo Admin",
      passwordHash,
      nativeLanguageId: en.id,
      targetLanguageId: sv.id,
      isAdmin: true
    }
  });

  await prisma.progress.createMany({
    data: [
      { userId: user.id, wordId: findWord("apple").id, masteryLevel: 3, lastReviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      { userId: user.id, wordId: findWord("water").id, masteryLevel: 1, lastReviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) },
      { userId: user.id, wordId: findWord("book").id, masteryLevel: 4, lastReviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 2) }
    ]
  });


  const starterList = await prisma.customList.create({
    data: {
      name: "Starter Priority",
      userId: user.id
    }
  });

  await prisma.customListWord.createMany({
    data: [
      { listId: starterList.id, wordId: findWord("water").id },
      { listId: starterList.id, wordId: findWord("sun").id }
    ],
    skipDuplicates: true
  });

  console.log("Database seeded successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
