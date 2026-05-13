import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Products API", () => {
  it("should list products", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a product", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.create({
      name: "Test Product",
      price: "99.99",
      description: "Test Description",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });
});

describe("Tags API", () => {
  it("should list tags", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tags.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a tag", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tags.create({
      name: "Special Offer",
      color: "#FF5733",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });
});

describe("Custom Fields API", () => {
  it("should list custom fields", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.customFields.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a custom field", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.customFields.create({
      name: "Ingredients",
      fieldType: "textarea",
      isRequired: true,
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });
});

describe("Layout API", () => {
  it("should get layout", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.layout.get();
    // Layout can be null or an object
    expect(result === null || typeof result === "object").toBe(true);
  });

  it("should update layout", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.layout.update({
      gridCount: 6,
      carouselMode: "6items",
      intervalSeconds: 8,
      selectedProductIds: [],
    });

    expect(result).toEqual({ success: true });
  });
});

describe("Marquee API", () => {
  it("should get marquee", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.marquee.get();
    // Marquee can be null or an object
    expect(result === null || typeof result === "object").toBe(true);
  });

  it("should update marquee", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.marquee.update({
      text: "Welcome to our store!",
      scrollSpeed: 50,
      isActive: true,
    });

    expect(result).toEqual({ success: true });
  });
});
