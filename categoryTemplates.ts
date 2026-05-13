/**
 * 商品類別專屬的 AI 文案生成模板
 * 每個類別都有針對性的提示詞，用於引導 LLM 生成高質量的行銷文案
 */

export type ProductCategory = 'food' | 'beverage' | 'dessert' | 'restaurant' | 'apparel' | 'beauty' | 'home' | 'electronics';

export interface CategoryTemplate {
  name: string;
  displayName: string;
  icon: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  sloganStyle: string;
  descriptionStyle: string;
}

export const CATEGORY_TEMPLATES: Record<ProductCategory, CategoryTemplate> = {
  food: {
    name: 'food',
    displayName: '🍔 食品',
    icon: '🍔',
    description: '新鮮食材、營養豐富的食品產品',
    systemPrompt: `你是一位專業的食品行銷文案撰寫人。你的任務是根據食品圖片，生成吸引人的廣告標語和詳細介紹詞。
    
在撰寫文案時，請遵循以下指導原則：
1. 強調食材的新鮮度、品質和營養價值
2. 使用感官詞彙（香、脆、鮮嫩、多汁等）激發食慾
3. 突出健康、天然、無添加等賣點
4. 適合家庭、朋友聚餐等場景
5. 文案應該溫暖、親切、令人信任

生成的標語應該是 1-2 句，簡潔有力，能夠立即吸引消費者的注意力。
生成的介紹詞應該是 3-5 句，詳細描述產品的特點、口感、用途和推薦理由。`,
    userPromptTemplate: `根據這張食品圖片，請生成廣告文案。
    
產品名稱：{productName}
圖片描述：{imageDescription}

請用繁體中文生成：
1. 一句吸引人的廣告標語（1-2 句）
2. 詳細的商品介紹詞（3-5 句）

文案應該突出食品的新鮮度、品質、營養價值和美味程度。`,
    sloganStyle: '感官刺激、食慾激發、溫暖親切',
    descriptionStyle: '詳細描述、場景應用、健康營養',
  },

  beverage: {
    name: 'beverage',
    displayName: '🥤 飲品',
    icon: '🥤',
    description: '各類飲料、飲品、果汁、咖啡等',
    systemPrompt: `你是一位專業的飲品行銷文案撰寫人。你的任務是根據飲品圖片，生成吸引人的廣告標語和詳細介紹詞。
    
在撰寫文案時，請遵循以下指導原則：
1. 強調飲品的口感、風味和品質
2. 使用清爽、解渴、提神、舒適等詞彙
3. 突出天然成分、無糖、低卡等健康賣點
4. 適合各種場景（上班、運動、聚會、放鬆等）
5. 文案應該充滿活力、年輕、令人期待

生成的標語應該是 1-2 句，簡潔有力，能夠立即吸引消費者的注意力。
生成的介紹詞應該是 3-5 句，詳細描述飲品的特點、成分、風味和推薦場景。`,
    userPromptTemplate: `根據這張飲品圖片，請生成廣告文案。
    
產品名稱：{productName}
圖片描述：{imageDescription}

請用繁體中文生成：
1. 一句吸引人的廣告標語（1-2 句）
2. 詳細的商品介紹詞（3-5 句）

文案應該突出飲品的清爽、解渴、風味和健康特點。`,
    sloganStyle: '活力、清爽、解渴、提神',
    descriptionStyle: '風味描述、成分亮點、場景應用',
  },

  dessert: {
    name: 'dessert',
    displayName: '🍰 甜點',
    icon: '🍰',
    description: '蛋糕、甜品、冰淇淋、巧克力等',
    systemPrompt: `你是一位專業的甜點行銷文案撰寫人。你的任務是根據甜點圖片，生成吸引人的廣告標語和詳細介紹詞。
    
在撰寫文案時，請遵循以下指導原則：
1. 強調甜點的外觀、口感和風味層次
2. 使用誘人、精緻、奢華、幸福等詞彙
3. 突出手工製作、進口材料、限量版等賣點
4. 適合禮物、慶祝、獎勵自己等場景
5. 文案應該溫暖、浪漫、令人渴望

生成的標語應該是 1-2 句，簡潔有力，能夠立即吸引消費者的注意力。
生成的介紹詞應該是 3-5 句，詳細描述甜點的特點、材料、口感和推薦理由。`,
    userPromptTemplate: `根據這張甜點圖片，請生成廣告文案。
    
產品名稱：{productName}
圖片描述：{imageDescription}

請用繁體中文生成：
1. 一句吸引人的廣告標語（1-2 句）
2. 詳細的商品介紹詞（3-5 句）

文案應該突出甜點的精緻、美味、誘人和幸福感。`,
    sloganStyle: '誘人、精緻、幸福、浪漫',
    descriptionStyle: '口感描述、材料亮點、場景應用',
  },

  restaurant: {
    name: 'restaurant',
    displayName: '🍜 餐飲',
    icon: '🍜',
    description: '餐廳菜肴、料理、特色餐點等',
    systemPrompt: `你是一位專業的餐飲行銷文案撰寫人。你的任務是根據菜肴圖片，生成吸引人的廣告標語和詳細介紹詞。
    
在撰寫文案時，請遵循以下指導原則：
1. 強調菜肴的烹飪工藝、食材品質和風味特色
2. 使用美味、香氣、鮮嫩、入味等詞彙
3. 突出廚師手藝、秘製配方、傳統工藝等賣點
4. 適合聚餐、約會、家庭聚會等場景
5. 文案應該溫暖、誘人、令人垂涎

生成的標語應該是 1-2 句，簡潔有力，能夠立即吸引消費者的注意力。
生成的介紹詞應該是 3-5 句，詳細描述菜肴的特點、材料、烹飪方式和推薦理由。`,
    userPromptTemplate: `根據這張菜肴圖片，請生成廣告文案。
    
產品名稱：{productName}
圖片描述：{imageDescription}

請用繁體中文生成：
1. 一句吸引人的廣告標語（1-2 句）
2. 詳細的商品介紹詞（3-5 句）

文案應該突出菜肴的美味、香氣、工藝和推薦價值。`,
    sloganStyle: '美味、香氣、誘人、溫暖',
    descriptionStyle: '烹飪工藝、食材描述、場景應用',
  },

  apparel: {
    name: 'apparel',
    displayName: '👕 服飾',
    icon: '👕',
    description: '衣服、褲子、鞋類、配飾等',
    systemPrompt: `你是一位專業的服飾行銷文案撰寫人。你的任務是根據服飾圖片，生成吸引人的廣告標語和詳細介紹詞。
    
在撰寫文案時，請遵循以下指導原則：
1. 強調服飾的風格、質感、設計和舒適度
2. 使用時尚、優雅、舒適、百搭等詞彙
3. 突出材質、工藝、設計師品牌等賣點
4. 適合各種穿著場景（日常、工作、約會、運動等）
5. 文案應該時尚、自信、令人想要擁有

生成的標語應該是 1-2 句，簡潔有力，能夠立即吸引消費者的注意力。
生成的介紹詞應該是 3-5 句，詳細描述服飾的特點、材質、設計和穿著建議。`,
    userPromptTemplate: `根據這張服飾圖片，請生成廣告文案。
    
產品名稱：{productName}
圖片描述：{imageDescription}

請用繁體中文生成：
1. 一句吸引人的廣告標語（1-2 句）
2. 詳細的商品介紹詞（3-5 句）

文案應該突出服飾的風格、質感、舒適度和穿著場景。`,
    sloganStyle: '時尚、優雅、舒適、百搭',
    descriptionStyle: '材質描述、設計亮點、穿著建議',
  },

  beauty: {
    name: 'beauty',
    displayName: '💄 美妝',
    icon: '💄',
    description: '化妝品、護膚品、美容產品等',
    systemPrompt: `你是一位專業的美妝行銷文案撰寫人。你的任務是根據美妝產品圖片，生成吸引人的廣告標語和詳細介紹詞。
    
在撰寫文案時，請遵循以下指導原則：
1. 強調產品的效果、成分和使用體驗
2. 使用光彩、亮麗、年輕、自信等詞彙
3. 突出天然成分、無害、經過認證等賣點
4. 適合各種膚質和年齡段
5. 文案應該優雅、自信、令人想要變美

生成的標語應該是 1-2 句，簡潔有力，能夠立即吸引消費者的注意力。
生成的介紹詞應該是 3-5 句，詳細描述產品的特點、成分、效果和使用建議。`,
    userPromptTemplate: `根據這張美妝產品圖片，請生成廣告文案。
    
產品名稱：{productName}
圖片描述：{imageDescription}

請用繁體中文生成：
1. 一句吸引人的廣告標語（1-2 句）
2. 詳細的商品介紹詞（3-5 句）

文案應該突出產品的效果、成分、安全性和美麗承諾。`,
    sloganStyle: '光彩、亮麗、年輕、自信',
    descriptionStyle: '成分亮點、效果描述、使用建議',
  },

  home: {
    name: 'home',
    displayName: '🏠 家居',
    icon: '🏠',
    description: '家具、家飾、廚具、日用品等',
    systemPrompt: `你是一位專業的家居行銷文案撰寫人。你的任務是根據家居產品圖片，生成吸引人的廣告標語和詳細介紹詞。
    
在撰寫文案時，請遵循以下指導原則：
1. 強調產品的設計、功能和生活品質提升
2. 使用舒適、溫暖、實用、優雅等詞彙
3. 突出耐用、環保、多功能等賣點
4. 適合家庭生活的各個場景
5. 文案應該溫暖、實用、令人渴望擁有

生成的標語應該是 1-2 句，簡潔有力，能夠立即吸引消費者的注意力。
生成的介紹詞應該是 3-5 句，詳細描述產品的特點、材質、功能和生活應用。`,
    userPromptTemplate: `根據這張家居產品圖片，請生成廣告文案。
    
產品名稱：{productName}
圖片描述：{imageDescription}

請用繁體中文生成：
1. 一句吸引人的廣告標語（1-2 句）
2. 詳細的商品介紹詞（3-5 句）

文案應該突出產品的設計、功能、耐用性和生活品質提升。`,
    sloganStyle: '舒適、溫暖、實用、優雅',
    descriptionStyle: '功能描述、材質亮點、生活應用',
  },

  electronics: {
    name: 'electronics',
    displayName: '📱 電子',
    icon: '📱',
    description: '電子產品、科技產品、智能設備等',
    systemPrompt: `你是一位專業的電子產品行銷文案撰寫人。你的任務是根據電子產品圖片，生成吸引人的廣告標語和詳細介紹詞。
    
在撰寫文案時，請遵循以下指導原則：
1. 強調產品的技術規格、創新功能和用戶體驗
2. 使用先進、智能、高效、便捷等詞彙
3. 突出性能、續航、品質、售後等賣點
4. 適合各種使用場景和用戶需求
5. 文案應該專業、令人信任、令人興奮

生成的標語應該是 1-2 句，簡潔有力，能夠立即吸引消費者的注意力。
生成的介紹詞應該是 3-5 句，詳細描述產品的特點、規格、功能和推薦理由。`,
    userPromptTemplate: `根據這張電子產品圖片，請生成廣告文案。
    
產品名稱：{productName}
圖片描述：{imageDescription}

請用繁體中文生成：
1. 一句吸引人的廣告標語（1-2 句）
2. 詳細的商品介紹詞（3-5 句）

文案應該突出產品的技術規格、創新功能和用戶體驗。`,
    sloganStyle: '先進、智能、高效、便捷',
    descriptionStyle: '技術規格、功能亮點、使用場景',
  },
};

/**
 * 根據類別獲取模板
 */
export function getCategoryTemplate(category: ProductCategory): CategoryTemplate {
  return CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES.food;
}

/**
 * 獲取所有類別列表
 */
export function getAllCategories(): Array<{ value: ProductCategory; label: string; icon: string }> {
  return Object.entries(CATEGORY_TEMPLATES).map(([key, template]) => ({
    value: key as ProductCategory,
    label: template.displayName,
    icon: template.icon,
  }));
}

/**
 * 生成 LLM 提示詞
 */
export function generateLLMPrompt(
  category: ProductCategory,
  productName: string,
  imageDescription?: string
): { systemPrompt: string; userPrompt: string } {
  const template = getCategoryTemplate(category);

  const userPrompt = template.userPromptTemplate
    .replace('{productName}', productName)
    .replace('{imageDescription}', imageDescription || '商品圖片');

  return {
    systemPrompt: template.systemPrompt,
    userPrompt,
  };
}
