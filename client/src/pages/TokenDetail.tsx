/**
 * ชุดซอฟต์แวร์ชุดนี้ มีไว้เพื่อเป็นโครงสร้างพื้นฐานทางการเงินยุคใหม่
 * เพื่อรองรับการไหลของเงินจำนวนมหาศาลของท่านผู้เฒ่าหลี่เหมยฮัว หรือ LiMeiHua Grand Mother
 * และ source code นี้สร้างโดย Mr.Kanutsanan Pongpanna (นายคณัสนันท์ พงษ์พันนา)
 * URL: https://chatgpt.com/g/g-68d289535dec81919445deb9830f2d8e-kanutsanan-pongpanna
 *
 * TokenDetail Page - Detailed view of a single token with transaction history
 */

import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Lock, Coins, Flame, Zap, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function TokenDetail() {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/tokens/:id");
  const tokenId = params?.id ? parseInt(params.id) : 0;

  const tokenQuery = trpc.token.getById.useQuery(
    { id: tokenId },
    { enabled: isAuthenticated && tokenId > 0 }
  );

  const txQuery = trpc.token.transactions.useQuery(
    { tokenId },
    { enabled: isAuthenticated && tokenId > 0 }
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background cyber-grid">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#00f0ff]" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background cyber-grid">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
          <Zap className="h-16 w-16 text-[#ff2d7b] animate-neon-pulse" />
          <p className="text-gray-400">{t("common_login_required")}</p>
          <a href={getLoginUrl()}>
            <Button className="bg-gradient-to-r from-[#ff2d7b] to-[#ff006e] text-white neon-glow-pink">
              {t("nav_login")}
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const token = tokenQuery.data;
  const transactions = txQuery.data || [];

  const typeIcons: Record<string, typeof Lock> = {
    fixed: Lock,
    mintable: Coins,
    burnable: Flame,
  };

  const typeColors: Record<string, string> = {
    fixed: "#00f0ff",
    mintable: "#ff2d7b",
    burnable: "#ffd700",
  };

  const statusColors: Record<string, string> = {
    confirmed: "#00f0ff",
    pending: "#ffd700",
    minting: "#ff2d7b",
    failed: "#ef4444",
  };

  const txTypeColors: Record<string, string> = {
    create: "#00f0ff",
    mint: "#ff2d7b",
    burn: "#ffd700",
  };

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Navbar />

      <div className="container py-8 max-w-4xl mx-auto">
        <button onClick={() => navigate("/tokens")} className="flex items-center gap-2 text-gray-500 hover:text-[#00f0ff] text-sm mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t("common_back")}
        </button>

        {tokenQuery.isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-[#00f0ff]" />
          </div>
        ) : !token ? (
          <div className="text-center py-20 text-gray-500">Token not found</div>
        ) : (
          <div className="space-y-6">
            {/* Token Header */}
            <div className="p-6 rounded-xl bg-[rgba(15,15,40,0.6)] border border-[rgba(0,240,255,0.15)]">
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${typeColors[token.tokenType] || "#00f0ff"}15` }}
                >
                  {(() => {
                    const Icon = typeIcons[token.tokenType] || Lock;
                    return <Icon className="h-8 w-8" style={{ color: typeColors[token.tokenType] || "#00f0ff" }} />;
                  })()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      {token.name}
                    </h1>
                    <span className="text-sm px-3 py-1 rounded-full bg-[rgba(0,240,255,0.1)] text-[#00f0ff] font-mono font-bold">
                      {token.symbol}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                      style={{
                        backgroundColor: `${statusColors[token.status] || "#666"}15`,
                        color: statusColors[token.status] || "#666",
                      }}
                    >
                      {token.status}
                    </span>
                  </div>
                  {token.metadata && (
                    <p className="text-sm text-gray-400 mt-2">{token.metadata}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Token Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: t("tokens_supply"), value: BigInt(token.currentSupply).toLocaleString(), color: "#00f0ff" },
                { label: t("tokens_type"), value: token.tokenType, color: typeColors[token.tokenType] || "#00f0ff" },
                { label: t("create_decimals"), value: token.decimals.toString(), color: "#a855f7" },
                { label: t("create_gas_fee"), value: `${token.estimatedFee?.toLocaleString() || "N/A"} sats`, color: "#ffd700" },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-lg bg-[rgba(15,15,40,0.6)] border border-[rgba(255,255,255,0.05)]">
                  <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                  <div className="font-bold capitalize" style={{ color: item.color, fontFamily: "'Orbitron', sans-serif" }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Owner Address */}
            <div className="p-4 rounded-lg bg-[rgba(15,15,40,0.6)] border border-[rgba(255,255,255,0.05)]">
              <div className="text-xs text-gray-500 mb-2">{t("create_owner")}</div>
              <div className="flex items-center gap-2">
                <code className="text-sm text-[#00f0ff] font-mono break-all flex-1">{token.ownerAddress}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-500 hover:text-[#00f0ff] shrink-0"
                  onClick={() => copyToClipboard(token.ownerAddress)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Asset ID & Batch TX */}
            {(token.assetId || token.batchTxid) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {token.assetId && (
                  <div className="p-4 rounded-lg bg-[rgba(15,15,40,0.6)] border border-[rgba(255,255,255,0.05)]">
                    <div className="text-xs text-gray-500 mb-2">Asset ID</div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-gray-300 font-mono break-all flex-1">{token.assetId}</code>
                      <Button size="sm" variant="ghost" className="text-gray-500 hover:text-[#00f0ff] shrink-0" onClick={() => copyToClipboard(token.assetId!)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                {token.batchTxid && (
                  <div className="p-4 rounded-lg bg-[rgba(15,15,40,0.6)] border border-[rgba(255,255,255,0.05)]">
                    <div className="text-xs text-gray-500 mb-2">Batch TX</div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-gray-300 font-mono break-all flex-1">{token.batchTxid}</code>
                      <Button size="sm" variant="ghost" className="text-gray-500 hover:text-[#00f0ff] shrink-0" onClick={() => copyToClipboard(token.batchTxid!)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transaction History */}
            <div className="p-6 rounded-xl bg-[rgba(15,15,40,0.6)] border border-[rgba(0,240,255,0.1)]">
              <h2 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                {t("detail_history")}
              </h2>

              {txQuery.isLoading ? (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="h-6 w-6 animate-spin text-[#00f0ff]" />
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.03)]"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded font-bold uppercase"
                          style={{
                            backgroundColor: `${txTypeColors[tx.txType] || "#666"}15`,
                            color: txTypeColors[tx.txType] || "#666",
                          }}
                        >
                          {tx.txType}
                        </span>
                        <span className="text-sm font-mono text-gray-300">
                          {BigInt(tx.amount).toLocaleString()} tokens
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span
                          className="capitalize"
                          style={{ color: statusColors[tx.status] || "#666" }}
                        >
                          {tx.status}
                        </span>
                        {tx.txHash && (
                          <span className="font-mono">
                            {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-8)}
                          </span>
                        )}
                        <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
