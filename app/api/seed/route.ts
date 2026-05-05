import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Защита — вызывать один раз после деплоя
// GET /api/seed?secret=<CRON_SECRET>
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  // Виды растений
  const speciesData = [
    {
      name: "Редис «Санго»", variety: "Sango", color: "#E040FB",
      seedAmount: 8, soakHours: null, pressWeight: 675,
      darkDaysMin: 2, darkDaysMax: 3, lightDaysMin: 4, lightDaysMax: 6,
      tempMin: 21, tempMax: 23, humidityMin: 50, humidityMax: 70,
      heightMin: 5, heightMax: 8, overgrownHeight: 8, lightHeight: null,
      steps: JSON.stringify([
        { step: 1, title: "Сортировка семян", desc: "Убираем разрушенные и некачественные семена" },
        { step: 2, title: "Отмеряем семена", desc: "На один лоток берём 8 граммов сухих семян" },
        { step: 3, title: "Смачиваем агровату", desc: "Равномерно увлажняем агровату водой" },
        { step: 4, title: "Засеваем лоток", desc: "Равномерно ссыпаем семена, хорошо смачиваем пульверизатором" },
        { step: 5, title: "Прижим в темноте", desc: "Тёмное место, прижим 600–750г, 2–3 дня. Стопка 4–5 лотков. По мере подсыхания смачиваем. Длина ≥ 5–7 мм", phase: "DARK_PHASE" },
        { step: 6, title: "Под свет", desc: "Свет 16 ч / темнота 8 ч. Следим за влагой", phase: "LIGHT_PHASE" },
        { step: 7, title: "Готово к сбору", desc: "Через 4–6 дней после выставления на свет. Высота 5–8 см", phase: "READY" },
      ]),
      readySigns: JSON.stringify(["Высота 5–8 см", "Сочно-фиолетовая листва и розовый стебель", "Вкус сочный, слегка острый", "Может щипать язык"]),
      overgrownSigns: JSON.stringify(["Высота выше 8 см", "Начинает падать", "Появляется настоящая листва", "Горечь усиливается"]),
    },
    {
      name: "Горох «Мадрасс»", variety: "Madras", color: "#69F0AE",
      seedAmount: 41, soakHours: 9.5, pressWeight: 2000,
      darkDaysMin: 2, darkDaysMax: 3, lightDaysMin: 4, lightDaysMax: 6,
      tempMin: 20, tempMax: 23, humidityMin: 50, humidityMax: 70,
      heightMin: 8, heightMax: 12, overgrownHeight: 12, lightHeight: 30,
      steps: JSON.stringify([
        { step: 1, title: "Сортировка семян", desc: "Убираем разрушенные семена" },
        { step: 2, title: "Отмеряем семена", desc: "40–42г сухих семян на лоток" },
        { step: 3, title: "Промываем", desc: "2–3 раза чистой водой комнатной температуры" },
        { step: 4, title: "Замачивание", desc: "Воды в 3 раза больше объёма семян. 9–10 часов", phase: "PREPARATION" },
        { step: 5, title: "Промываем", desc: "1–2 раза после замачивания" },
        { step: 6, title: "Отдых семян", desc: "20–25 минут на ровной поверхности в один слой" },
        { step: 7, title: "Готовим агровату", desc: "Замачиваем в чистой воде, лишнюю воду сливаем" },
        { step: 8, title: "Засеваем", desc: "Семена в один слой в каждый лоток" },
        { step: 9, title: "Увлажняем", desc: "Пульверизатором 1 раз по каждому лотку" },
        { step: 10, title: "Прижим в темноте", desc: "Стопка 5 лотков, груз 2 кг сверху. 21°C, 2–3 дня. Периодически смачиваем", phase: "DARK_PHASE" },
        { step: 11, title: "Под свет", desc: "После прорастания 0,7–1 см. В поддон немного воды. Свет 16 ч / темнота 8 ч. Воду в поддоне менять каждый день", phase: "LIGHT_PHASE" },
        { step: 12, title: "Готово к сбору", desc: "Через 4–6 дней после выставления на свет. Высота 8–12 см", phase: "READY" },
      ]),
      readySigns: JSON.stringify(["Высота 8–12 см", "Прочная и ярко-зелёная", "Вкус как у гороха — сладковатый"]),
      overgrownSigns: JSON.stringify(["Высота выше 12 см", "Темнеет", "Вкус как у травы", "Появление настоящих листочков"]),
    },
    {
      name: "Редис «Красный Коралл»", variety: "Red Coral", color: "#FF5252",
      seedAmount: 8, soakHours: null, pressWeight: 1000,
      darkDaysMin: 2, darkDaysMax: 3, lightDaysMin: 4, lightDaysMax: 6,
      tempMin: 21, tempMax: 23, humidityMin: 50, humidityMax: 70,
      heightMin: 7, heightMax: 10, overgrownHeight: 10, lightHeight: null,
      steps: JSON.stringify([
        { step: 1, title: "Сортировка семян", desc: "Убираем разрушенные и некачественные семена" },
        { step: 2, title: "Отмеряем семена", desc: "8 граммов сухих семян на лоток" },
        { step: 3, title: "Смачиваем агровату", desc: "Равномерно увлажняем агровату" },
        { step: 4, title: "Засеваем лоток", desc: "Равномерно ссыпаем семена, хорошо смачиваем пульверизатором" },
        { step: 5, title: "Прижим в темноте", desc: "Тёмное место, прижим 1 кг, 2–3 дня. Стопка 4–5 лотков. Длина ≥ 5–7 мм", phase: "DARK_PHASE" },
        { step: 6, title: "Под свет", desc: "Свет 16 ч / темнота 8 ч. Следим за влагой", phase: "LIGHT_PHASE" },
        { step: 7, title: "Готово к сбору", desc: "Через 4–6 дней. Высота 7–10 см", phase: "READY" },
      ]),
      readySigns: JSON.stringify(["Высота 7–10 см", "Ярко-зелёная листва и розовый стебель", "Вкус сочный, слегка острый"]),
      overgrownSigns: JSON.stringify(["Высота выше 10 см", "Начинает падать", "Появляется настоящая листва", "Горечь усиливается"]),
    },
  ];

  for (const sp of speciesData) {
    const exists = await prisma.species.findFirst({ where: { name: sp.name } });
    if (!exists) {
      await prisma.species.create({ data: sp });
      results.push(`✅ Вид создан: ${sp.name}`);
    } else {
      results.push(`⏭ Вид уже есть: ${sp.name}`);
    }
  }

  // Пользователь и стеллаж
  let user = await prisma.user.findUnique({ where: { id: "default-user" } });
  if (!user) {
    user = await prisma.user.create({ data: { id: "default-user", name: "Агроном" } });
    results.push("✅ Пользователь создан");
  } else {
    results.push("⏭ Пользователь уже есть");
  }

  const existingShelf = await prisma.shelf.findUnique({ where: { id: "default-shelf" } });
  if (!existingShelf) {
    await prisma.shelf.create({
      data: {
        id: "default-shelf",
        name: "Стеллаж #1",
        userId: user.id,
        levels: {
          create: [1, 2, 3].map((n) => ({
            levelNumber: n,
            trays: {
              create: [1, 2].map((p) => ({
                position: p,
                containers: { create: [1, 2, 3, 4].map((pos) => ({ position: pos })) },
              })),
            },
          })),
        },
      },
    });
    results.push("✅ Стеллаж #1 создан (3 этажа)");
  } else {
    results.push("⏭ Стеллаж уже есть");
  }

  return NextResponse.json({ ok: true, results });
}
