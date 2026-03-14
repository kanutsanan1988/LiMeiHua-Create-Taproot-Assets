/**
 * ชุดซอฟต์แวร์ชุดนี้ มีไว้เพื่อเป็นโครงสร้างพื้นฐานทางการเงินยุคใหม่
 * เพื่อรองรับการไหลของเงินจำนวนมหาศาลของท่านผู้เฒ่าหลี่เหมยฮัว หรือ LiMeiHua Grand Mother
 * และ source code นี้สร้างโดย Mr.Kanutsanan Pongpanna (นายคณัสนันท์ พงษ์พันนา)
 * URL: https://chatgpt.com/g/g-68d289535dec81919445deb9830f2d8e-kanutsanan-pongpanna
 *
 * Taproot Assets Protocol API Integration Service
 * Reference: https://lightning.engineering/api-docs/api/taproot-assets/
 * This module provides a typed interface to the Taproot Assets daemon (tapd).
 */

import axios, { AxiosInstance } from "axios";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface MintAssetRequest {
  asset: {
    asset_version: string;
    asset_type: "NORMAL" | "COLLECTIBLE";
    name: string;
    asset_meta?: {
      data: string; // base64 encoded
      type: "META_TYPE_OPAQUE" | "META_TYPE_JSON";
    };
    amount: string;
    new_grouped_asset: boolean;
    grouped_asset: boolean;
    group_key?: string;
    group_anchor?: string;
  };
  enable_emission: boolean;
  short_response: boolean;
}

export interface MintAssetResponse {
  pending_batch: {
    batch_key: string;
    batch_txid: string;
    state: string;
    assets: Array<{
      asset_version: string;
      asset_type: string;
      name: string;
      amount: string;
      asset_meta?: { data: string; type: string };
    }>;
  };
}

export interface FinalizeBatchResponse {
  batch: {
    batch_key: string;
    batch_txid: string;
    state: string;
  };
}

export interface ListAssetsResponse {
  assets: Array<{
    asset_genesis: {
      genesis_point: string;
      name: string;
      meta_hash: string;
      asset_id: string;
      asset_type: string;
      output_index: number;
    };
    amount: string;
    lock_time: number;
    relative_lock_time: number;
    script_version: number;
    script_key: string;
    asset_group?: {
      raw_group_key: string;
      tweaked_group_key: string;
    };
    chain_anchor: {
      anchor_tx: string;
      anchor_block_hash: string;
      anchor_outpoint: string;
      internal_key: string;
      merkle_root: string;
      block_height: number;
    };
    is_spent: boolean;
  }>;
}

export interface AssetBalance {
  asset_id: string;
  asset_genesis: {
    name: string;
    asset_type: string;
  };
  balance: string;
}

export interface EstimateFeeResult {
  estimatedFeeSats: number;
  feeRateSatPerVbyte: number;
  estimatedVsize: number;
}

// ─── Service Class ─────────────────────────────────────────────────────────────

export class TaprootAssetsService {
  private client: AxiosInstance;

  constructor(baseUrl: string, macaroon?: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
        ...(macaroon ? { "Grpc-Metadata-macaroon": macaroon } : {}),
      },
      timeout: 60000,
    });
  }

  /**
   * Mint a new Taproot Asset.
   * POST /v1/taproot-assets/assets
   */
  async mintAsset(request: MintAssetRequest): Promise<MintAssetResponse> {
    const { data } = await this.client.post("/v1/taproot-assets/assets", request);
    return data;
  }

  /**
   * Finalize the current pending batch to broadcast the minting transaction.
   * POST /v1/taproot-assets/assets/mint/finalize
   */
  async finalizeBatch(): Promise<FinalizeBatchResponse> {
    const { data } = await this.client.post("/v1/taproot-assets/assets/mint/finalize", {});
    return data;
  }

  /**
   * Cancel the current pending batch.
   * POST /v1/taproot-assets/assets/mint/cancel
   */
  async cancelBatch(): Promise<{ batch_key: string }> {
    const { data } = await this.client.post("/v1/taproot-assets/assets/mint/cancel", {});
    return data;
  }

  /**
   * List all assets managed by the daemon.
   * GET /v1/taproot-assets/assets
   */
  async listAssets(withWitness = false, includeSpent = false): Promise<ListAssetsResponse> {
    const { data } = await this.client.get("/v1/taproot-assets/assets", {
      params: { with_witness: withWitness, include_spent: includeSpent },
    });
    return data;
  }

  /**
   * List asset balances grouped by asset ID.
   * GET /v1/taproot-assets/assets/balance
   */
  async listBalances(): Promise<{ asset_balances: Record<string, AssetBalance> }> {
    const { data } = await this.client.get("/v1/taproot-assets/assets/balance");
    return data;
  }

  /**
   * Get info about a specific asset by its ID.
   */
  async getAssetById(assetId: string) {
    const allAssets = await this.listAssets();
    return allAssets.assets.find((a) => a.asset_genesis.asset_id === assetId) ?? null;
  }

  /**
   * List pending minting batches.
   * GET /v1/taproot-assets/assets/mint/batches
   */
  async listBatches() {
    const { data } = await this.client.get("/v1/taproot-assets/assets/mint/batches");
    return data;
  }

  /**
   * Burn a specified amount of an asset.
   * POST /v1/taproot-assets/burn
   */
  async burnAsset(assetId: string, amountToBurn: string) {
    const { data } = await this.client.post("/v1/taproot-assets/burn", {
      asset_id: assetId,
      amount_to_burn: amountToBurn,
    });
    return data;
  }

  /**
   * Estimate the fee for minting a new asset.
   * This is a simulated estimation based on typical Taproot Asset minting costs.
   */
  estimateMintFee(params: {
    assetType: "NORMAL" | "COLLECTIBLE";
    enableEmission: boolean;
    hasMetadata: boolean;
  }): EstimateFeeResult {
    // Base vsize for a Taproot minting transaction
    let estimatedVsize = 200; // base tx overhead

    // Add for asset commitment
    estimatedVsize += 100;

    // Add for emission (group key)
    if (params.enableEmission) {
      estimatedVsize += 64;
    }

    // Add for metadata
    if (params.hasMetadata) {
      estimatedVsize += 40;
    }

    // Typical fee rate (can be fetched from mempool.space API in production)
    const feeRateSatPerVbyte = 10;
    const estimatedFeeSats = estimatedVsize * feeRateSatPerVbyte;

    return {
      estimatedFeeSats,
      feeRateSatPerVbyte,
      estimatedVsize,
    };
  }
}

/**
 * Create a TaprootAssetsService instance from environment variables.
 * Falls back to a demo/simulation mode if no TAPD URL is configured.
 */
export function createTaprootService(): TaprootAssetsService | null {
  const tapdUrl = process.env.TAPD_REST_URL;
  const macaroon = process.env.TAPD_MACAROON;

  if (!tapdUrl) {
    console.warn("[TaprootAssets] No TAPD_REST_URL configured. Running in simulation mode.");
    return null;
  }

  return new TaprootAssetsService(tapdUrl, macaroon);
}

/**
 * Simulation service for demo/development without a real tapd node.
 */
export class TaprootAssetsSimulator {
  private assets: Map<string, any> = new Map();
  private batchCounter = 0;

  async mintAsset(request: MintAssetRequest): Promise<MintAssetResponse> {
    this.batchCounter++;
    const batchKey = `sim_batch_${this.batchCounter}_${Date.now()}`;
    const batchTxid = `sim_txid_${Date.now().toString(16)}`;

    return {
      pending_batch: {
        batch_key: batchKey,
        batch_txid: batchTxid,
        state: "BATCH_STATE_PENDING",
        assets: [
          {
            asset_version: request.asset.asset_version,
            asset_type: request.asset.asset_type,
            name: request.asset.name,
            amount: request.asset.amount,
            asset_meta: request.asset.asset_meta,
          },
        ],
      },
    };
  }

  async finalizeBatch(): Promise<FinalizeBatchResponse> {
    const batchKey = `sim_batch_${this.batchCounter}_finalized`;
    const batchTxid = `sim_txid_final_${Date.now().toString(16)}`;

    return {
      batch: {
        batch_key: batchKey,
        batch_txid: batchTxid,
        state: "BATCH_STATE_BROADCAST",
      },
    };
  }

  estimateMintFee(params: {
    assetType: "NORMAL" | "COLLECTIBLE";
    enableEmission: boolean;
    hasMetadata: boolean;
  }): EstimateFeeResult {
    let estimatedVsize = 200;
    estimatedVsize += 100;
    if (params.enableEmission) estimatedVsize += 64;
    if (params.hasMetadata) estimatedVsize += 40;
    const feeRateSatPerVbyte = 10;
    return {
      estimatedFeeSats: estimatedVsize * feeRateSatPerVbyte,
      feeRateSatPerVbyte,
      estimatedVsize,
    };
  }
}
