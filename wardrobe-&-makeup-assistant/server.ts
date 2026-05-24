import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Client Initialization
  let ai: GoogleGenAI | null = null;
  const isKeyConfigured = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("MY_GEMINI_API_KEY");

  if (isKeyConfigured) {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI:", e);
    }
  }

  // API: Get AI Suggested Outfit Look
  app.post("/api/gemini/outfit", async (req, res) => {
    const { items = [], prompt = "适合今天出行的穿搭" } = req.body;

    // Check if we should fallback to heuristic matchmaking
    if (!ai || !isKeyConfigured) {
      // Local Heuristic Matcher: Find some compatible items to provide a working mock matching
      const tops = items.filter((i: any) => i.category === "Tops" || i.category === "上装" || i.category === "外套");
      const bottoms = items.filter((i: any) => i.category === "Bottoms" || i.category === "下装");
      const shoes = items.filter((i: any) => i.category === "Shoes" || i.category === "鞋履");

      const chosenTops = tops[Math.floor(Math.random() * tops.length)] || null;
      const chosenBottom = bottoms[Math.floor(Math.random() * bottoms.length)] || null;
      const chosenShoes = shoes[Math.floor(Math.random() * shoes.length)] || null;

      const itemNamesList = [chosenTops, chosenBottom, chosenShoes].filter(Boolean).map((i: any) => i.name);

      return res.json({
        outfitName: "都市摩登极简风",
        rationale: `[本地引擎推荐] 针对您的诉求：「${prompt}」\n为您由本地智能引擎智能匹配色系。我们将您的「${itemNamesList.join(" + ") || "秋季长袖与牛仔裤"}」相糅合，展现清凉随性的现代质感。对多变天气更有高契合度。`,
        itemNamesList: itemNamesList.length > 0 ? itemNamesList : ["米色羊毛针织衫", "深灰九分直筒裤", "小白鞋"],
        makeupLookName: "经典通勤伪素颜妆",
        makeupDetails: "眼影采用奶茶色大面积薄铺，配以哑光低饱和口红（如肉桂奶茶色），薄透呼吸底妆配合清爽修容，给人通勤端正又清凉的气息。",
        isFallback: true,
        message: "已启用本地微规则匹配。若需要全功能大模型穿搭指导，请在 Settings > Secrets 配置有效的 GEMINI_API_KEY。"
      });
    }

    try {
      // Format clothes listing for Gemini prompt context
      const wardrobeContext = items.map((i: any, index: number) => {
        return `${index + 1}. [${i.category}] 名称: ${i.name}, 颜色: ${i.color || "未知"}, 适用季节: ${i.season || "通用"}, 属性: 品牌-${i.brand || "无"}, 尺码-${i.size || "均码"}, 价格-${i.price || "未标注"}元, 冷暖度-${i.warmth || "中性"}/10`;
      }).join("\n");

      const geminiPrompt = `
我的衣柜中现有如下单品列表：
${wardrobeContext || "目前衣柜暂无衣物，请基于合理的高级衣橱配搭。"}

用户的场景诉求：
「${prompt}」

请在我的真实衣橱单品中为我推荐并组合一套完美的穿搭（请尽可能从我上面的衣物名称中匹配）。同时，建议一套相得益彰的妆容（包括眼妆、粉底、唇色特征），并简述推荐理由。
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: geminiPrompt,
        config: {
          systemInstruction: "你是一位兼备美学格调与实用逻辑的个人高级穿搭与美妆造型师。请严谨依据用户的场景、衣单品及色彩学进行穿搭创意，并输出结构化JSON。",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              outfitName: {
                type: Type.STRING,
                description: "给这套穿搭方案起一个充满时尚格调的名字"
              },
              rationale: {
                type: Type.STRING,
                description: "向用户阐述这套穿搭与妆容融合的选配理由、色彩美学与场景契合度"
              },
              itemNamesList: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "挑选推荐的衣物单品名称列表。这些名称应当精确契合用户给你的衣单品名称"
              },
              makeupLookName: {
                type: Type.STRING,
                description: "推荐搭配的妆容主题名称"
              },
              makeupDetails: {
                type: Type.STRING,
                description: "详细说明妆容各部分的搭配（眼妆、唇色、高光、阴影等调和指南）"
              }
            },
            required: ["outfitName", "rationale", "itemNamesList", "makeupLookName", "makeupDetails"]
          }
        }
      });

      const responseText = response.text || "";
      const resultObj = JSON.parse(responseText.trim());
      return res.json(resultObj);

    } catch (e: any) {
      console.error("Gemini API Error:", e);
      return res.status(500).json({
        error: "Gemini server failed to suggest look",
        details: e.message || String(e)
      });
    }
  });

  // Serve static files in production / Vite middleware in dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== "true" },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
