import type { HeroPoint, PriceCard } from "@/lib/types";

const text = (value: string, bold = false) => ({ text: value, bold });

/** Hero list shown until the admin saves their own copy. */
export function defaultHeroPoints(): HeroPoint[] {
  const points: HeroPoint[] = [
    {
      id: "hero-camera",
      icon: "camera",
      parts: [text("Аренда, индивидуальные фотосессии и фотопроекты под ключ")],
    },
    {
      id: "hero-building",
      icon: "building",
      parts: [
        text(
          "2 комнаты в историческом здании 1810-х годов в центре города: комната с роялем и будуаром, кирпичный коридор со сводчатым потолком, арками и нишами",
        ),
      ],
    },
    {
      id: "hero-piano",
      icon: "piano",
      parts: [text("Старинный действующий рояль 1930 года")],
    },
    {
      id: "hero-dress",
      icon: "dress",
      parts: [text("Арендный гардероб в винтажном и будуарном стиле")],
    },
    {
      id: "hero-price",
      icon: "price",
      parts: [
        text("Аренда", true),
        text(" - "),
        text("2500 ₽", true),
        text(
          " в час (с вашим фотографом или на телефон) все фотозоны + дым-машина + осветительное оборудование + гримёрная\n",
        ),
        text("Фотопроект", true),
        text(" под ключ - "),
        text("5500 ₽", true),
        text("\n(30 минут съемки, наш фотограф + 1 локация + наряд)\n"),
        text("Фотосессия", true),
        text(" индивидуальная под ключ = "),
        text("8500 ₽", true),
        text("\n(1 час съемки, наш фотограф + все локации + наряд)"),
      ],
    },
  ];
  return points.map((point) => ({ ...point, parts: point.parts.map((part) => ({ ...part })) }));
}

/** Price cards shown until the admin saves their own copy. */
export function defaultPriceCards(): PriceCard[] {
  const cards: PriceCard[] = [
    {
      id: "price-rent",
      title: "Аренда фотостудии",
      price: "2500 ₽",
      description: [
        text(
          "Аренда фотостудии один час. В стоимость входит: аренда 2 комнат студии, гримерная, осветители, стандартный реквизит, дыммашина. В помещении может находиться до 5 человек, включая фотографа (при необходимости участия большего числа гостей требуется отдельное согласование).",
        ),
      ],
    },
    {
      id: "price-project",
      title: "Фотопроект под ключ",
      price: "5500 ₽",
      description: [text("30 минут съемки, наш фотограф + 1 локация + наряд")],
    },
    {
      id: "price-session",
      title: "Фотосессия индивидуальная под ключ",
      price: "8500 ₽",
      description: [text("1 час съемки, наш фотограф + все локации + наряд")],
    },
    {
      id: "price-snow",
      title: "Снегомашина",
      price: "600 ₽",
      description: [
        text(
          "Стоимость за 15 минут. Время разделяется на короткие интервалы непосредственной работы машины. Снегомашина управляется администратором.",
        ),
      ],
    },
    {
      id: "price-wardrobe",
      title: "Аренда предметов гардероба",
      price: "1000–1500 ₽",
      description: [
        text(
          "Стоимость указана за 1 платье в студии и зависит от конкретного предмета. С подбором и примеркой платьев помогает администратор.",
        ),
      ],
    },
  ];
  return cards.map((card) => ({ ...card, description: card.description.map((part) => ({ ...part })) }));
}
