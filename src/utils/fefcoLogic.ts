// src/utils/fefcoLogic.ts

export interface BoxDimensions {
  l: number; // Uzunlik
  w: number; // Eni
  h: number; // Bo'yi
  d: number; // Gofra qalinligi
}

export const calculateBlankSize = (type: string, dims: BoxDimensions) => {
  const { l, w, h, d } = dims;

  switch (type) {
    case '0201': // Standart klapanli
      return {
        blankW: (l + w) * 2 + 35 + (d * 4), // 35mm yopishtirish uchun
        blankH: h + w + (d * 2),
        description: "Standart klapanli quti (RSC)"
      };

    case '0203': // To'liq yopiladigan klapanlar
      return {
        blankW: (l + w) * 2 + 35 + (d * 4),
        blankH: h + (2 * w) + (d * 2),
        description: "Klapanlari to'liq ustma-ust tushadigan model"
      };

    case '0215': // Qulflanadigan tag qism
      return {
        blankW: (l + w) * 2 + 35 + (d * 4),
        blankH: h + (w * 1.5) + (d * 3),
        description: "Tubi qulflanadigan (Crash-lock) model"
      };

    case '0427': // Samolyot-quti
      return {
        blankW: l + (2 * h) + (4 * d) + 40, 
        blankH: (2 * w) + (2 * h) + (6 * d) + 20,
        description: "E-commerce uchun samolyot-quti"
      };

    case '0300': // Teleskopik (Qopqoq va Taglik)
      return {
        blankW: l + (2 * h) + (d * 4),
        blankH: w + (2 * h) + (d * 4),
        description: "Teleskopik quti (faqat bir qismi)"
      };

    default:
      return { blankW: 0, blankH: 0, description: "Noma'lum model" };
  }
};