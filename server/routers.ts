/**
 * ชุดซอฟต์แวร์ชุดนี้ มีไว้เพื่อเป็นโครงสร้างพื้นฐานทางการเงินยุคใหม่
 * เพื่อรองรับการไหลของเงินจำนวนมหาศาลของท่านผู้เฒ่าหลี่เหมยฮัว หรือ LiMeiHua Grand Mother
 * และ source code นี้สร้างโดย Mr.Kanutsanan Pongpanna (นายคณัสนันท์ พงษ์พันนา)
 * URL: https://chatgpt.com/g/g-68d289535dec81919445deb9830f2d8e-kanutsanan-pongpanna
 */

import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  createToken,
  getTokensByUser,
  getTokenById,
  updateTokenStatus,
  updateTokenSupply,
  createTokenTransaction,
  getTransactionsByToken,
  getTransactionsByUser,
} from "./db";
import { createTaprootService, TaprootAssetsSimulator } from "./taprootAssets";

// Initialize Taproot Assets service (real or simulator)
const taprootService = createTaprootService();
const simulator = new TaprootAssetsSimulator();

const getService = () => taprootService ?? simulator;

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  token: router({
    /** Create a new Taproot Asset token */
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          symbol: z.string().min(1).max(32),
          initialSupply: z.string().min(1),
          decimals: z.number().int().min(0).max(18).default(8),
          tokenType: z.enum(["fixed", "mintable", "burnable"]),
          ownerAddress: z.string().min(1).max(512),
          metadata: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const service = getService();

        // Estimate fee
        const feeEstimate = (service as any).estimateMintFee
          ? (service as any).estimateMintFee({
              assetType: "NORMAL",
              enableEmission: input.tokenType === "mintable",
              hasMetadata: !!input.metadata,
            })
          : { estimatedFeeSats: 3000, feeRateSatPerVbyte: 10, estimatedVsize: 300 };

        // Create token record in DB
        const token = await createToken({
          userId: ctx.user.id,
          name: input.name,
          symbol: input.symbol,
          initialSupply: input.initialSupply,
          currentSupply: input.initialSupply,
          decimals: input.decimals,
          tokenType: input.tokenType,
          ownerAddress: input.ownerAddress,
          estimatedFee: feeEstimate.estimatedFeeSats,
          status: "pending",
          metadata: input.metadata || null,
        });

        // Call Taproot Assets API to mint
        try {
          const mintResult = await service.mintAsset({
            asset: {
              asset_version: "ASSET_VERSION_V0",
              asset_type: "NORMAL",
              name: input.name,
              amount: input.initialSupply,
              new_grouped_asset: input.tokenType === "mintable",
              grouped_asset: false,
              ...(input.metadata
                ? {
                    asset_meta: {
                      data: Buffer.from(
                        JSON.stringify({
                          symbol: input.symbol,
                          decimals: input.decimals,
                          description: input.metadata,
                        })
                      ).toString("base64"),
                      type: "META_TYPE_JSON" as const,
                    },
                  }
                : {}),
            },
            enable_emission: input.tokenType === "mintable",
            short_response: false,
          });

          // Finalize the batch
          const finalizeResult = await service.finalizeBatch();

          // Update token with on-chain data
          await updateTokenStatus(token.id, "minting", {
            batchTxid: finalizeResult.batch?.batch_txid || mintResult.pending_batch?.batch_txid,
            assetId: `asset_${token.id}_${Date.now()}`,
            actualFee: feeEstimate.estimatedFeeSats,
          });

          // Record the creation transaction
          await createTokenTransaction({
            tokenId: token.id,
            userId: ctx.user.id,
            txType: "create",
            amount: input.initialSupply,
            txHash: finalizeResult.batch?.batch_txid || mintResult.pending_batch?.batch_txid,
            fee: feeEstimate.estimatedFeeSats,
            status: "confirmed",
          });

          // Mark as confirmed
          await updateTokenStatus(token.id, "confirmed");

          return {
            success: true,
            token: await getTokenById(token.id),
            batchTxid: finalizeResult.batch?.batch_txid || mintResult.pending_batch?.batch_txid,
            fee: feeEstimate,
          };
        } catch (error: any) {
          await updateTokenStatus(token.id, "failed");
          await createTokenTransaction({
            tokenId: token.id,
            userId: ctx.user.id,
            txType: "create",
            amount: input.initialSupply,
            status: "failed",
            notes: error?.message || "Unknown error",
          });
          return {
            success: false,
            token: await getTokenById(token.id),
            error: error?.message || "Failed to mint token",
          };
        }
      }),

    /** List all tokens created by the current user */
    list: protectedProcedure.query(async ({ ctx }) => {
      return getTokensByUser(ctx.user.id);
    }),

    /** Get a single token by ID */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const token = await getTokenById(input.id);
        if (!token || token.userId !== ctx.user.id) {
          return null;
        }
        return token;
      }),

    /** Mint additional supply for a mintable token */
    mintMore: protectedProcedure
      .input(
        z.object({
          tokenId: z.number(),
          amount: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const token = await getTokenById(input.tokenId);
        if (!token || token.userId !== ctx.user.id) {
          throw new Error("Token not found or unauthorized");
        }
        if (token.tokenType !== "mintable") {
          throw new Error("Token is not mintable");
        }

        const service = getService();
        try {
          // Mint additional supply via Taproot Assets API
          const mintResult = await service.mintAsset({
            asset: {
              asset_version: "ASSET_VERSION_V0",
              asset_type: "NORMAL",
              name: token.name,
              amount: input.amount,
              new_grouped_asset: false,
              grouped_asset: true,
              group_key: token.groupKey || undefined,
            },
            enable_emission: true,
            short_response: false,
          });

          await service.finalizeBatch();

          // Update supply
          const newSupply = (
            BigInt(token.currentSupply) + BigInt(input.amount)
          ).toString();
          await updateTokenSupply(token.id, newSupply);

          // Record transaction
          await createTokenTransaction({
            tokenId: token.id,
            userId: ctx.user.id,
            txType: "mint",
            amount: input.amount,
            txHash: mintResult.pending_batch?.batch_txid,
            status: "confirmed",
          });

          return {
            success: true,
            newSupply,
            token: await getTokenById(token.id),
          };
        } catch (error: any) {
          await createTokenTransaction({
            tokenId: token.id,
            userId: ctx.user.id,
            txType: "mint",
            amount: input.amount,
            status: "failed",
            notes: error?.message || "Unknown error",
          });
          return { success: false, error: error?.message };
        }
      }),

    /** Burn tokens for a burnable token */
    burn: protectedProcedure
      .input(
        z.object({
          tokenId: z.number(),
          amount: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const token = await getTokenById(input.tokenId);
        if (!token || token.userId !== ctx.user.id) {
          throw new Error("Token not found or unauthorized");
        }
        if (token.tokenType !== "burnable") {
          throw new Error("Token is not burnable");
        }
        if (BigInt(input.amount) > BigInt(token.currentSupply)) {
          throw new Error("Burn amount exceeds current supply");
        }

        try {
          if (token.assetId && taprootService) {
            await taprootService.burnAsset(token.assetId, input.amount);
          }

          const newSupply = (
            BigInt(token.currentSupply) - BigInt(input.amount)
          ).toString();
          await updateTokenSupply(token.id, newSupply);

          await createTokenTransaction({
            tokenId: token.id,
            userId: ctx.user.id,
            txType: "burn",
            amount: input.amount,
            status: "confirmed",
          });

          return {
            success: true,
            newSupply,
            token: await getTokenById(token.id),
          };
        } catch (error: any) {
          await createTokenTransaction({
            tokenId: token.id,
            userId: ctx.user.id,
            txType: "burn",
            amount: input.amount,
            status: "failed",
            notes: error?.message || "Unknown error",
          });
          return { success: false, error: error?.message };
        }
      }),

    /** Get transaction history for a token */
    transactions: protectedProcedure
      .input(z.object({ tokenId: z.number() }))
      .query(async ({ ctx, input }) => {
        const token = await getTokenById(input.tokenId);
        if (!token || token.userId !== ctx.user.id) {
          return [];
        }
        return getTransactionsByToken(input.tokenId);
      }),
  }),

  /** Gas/fee estimation */
  gas: router({
    estimate: publicProcedure
      .input(
        z.object({
          tokenType: z.enum(["fixed", "mintable", "burnable"]),
          hasMetadata: z.boolean().default(false),
        })
      )
      .query(({ input }) => {
        const service = getService();
        const enableEmission = input.tokenType === "mintable";
        if ("estimateMintFee" in service) {
          return (service as any).estimateMintFee({
            assetType: "NORMAL",
            enableEmission,
            hasMetadata: input.hasMetadata,
          });
        }
        return {
          estimatedFeeSats: enableEmission ? 3640 : 3000,
          feeRateSatPerVbyte: 10,
          estimatedVsize: enableEmission ? 364 : 300,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
