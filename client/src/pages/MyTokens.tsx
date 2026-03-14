/**
 * ชุดซอฟต์แวร์ชุดนี้ มีไว้เพื่อเป็นโครงสร้างพื้นฐานทางการเงินยุคใหม่
 * เพื่อรองรับการไหลของเงินจำนวนมหาศาลของท่านผู้เฒ่าหลี่เหมยฮัว หรือ LiMeiHua Grand Mother
 * และ source code นี้สร้างโดย Mr.Kanutsanan Pongpanna (นายคณัสนันท์ พงษ์พันนา)
 * URL: https://chatgpt.com/g/g-68d289535dec81919445deb9830f2d8e-kanutsanan-pongpanna
 *
 * MyTokens Page - List all tokens created by the user with mint/burn actions
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Coins, Flame, Eye, Loader2, Zap, Lock } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function MyTokens() {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const [, navigate] = useLocation();

  const tokensQuery = trpc.token.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const mintMutation = trpc.token.mintMore.useMutation({
    onSuccess: () => {
      toast.success("Tokens minted successfully!");
      tokensQuery.refetch();
      setMintDialog(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const burnMutation = trpc.token.burn.useMutation({
    onSuccess: () => {
      toast.success("Tokens burned successfully!");
      tokensQuery.refetch();
      setBurnDialog(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const [mintDialog, setMintDialog] = useState<{ id: number; name: string } | null>(null);
  const [burnDialog, setBurnDialog] = useState<{ id: number; name: string; maxSupply: string } | null>(null);
  const [mintAmount, setMintAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");

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
          <div className="text-center">
            <Zap className="h-16 w-16 text-[#ff2d7b] mx-auto mb-4 animate-neon-pulse" />
            <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {t("common_login_required")}
            </h2>
          </div>
          <a href={getLoginUrl()}>
            <Button className="bg-gradient-to-r from-[#ff2d7b] to-[#ff006e] text-white font-bold neon-glow-pink">
              <Zap className="h-4 w-4 mr-2" />
              {t("nav_login")}
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const tokens = tokensQuery.data || [];

  const statusColors: Record<string, string> = {
    confirmed: "#00f0ff",
    pending: "#ffd700",
    minting: "#ff2d7b",
    failed: "#ef4444",
  };

  const typeIcons: Record<string, typeof Lock> = {
    fixed: Lock,
    mintable: Coins,
    burnable: Flame,
  };

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Navbar />

      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black neon-text-cyan" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {t("tokens_title")}
            </h1>
          </div>
          <Link href="/create">
            <Button className="bg-gradient-to-r from-[#ff2d7b] to-[#ff006e] text-white font-semibold neon-glow-pink">
              <Plus className="h-4 w-4 mr-2" />
              {t("nav_create")}
            </Button>
          </Link>
        </div>

        {/* Token List */}
        {tokensQuery.isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-[#00f0ff]" />
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-20">
            <Coins className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-6">{t("tokens_empty")}</p>
            <Link href="/create">
              <Button className="bg-gradient-to-r from-[#ff2d7b] to-[#ff006e] text-white font-semibold neon-glow-pink">
                <Plus className="h-4 w-4 mr-2" />
                {t("home_cta_create")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tokens.map((token) => {
              const TypeIcon = typeIcons[token.tokenType] || Lock;
              const statusColor = statusColors[token.status] || "#666";
              return (
                <div
                  key={token.id}
                  className="p-5 rounded-xl bg-[rgba(15,15,40,0.6)] border border-[rgba(0,240,255,0.1)] hover:border-[rgba(0,240,255,0.25)] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Token info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[rgba(0,240,255,0.08)] flex items-center justify-center">
                        <TypeIcon className="h-6 w-6 text-[#00f0ff]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-lg">{token.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[rgba(0,240,255,0.1)] text-[#00f0ff] font-mono">
                            {token.symbol}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span>{t("tokens_supply")}: <span className="text-gray-300 font-mono">{BigInt(token.currentSupply).toLocaleString()}</span></span>
                          <span>|</span>
                          <span>{t("tokens_type")}: <span className="text-gray-300 capitalize">{token.tokenType}</span></span>
                          <span>|</span>
                          <span className="flex items-center gap-1">
                            {t("tokens_status")}:
                            <span className="font-medium capitalize" style={{ color: statusColor }}>
                              {token.status}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {token.tokenType === "mintable" && token.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[rgba(255,45,123,0.3)] text-[#ff2d7b] hover:bg-[rgba(255,45,123,0.1)] bg-transparent"
                          onClick={() => setMintDialog({ id: token.id, name: token.name })}
                        >
                          <Coins className="h-3 w-3 mr-1" />
                          {t("tokens_mint_more")}
                        </Button>
                      )}
                      {token.tokenType === "burnable" && token.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[rgba(255,215,0,0.3)] text-[#ffd700] hover:bg-[rgba(255,215,0,0.1)] bg-transparent"
                          onClick={() => setBurnDialog({ id: token.id, name: token.name, maxSupply: token.currentSupply })}
                        >
                          <Flame className="h-3 w-3 mr-1" />
                          {t("tokens_burn")}
                        </Button>
                      )}
                      <Link href={`/tokens/${token.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.1)] bg-transparent"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          {t("tokens_view")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mint Dialog */}
      <Dialog open={!!mintDialog} onOpenChange={() => { setMintDialog(null); setMintAmount(""); }}>
        <DialogContent className="bg-[rgba(15,15,40,0.98)] border-[rgba(0,240,255,0.2)]">
          <DialogHeader>
            <DialogTitle className="text-[#ff2d7b]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {t("tokens_mint_more")} - {mintDialog?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="number"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder={t("tokens_amount")}
              min="1"
              className="bg-[rgba(0,0,0,0.3)] border-[rgba(0,240,255,0.15)] text-foreground"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setMintDialog(null); setMintAmount(""); }} className="text-gray-400">
              {t("tokens_cancel")}
            </Button>
            <Button
              onClick={() => mintDialog && mintAmount && mintMutation.mutate({ tokenId: mintDialog.id, amount: mintAmount })}
              disabled={!mintAmount || mintMutation.isPending}
              className="bg-gradient-to-r from-[#ff2d7b] to-[#ff006e] text-white"
            >
              {mintMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Coins className="h-4 w-4 mr-2" />}
              {t("tokens_confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Burn Dialog */}
      <Dialog open={!!burnDialog} onOpenChange={() => { setBurnDialog(null); setBurnAmount(""); }}>
        <DialogContent className="bg-[rgba(15,15,40,0.98)] border-[rgba(0,240,255,0.2)]">
          <DialogHeader>
            <DialogTitle className="text-[#ffd700]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {t("tokens_burn")} - {burnDialog?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="number"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
              placeholder={t("tokens_amount")}
              min="1"
              max={burnDialog?.maxSupply}
              className="bg-[rgba(0,0,0,0.3)] border-[rgba(0,240,255,0.15)] text-foreground"
            />
            <p className="text-xs text-gray-500">
              Max: {burnDialog?.maxSupply ? BigInt(burnDialog.maxSupply).toLocaleString() : "0"}
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setBurnDialog(null); setBurnAmount(""); }} className="text-gray-400">
              {t("tokens_cancel")}
            </Button>
            <Button
              onClick={() => burnDialog && burnAmount && burnMutation.mutate({ tokenId: burnDialog.id, amount: burnAmount })}
              disabled={!burnAmount || burnMutation.isPending}
              className="bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black"
            >
              {burnMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Flame className="h-4 w-4 mr-2" />}
              {t("tokens_confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
