import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getAllProducts,
  getProductWithDetails,
  getAllTags,
  getAllCustomFields,
  getDisplayLayout,
  getMarquee,
} from "./db";
import { getDb } from "./db";
import {
  products,
  tags,
  productTags,
  customFields,
  productFieldValues,
  displayLayout,
  marquee,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "./storage";
import { generateLLMPrompt, getAllCategories } from "../shared/categoryTemplates";

// 驗證圖片 URL 是否為有效的 S3 URL 或遠端 URL
function isValidImageUrl(url: string): boolean {
  if (!url) return true;
  // 允許 /manus-storage/ 開頭的相對路徑
  if (url.startsWith('/manus-storage/')) return true;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ===== 商品管理 API =====
  products: router({
    // 取得所有商品
    list: publicProcedure.query(async () => {
      return getAllProducts();
    }),

    // 取得單一商品詳細資訊
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return getProductWithDetails(input.id);
    }),

    // 新增商品
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          price: z.string(),
          imageUrl: z.string().optional(),
          videoUrl: z.string().optional(),
          description: z.string().optional(),
          category: z.enum(["food", "beverage", "dessert", "restaurant", "apparel", "beauty", "home", "electronics"]).optional(),
          tagIds: z.array(z.number()).optional(),
          fieldValues: z.array(z.object({ fieldId: z.number(), value: z.string() })).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // 驗證圖片 URL
        if (input.imageUrl && !isValidImageUrl(input.imageUrl)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid image URL. Must be a valid HTTP/HTTPS URL.",
          });
        }

        // 插入商品
        const result = await db.insert(products).values({
          name: input.name,
          price: input.price,
          imageUrl: input.imageUrl,
          videoUrl: input.videoUrl,
          description: input.description,
          category: input.category || "food",
        });

        const productId = result[0].insertId;

        // 插入標籤關聯
        if (input.tagIds && input.tagIds.length > 0) {
          for (const tagId of input.tagIds) {
            await db.insert(productTags).values({ productId: Number(productId), tagId });
          }
        }

        // 插入自定義欄位值
        if (input.fieldValues && input.fieldValues.length > 0) {
          for (const fv of input.fieldValues) {
            await db.insert(productFieldValues).values({
              productId: Number(productId),
              fieldId: fv.fieldId,
              value: fv.value,
            });
          }
        }

        return { id: productId };
      }),

    // 更新商品
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          price: z.string().optional(),
          imageUrl: z.string().optional(),
          videoUrl: z.string().optional(),
          description: z.string().optional(),
          tagIds: z.array(z.number()).optional(),
          fieldValues: z.array(z.object({ fieldId: z.number(), value: z.string() })).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // 驗證圖片 URL
        if (input.imageUrl !== undefined && input.imageUrl && !isValidImageUrl(input.imageUrl)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid image URL. Must be a valid HTTP/HTTPS URL.",
          });
        }

        const updateData: Record<string, unknown> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.price !== undefined) updateData.price = input.price;
        if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
        if (input.videoUrl !== undefined) updateData.videoUrl = input.videoUrl;
        if (input.description !== undefined) updateData.description = input.description;

        if (Object.keys(updateData).length > 0) {
          await db.update(products).set(updateData).where(eq(products.id, input.id));
        }

        // 更新標籤
        if (input.tagIds !== undefined) {
          await db.delete(productTags).where(eq(productTags.productId, input.id));
          for (const tagId of input.tagIds) {
            await db.insert(productTags).values({ productId: input.id, tagId });
          }
        }

        // 更新自定義欄位值
        if (input.fieldValues !== undefined) {
          await db.delete(productFieldValues).where(eq(productFieldValues.productId, input.id));
          for (const fv of input.fieldValues) {
            await db.insert(productFieldValues).values({
              productId: input.id,
              fieldId: fv.fieldId,
              value: fv.value,
            });
          }
        }

        return { success: true };
      }),

    // 刪除商品
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.update(products).set({ isActive: "false" }).where(eq(products.id, input.id));
      return { success: true };
    }),
  }),

  // ===== 標籤管理 API =====
  tags: router({
    list: publicProcedure.query(async () => {
      return getAllTags();
    }),

    create: protectedProcedure
      .input(z.object({ name: z.string().min(1), color: z.string().optional() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const result = await db.insert(tags).values({
          name: input.name,
          color: input.color || "#FFB703",
        });

        return { id: result[0].insertId };
      }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), color: z.string().optional() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const updateData: Record<string, unknown> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.color !== undefined) updateData.color = input.color;

        await db.update(tags).set(updateData).where(eq(tags.id, input.id));
        return { success: true };
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.delete(tags).where(eq(tags.id, input.id));
      return { success: true };
    }),
  }),

  // ===== 自定義欄位管理 API =====
  customFields: router({
    list: publicProcedure.query(async () => {
      return getAllCustomFields();
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          fieldType: z.enum(["text", "textarea", "number", "select"]).optional(),
          isRequired: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const result = await db.insert(customFields).values({
          name: input.name,
          fieldType: input.fieldType || "text",
          isRequired: input.isRequired ? 1 : 0,
        });

        return { id: result[0].insertId };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          fieldType: z.enum(["text", "textarea", "number", "select"]).optional(),
          isRequired: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const updateData: Record<string, unknown> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.fieldType !== undefined) updateData.fieldType = input.fieldType;
        if (input.isRequired !== undefined) updateData.isRequired = input.isRequired ? 1 : 0;

        await db.update(customFields).set(updateData).where(eq(customFields.id, input.id));
        return { success: true };
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.delete(customFields).where(eq(customFields.id, input.id));
      return { success: true };
    }),
  }),

  // ===== 版面配置 API =====
  layout: router({
    get: publicProcedure.query(async () => {
      return getDisplayLayout();
    }),

    update: protectedProcedure
      .input(
        z.object({
          gridCount: z.number().min(1).max(8).optional(),
          carouselMode: z.enum(["single", "2items", "3items", "6items", "8items", "static"]).optional(),
          intervalSeconds: z.number().min(1).optional(),
          selectedProductIds: z.array(z.number()).optional(),
          backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
          backgroundImageUrl: z.string().optional().nullable(),
          backgroundImageOpacity: z.number().min(0).max(100).optional(),
          animationType: z.enum(["fade", "slide"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const existing = await getDisplayLayout();

        if (existing) {
          const updateData: Record<string, unknown> = {};
          if (input.gridCount !== undefined) updateData.gridCount = input.gridCount;
          if (input.carouselMode !== undefined) updateData.carouselMode = input.carouselMode;
          if (input.intervalSeconds !== undefined) updateData.intervalSeconds = input.intervalSeconds;
          if (input.selectedProductIds !== undefined) updateData.selectedProductIds = JSON.stringify(input.selectedProductIds);
          if (input.backgroundColor !== undefined) updateData.backgroundColor = input.backgroundColor;
          if (input.backgroundImageUrl !== undefined) updateData.backgroundImageUrl = input.backgroundImageUrl;
          if (input.backgroundImageOpacity !== undefined) updateData.backgroundImageOpacity = input.backgroundImageOpacity;
          if (input.animationType !== undefined) updateData.animationType = input.animationType;

          await db.update(displayLayout).set(updateData).where(eq(displayLayout.id, existing.id));
        } else {
          await db.insert(displayLayout).values({
            gridCount: input.gridCount || 6,
            carouselMode: input.carouselMode || "6items",
            intervalSeconds: input.intervalSeconds || 8,
            selectedProductIds: JSON.stringify(input.selectedProductIds || []),
            backgroundColor: input.backgroundColor || "#000000",
            backgroundImageUrl: input.backgroundImageUrl || null,
            backgroundImageOpacity: input.backgroundImageOpacity || 100,
            animationType: input.animationType || "fade",
          });
        }

        return { success: true };
      }),
  }),

  // ===== 分析 API =====
  analytics: router({
    trackEvent: publicProcedure
      .input(
        z.object({
          productId: z.number(),
          eventType: z.enum(["impression", "click"]),
        })
      )
      .mutation(async ({ input }) => {
        const { trackProductEvent } = await import("./db");
        await trackProductEvent(input.productId, input.eventType);
        return { success: true };
      }),

    getProductStats: publicProcedure
      .input(
        z.object({
          productId: z.number().optional(),
          days: z.number().default(30),
        })
      )
      .query(async ({ input }) => {
        const { getProductStats } = await import("./db");
        return await getProductStats(input.productId, input.days);
      }),

    getProductSummary: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        const { getProductSummary } = await import("./db");
        return await getProductSummary(input.productId);
      }),

    getAllProductsSummary: publicProcedure.query(async () => {
      const { getAllProductsSummary } = await import("./db");
      return await getAllProductsSummary();
    }),
  }),

  // ===== AI 文案生成 API =====
  ai: router({
    generateProductCopy: protectedProcedure
      .input(
        z.object({
          imageUrl: z.string(),
          productName: z.string().optional(),
          category: z.enum(["food", "beverage", "dessert", "restaurant", "apparel", "beauty", "home", "electronics"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");

        try {
          // 根據類別獲取對應的模板和提示詞
          const category = (input.category || "food") as any;
          const { systemPrompt, userPrompt } = generateLLMPrompt(
            category,
            input.productName || "商品",
            "商品圖片"
          );

          // 轉換相對路徑為完整 URL（LLM 需要可訪問的 HTTP/HTTPS URL）
          let imageUrl = input.imageUrl;
          if (imageUrl.startsWith('/manus-storage/')) {
            // 使用環境變量中的 API 基礎 URL
            const apiUrl = process.env.BUILT_IN_FORGE_API_URL || 'https://api.manus.im';
            imageUrl = `${apiUrl}${imageUrl}`;
          }

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: userPrompt,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: imageUrl,
                      detail: "high",
                    },
                  },
                ],
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "product_copy",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    slogan: { type: "string" },
                    description: { type: "string" },
                  },
                  required: ["slogan", "description"],
                  additionalProperties: false,
                },
              },
            },
          });

          if (!response || !response.choices || response.choices.length === 0) {
            throw new Error("Invalid response from LLM service");
          }

          const choice = response.choices[0];
          if (!choice || !choice.message) {
            throw new Error("Missing message in LLM response");
          }

          const content = choice.message.content;
          if (!content) {
            throw new Error("Empty content from LLM");
          }

          let parsed;
          try {
            const contentStr = typeof content === "string" ? content : JSON.stringify(content);
            parsed = JSON.parse(contentStr);
          } catch (parseError) {
            console.error("[AI] Failed to parse LLM response:", content, parseError);
            throw new Error(`Failed to parse LLM response`);
          }

          if (!parsed.slogan || !parsed.description) {
            throw new Error("LLM response missing required fields");
          }

          return {
            slogan: parsed.slogan,
            description: parsed.description,
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error("[AI] Failed to generate product copy:", errorMsg);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to generate product copy. Please try again.`,
          });
        }
      }),
  }),

  // ===== 跑馬燈 API =====
  marquee: router({
    get: publicProcedure.query(async () => {
      return getMarquee();
    }),

    update: protectedProcedure
      .input(
        z.object({
          text: z.string().optional(),
          scrollSpeed: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const existing = await getMarquee();

        if (existing) {
          const updateData: Record<string, unknown> = {};
          if (input.text !== undefined) updateData.text = input.text;
          if (input.scrollSpeed !== undefined) updateData.scrollSpeed = input.scrollSpeed;
          if (input.isActive !== undefined) updateData.isActive = input.isActive ? "true" : "false";

          await db.update(marquee).set(updateData).where(eq(marquee.id, existing.id));
        } else {
          await db.insert(marquee).values({
            text: input.text || "",
            scrollSpeed: input.scrollSpeed || 50,
            isActive: input.isActive !== false ? "true" : "false",
          });
        }

        return { success: true };
      }),
  }),

  // ===== S3 Storage API =====
  storage: router({
    uploadImage: protectedProcedure
      .input(
        z.object({
          imageData: z.string(),
          fileName: z.string(),
          mimeType: z.string().default("image/jpeg"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const buffer = Buffer.from(input.imageData.split(",")[1] || input.imageData, "base64");
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 8);
          const fileKey = `products/${timestamp}-${randomStr}-${input.fileName}`;
          const { url } = await storagePut(fileKey, buffer, input.mimeType);
          return {
            success: true,
            url,
            key: fileKey,
          };
        } catch (error) {
          console.error("[Storage] Failed to upload image:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to upload image to storage",
          });
        }
      }),

    // 批量上傳圖片
    batchUploadImages: protectedProcedure
      .input(
        z.object({
          images: z.array(
            z.object({
              imageData: z.string(),
              fileName: z.string(),
              mimeType: z.string().default("image/jpeg"),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const results = [];
        for (const image of input.images) {
          try {
            const buffer = Buffer.from(image.imageData.split(",")[1] || image.imageData, "base64");
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            const fileKey = `products/${timestamp}-${randomStr}-${image.fileName}`;
            const { url } = await storagePut(fileKey, buffer, image.mimeType);
            results.push({
              success: true,
              fileName: image.fileName,
              url,
              key: fileKey,
            });
          } catch (error) {
            results.push({
              success: false,
              fileName: image.fileName,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
        return { results };
      }),

    // 批量生成 AI 文案
    batchGenerateCopy: protectedProcedure
      .input(
        z.object({
          imageUrls: z.array(z.string()),
        })
      )
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const results = [];

        for (const imageUrl of input.imageUrls) {
          try {
            const response = await invokeLLM({
              messages: [
                {
                  role: "system",
                  content: "You are a marketing copywriter. Analyze the product image and generate compelling advertising copy.",
                },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: "請分析這個商品圖片，生成一個吸引人的廣告標語（1-2句）和詳細的商品介紹詞（3-5句）。請以 JSON 格式回應：{\"slogan\": \"...\", \"description\": \"...\"}",
                    },
                    {
                      type: "image_url",
                      image_url: { url: imageUrl },
                    },
                  ],
                },
              ],
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: "product_copy",
                  strict: true,
                  schema: {
                    type: "object",
                    properties: {
                      slogan: { type: "string" },
                      description: { type: "string" },
                    },
                    required: ["slogan", "description"],
                  },
                },
              },
            });

            const content = response.choices?.[0]?.message?.content;
            if (!content) throw new Error("No response from LLM");

            const contentStr = typeof content === "string" ? content : JSON.stringify(content);
            const parsed = JSON.parse(contentStr);

            results.push({
              success: true,
              imageUrl,
              slogan: parsed.slogan,
              description: parsed.description,
            });
          } catch (error) {
            results.push({
              success: false,
              imageUrl,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        return { results };
      }),

    // 批量建立商品
    batchCreateProducts: protectedProcedure
      .input(
        z.object({
          products: z.array(
            z.object({
              name: z.string().min(1),
              price: z.string(),
              imageUrl: z.string().optional(),
              videoUrl: z.string().optional(),
              description: z.string().optional(),
              tagIds: z.array(z.number()).optional(),
              fieldValues: z.array(z.object({ fieldId: z.number(), value: z.string() })).optional(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const results = [];

        for (const productData of input.products) {
          try {
            // 驗證圖片 URL
            if (productData.imageUrl && !isValidImageUrl(productData.imageUrl)) {
              throw new Error("Invalid image URL");
            }

            // 插入商品
            const result = await db.insert(products).values({
              name: productData.name,
              price: productData.price,
              imageUrl: productData.imageUrl,
              videoUrl: productData.videoUrl,
              description: productData.description,
            });

            const productId = result[0].insertId;

            // 插入標籤
            if (productData.tagIds && productData.tagIds.length > 0) {
              for (const tagId of productData.tagIds) {
                await db.insert(productTags).values({ productId: Number(productId), tagId });
              }
            }

            // 插入自定義欄位值
            if (productData.fieldValues && productData.fieldValues.length > 0) {
              for (const fv of productData.fieldValues) {
                await db.insert(productFieldValues).values({
                  productId: Number(productId),
                  fieldId: fv.fieldId,
                  value: fv.value,
                });
              }
            }

            results.push({
              success: true,
              productName: productData.name,
              productId,
            });
          } catch (error) {
            results.push({
              success: false,
              productName: productData.name,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        return { results };
      }),

    // 重新排序商品
    reorder: protectedProcedure
      .input(
        z.object({
          products: z.array(
            z.object({
              id: z.number(),
              displayOrder: z.number(),
              isPinned: z.string().optional(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        for (const product of input.products) {
          const updateData: Record<string, unknown> = { displayOrder: product.displayOrder };
          if (product.isPinned !== undefined) {
            updateData.isPinned = product.isPinned;
          }
          await db.update(products).set(updateData).where(eq(products.id, product.id));
        }

        return { success: true };
      }),

    // 切換置頂狀態
    togglePin: protectedProcedure
      .input(z.object({ productId: z.number(), isPinned: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await db.update(products).set({ isPinned: input.isPinned as "true" | "false" }).where(eq(products.id, input.productId));
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
