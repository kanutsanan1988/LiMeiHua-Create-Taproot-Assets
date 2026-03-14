/**
 * ชุดซอฟต์แวร์ชุดนี้ มีไว้เพื่อเป็นโครงสร้างพื้นฐานทางการเงินยุคใหม่
 * เพื่อรองรับการไหลของเงินจำนวนมหาศาลของท่านผู้เฒ่าหลี่เหมยฮัว หรือ LiMeiHua Grand Mother
 * และ source code นี้สร้างโดย Mr.Kanutsanan Pongpanna (นายคณัสนันท์ พงษ์พันนา)
 * URL: https://chatgpt.com/g/g-68d289535dec81919445deb9830f2d8e-kanutsanan-pongpanna
 *
 * CreateToken Page - Form to create new Taproot Assets tokens
 */

import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Zap, Lock, Flame, Coins, Loader2, ArrowLeft, Info } from "lucide-react";
import { getLoginUrl } from "@/const";

type TokenType = "fixed" | "mintable" | "burnable";

export default function CreateToken() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [, navigate] = useLocation();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("");
  const [decimals, setDecimals] = useState(8);
  const [ownerAddress, setOwnerAddress] = useState("");
  const [tokenType, setTokenType] = useState<TokenType>("fixed");
  const [metadata, setMetadata] = useState("");

  const gasEstimate = trpc.gas.estimate.useQuery(
    { tokenType, hasMetadata: !!metadata },
    { enabled: true }
  );

  const createMutation = trpc.token.create.useMutation({
    onSuccess: (data) => {
      toast.success(t("create_success"));
      if (data.token) navigate(`/tokens/${data.token.id}`);
      else navigate("/tokens");
    },
    onError: (err) => {
      toast.error(t("create_error") + ": " + err.message);
    },
  });

  const tokenTypes = useMemo(() => [
    {
      value: "fixed" as const,
      icon: Lock,
      label: t("create_type_fixed"),
      desc: t("create_type_fixed_desc"),
      color: "#00f0ff",
    },
    {
      value: "mintable" as const,
      icon: Coins,
      label: t("create_type_mintable"),
      desc: t("create_type_mintable_desc"),
      color: "#ff2d7b",
    },
    {
      value: "burnable" as const,
      icon: Flame,
      label: t("create_type_burnable"),
      desc: t("create_type_burnable_desc"),
      color: "#ffd700",
    },
  ], [t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (!name || !symbol || !supply || !ownerAddress) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate({
      name,
      symbol: symbol.toUpperCase(),
      initialSupply: supply,
      decimals,
      ownerAddress,
      tokenType,
      metadata: metadata || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Navbar />

      <div className="container py-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-gray-500 hover:text-[#00f0ff] text-sm mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {t("common_back")}
          </button>
          <h1 className="text-3xl font-black neon-text-pink mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            {t("create_title")}
          </h1>
          <p className="text-gray-400">{t("create_subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="p-6 rounded-xl bg-[rgba(15,15,40,0.6)] border border-[rgba(0,240,255,0.1)] space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">{t("create_name")} *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("create_name_placeholder")}
                  className="bg-[rgba(0,0,0,0.3)] border-[rgba(0,240,255,0.15)] text-foreground placeholder:text-gray-600 focus:border-[#00f0ff]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">{t("create_symbol")} *</Label>
                <Input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder={t("create_symbol_placeholder")}
                  maxLength={10}
                  className="bg-[rgba(0,0,0,0.3)] border-[rgba(0,240,255,0.15)] text-foreground placeholder:text-gray-600 focus:border-[#00f0ff] uppercase"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">{t("create_supply")} *</Label>
                <Input
                  type="number"
                  value={supply}
                  onChange={(e) => setSupply(e.target.value)}
                  placeholder={t("create_supply_placeholder")}
                  min="1"
                  className="bg-[rgba(0,0,0,0.3)] border-[rgba(0,240,255,0.15)] text-foreground placeholder:text-gray-600 focus:border-[#00f0ff]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">{t("create_decimals")}</Label>
                <Input
                  type="number"
                  value={decimals}
                  onChange={(e) => setDecimals(parseInt(e.target.value) || 0)}
                  min="0"
                  max="18"
                  className="bg-[rgba(0,0,0,0.3)] border-[rgba(0,240,255,0.15)] text-foreground placeholder:text-gray-600 focus:border-[#00f0ff]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">{t("create_owner")} *</Label>
              <Input
                value={ownerAddress}
                onChange={(e) => setOwnerAddress(e.target.value)}
                placeholder={t("create_owner_placeholder")}
                className="bg-[rgba(0,0,0,0.3)] border-[rgba(0,240,255,0.15)] text-foreground placeholder:text-gray-600 focus:border-[#00f0ff] font-mono text-sm"
                required
              />
            </div>
          </div>

          {/* Token Type Selection */}
          <div className="space-y-3">
            <Label className="text-gray-300 text-sm">{t("create_type")} *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tokenTypes.map((tt) => {
                const Icon = tt.icon;
                const isSelected = tokenType === tt.value;
                return (
                  <button
                    key={tt.value}
                    type="button"
                    onClick={() => setTokenType(tt.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-[rgba(0,240,255,0.4)] bg-[rgba(0,240,255,0.08)]"
                        : "border-[rgba(255,255,255,0.05)] bg-[rgba(15,15,40,0.4)] hover:border-[rgba(0,240,255,0.2)]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5" style={{ color: tt.color }} />
                      <span className="font-semibold text-sm text-foreground">{tt.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{tt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metadata */}
          <div className="p-6 rounded-xl bg-[rgba(15,15,40,0.6)] border border-[rgba(0,240,255,0.1)] space-y-3">
            <Label className="text-gray-300 text-sm">{t("create_metadata")}</Label>
            <Textarea
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              placeholder={t("create_metadata_placeholder")}
              rows={3}
              className="bg-[rgba(0,0,0,0.3)] border-[rgba(0,240,255,0.15)] text-foreground placeholder:text-gray-600 focus:border-[#00f0ff] resize-none"
            />
          </div>

          {/* Gas Estimation */}
          {gasEstimate.data && (
            <div className="p-5 rounded-xl bg-[rgba(15,15,40,0.6)] border border-[rgba(255,215,0,0.15)]">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-4 w-4 text-[#ffd700]" />
                <h3 className="text-sm font-bold text-[#ffd700]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  {t("create_gas_title")}
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t("create_gas_fee")}</div>
                  <div className="text-lg font-bold text-[#ffd700]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    {(gasEstimate.data as any).estimatedFeeSats?.toLocaleString()} <span className="text-xs text-gray-500">sats</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t("create_gas_rate")}</div>
                  <div className="text-sm font-medium text-gray-300">
                    {(gasEstimate.data as any).feeRateSatPerVbyte} sat/vB
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t("create_gas_vsize")}</div>
                  <div className="text-sm font-medium text-gray-300">
                    {(gasEstimate.data as any).estimatedVsize} vB
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full h-14 bg-gradient-to-r from-[#ff2d7b] to-[#ff006e] hover:from-[#ff006e] hover:to-[#ff2d7b] text-white font-bold text-lg neon-glow-pink"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t("create_submitting")}
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                {t("create_submit")}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
