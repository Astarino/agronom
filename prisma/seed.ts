import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const speciesData = [
  {
    name: "Редис «Санго»",
    variety: "Sango",
    color: "#E040FB",
    seedAmount: 8,
    soakHours: null,
    pressWeight: 675,
    darkDaysMin: 2,
    darkDaysMax: 3,
    lightDaysMin: 4,
    lightDaysMax: 6,
    tempMin: 21,
    tempMax: 23,
    humidityMin: 50,
    humidityMax: 70,
    heightMin: 5,
    heightMax: 8,
    overgrownHeight: 8,
    lightHeight: null,
    steps: JSON.stringify([
      { step: 1, title: "Сортировка семян", desc: "Сортируем семена — убираем разрушенные и некачественные" },
      { step: 2, title: "Отмеряем семена", desc: "На один лоток берём 8 граммов сухих семян" },
      { step: 3, title: "Смачиваем агровату", desc: "Равномерно увлажняем агровату водой" },
      { step: 4, title: "Засеваем лоток", desc: "Равномерно ссыпаем семена и хорошо смачиваем пульверизатором" },
      { step: 5, title: "Прижим в темноте", desc: "Тёмное место, прижим 600–750г, 2–3 дня. Стопка 4–5 лотков. По мере подсыхания — смачиваем. Длина по истечении: 5–7 мм", phase: "DARK_PHASE" },
      { step: 6, title: "Переставляем под свет", desc: "Свет 16 ч / темнота 8 ч. Следим за влагой", phase: "LIGHT_PHASE" },
      { step: 7, title: "Готово к сбору!", desc: "Через 4–6 дней после выставления на свет. Высота 5–8 см", phase: "READY" },
    ]),
    readySigns: JSON.stringify([
      "Высота 5–8 см",
      "Сочно-фиолетовая листва и розовый стебель",
      "Вкус сочный, слегка острый (как редиска)",
      "Может чуть «щипать» язык",
    ]),
    overgrownSigns: JSON.stringify([
      "Высота выше 8 см",
      "Начинает падать",
      "Между 2 листиками одного семени появляется настоящая листва",
      "Горечь усиливается",
    ]),
  },
  {
    name: "Горох «Мадрасс»",
    variety: "Madras",
    color: "#69F0AE",
    seedAmount: 41,
    soakHours: 9.5,
    pressWeight: 2000,
    darkDaysMin: 2,
    darkDaysMax: 3,
    lightDaysMin: 4,
    lightDaysMax: 6,
    tempMin: 20,
    tempMax: 23,
    humidityMin: 50,
    humidityMax: 70,
    heightMin: 8,
    heightMax: 12,
    overgrownHeight: 12,
    lightHeight: 30,
    steps: JSON.stringify([
      { step: 1, title: "Сортировка семян", desc: "Сортируем семена — убираем разрушенные и некачественные" },
      { step: 2, title: "Отмеряем семена", desc: "На один лоток берём 40–42г сухих семян" },
      { step: 3, title: "Промываем семена", desc: "Промываем 2–3 раза чистой водой комнатной температуры" },
      { step: 4, title: "Замачивание", desc: "Кладём семена в тару, наливаем воды в 3 раза больше объёма семян. Ждём 9–10 часов", phase: "PREPARATION" },
      { step: 5, title: "Промываем", desc: "Промываем 1–2 раза после замачивания" },
      { step: 6, title: "Отдых семян", desc: "Оставляем семена на 20–25 минут на ровной поверхности в один слой" },
      { step: 7, title: "Подготавливаем агровату", desc: "Замачиваем агровату в чистой воде, лишнюю воду сливаем" },
      { step: 8, title: "Засеваем лотки", desc: "Кладём семена в один слой в каждый лоток" },
      { step: 9, title: "Увлажняем", desc: "Пульверизатором проходимся по каждому лотку 1 раз" },
      { step: 10, title: "Прижим в темноте", desc: "Стопка по 5 лотков, груз 2 кг сверху. В тёмное место при 21°C на 2–3 дня. Периодически смачиваем", phase: "DARK_PHASE" },
      { step: 11, title: "Переставляем под свет", desc: "После прорастания 0,7–1 см — под свет. В поддон наливаем немного воды. Свет 16 ч / темнота 8 ч. Воду в поддоне меняем каждый день", phase: "LIGHT_PHASE" },
      { step: 12, title: "Готово к сбору!", desc: "Через 4–6 дней после выставления на свет. Высота 8–12 см", phase: "READY" },
    ]),
    readySigns: JSON.stringify([
      "Высота 8–12 см",
      "Прочная и ярко-зелёная",
      "Вкус, как у гороха — сладковатый",
    ]),
    overgrownSigns: JSON.stringify([
      "Высота выше 12 см",
      "Темнеет",
      "Вкус, как у травы",
      "Появление настоящих листочков",
    ]),
  },
  {
    name: "Редис «Красный Коралл»",
    variety: "Red Coral",
    color: "#FF5252",
    seedAmount: 8,
    soakHours: null,
    pressWeight: 1000,
    darkDaysMin: 2,
    darkDaysMax: 3,
    lightDaysMin: 4,
    lightDaysMax: 6,
    tempMin: 21,
    tempMax: 23,
    humidityMin: 50,
    humidityMax: 70,
    heightMin: 7,
    heightMax: 10,
    overgrownHeight: 10,
    lightHeight: null,
    steps: JSON.stringify([
      { step: 1, title: "Сортировка семян", desc: "Сортируем семена — убираем разрушенные и некачественные" },
      { step: 2, title: "Отмеряем семена", desc: "На один лоток берём 8 граммов сухих семян" },
      { step: 3, title: "Смачиваем агровату", desc: "Равномерно увлажняем агровату водой" },
      { step: 4, title: "Засеваем лоток", desc: "Равномерно ссыпаем семена и хорошо смачиваем пульверизатором" },
      { step: 5, title: "Прижим в темноте", desc: "Тёмное место, прижим 1 кг, 2–3 дня. Стопка 4–5 лотков. По мере подсыхания — смачиваем. Длина по истечении: 5–7 мм", phase: "DARK_PHASE" },
      { step: 6, title: "Переставляем под свет", desc: "Свет 16 ч / темнота 8 ч. Следим за влагой", phase: "LIGHT_PHASE" },
      { step: 7, title: "Готово к сбору!", desc: "Через 4–6 дней после выставления на свет. Высота 7–10 см", phase: "READY" },
    ]),
    readySigns: JSON.stringify([
      "Высота 7–10 см",
      "Ярко-зелёная листва и розовый стебель",
      "Вкус сочный, слегка острый (как редиска)",
      "Может чуть «щипать» язык",
    ]),
    overgrownSigns: JSON.stringify([
      "Высота выше 10 см",
      "Начинает падать",
      "Между 2 листиками появляется настоящая листва",
      "Горечь усиливается",
    ]),
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Создаём виды растений
  for (const species of speciesData) {
    const existing = await prisma.species.findFirst({ where: { name: species.name } });
    if (!existing) {
      await prisma.species.create({ data: species });
    }
  }
  console.log("✅ Species created");

  // Создаём пользователя по умолчанию
  let user = await prisma.user.findUnique({ where: { id: "default-user" } });
  if (!user) {
    user = await prisma.user.create({ data: { id: "default-user", name: "Агроном" } });
  }
  console.log("✅ Default user created");

  // Создаём стеллаж по умолчанию с 3 этажами
  const existingShelf = await prisma.shelf.findUnique({ where: { id: "default-shelf" } });
  if (existingShelf) { console.log("✅ Shelf already exists"); return; }

  const shelf = await prisma.shelf.create({
    data: {
      id: "default-shelf",
      name: "Стеллаж #1",
      userId: user.id,
      levels: {
        create: [
          {
            levelNumber: 1,
            lightOnTime: "06:00",
            lightOffTime: "22:00",
            trays: {
              create: [
                {
                  position: 1,
                  containers: {
                    create: [
                      { position: 1 }, { position: 2 },
                      { position: 3 }, { position: 4 },
                    ],
                  },
                },
                {
                  position: 2,
                  containers: {
                    create: [
                      { position: 1 }, { position: 2 },
                      { position: 3 }, { position: 4 },
                    ],
                  },
                },
              ],
            },
          },
          {
            levelNumber: 2,
            lightOnTime: "06:00",
            lightOffTime: "22:00",
            trays: {
              create: [
                {
                  position: 1,
                  containers: {
                    create: [
                      { position: 1 }, { position: 2 },
                      { position: 3 }, { position: 4 },
                    ],
                  },
                },
                {
                  position: 2,
                  containers: {
                    create: [
                      { position: 1 }, { position: 2 },
                      { position: 3 }, { position: 4 },
                    ],
                  },
                },
              ],
            },
          },
          {
            levelNumber: 3,
            lightOnTime: "06:00",
            lightOffTime: "22:00",
            trays: {
              create: [
                {
                  position: 1,
                  containers: {
                    create: [
                      { position: 1 }, { position: 2 },
                      { position: 3 }, { position: 4 },
                    ],
                  },
                },
                {
                  position: 2,
                  containers: {
                    create: [
                      { position: 1 }, { position: 2 },
                      { position: 3 }, { position: 4 },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("✅ Default shelf with 3 levels created:", shelf?.name ?? "—");
  console.log("🌿 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
