/**
 * ชุดซอฟต์แวร์ชุดนี้ มีไว้เพื่อเป็นโครงสร้างพื้นฐานทางการเงินยุคใหม่
 * เพื่อรองรับการไหลของเงินจำนวนมหาศาลของท่านผู้เฒ่าหลี่เหมยฮัว หรือ LiMeiHua Grand Mother
 * และ source code นี้สร้างโดย Mr.Kanutsanan Pongpanna (นายคณัสนันท์ พงษ์พันนา)
 * URL: https://chatgpt.com/g/g-68d289535dec81919445deb9830f2d8e-kanutsanan-pongpanna
 *
 * Home Page - Cyberpunk landing page for LiMeiHua Create Taproot Assets
 */

import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Globe, Rocket, ArrowRight, Bitcoin } from "lucide-react";

export default function Home() {
  const { t } = useLanguage();

  const features = [
    { icon: Rocket, titleKey: "home_feature_easy" as const, descKey: "home_feature_easy_desc" as const, color: "#ff2d7b" },
    { icon: Shield, titleKey: "home_feature_secure" as const, descKey: "home_feature_secure_desc" as const, color: "#00f0ff" },
    { icon: Zap, titleKey: "home_feature_fast" as const, descKey: "home_feature_fast_desc" as const, color: "#ffd700" },
    { icon: Globe, titleKey: "home_feature_multi" as const, descKey: "home_feature_multi_desc" as const, color: "#a855f7" },
  ];

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#ff2d7b] opacity-[0.07] rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#00f0ff] opacity-[0.07] rounded-full blur-[120px]" />

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(0,240,255,0.2)] bg-[rgba(0,240,255,0.05)] mb-8">
              <Bitcoin className="h-4 w-4 text-[#ffd700]" />
              <span className="text-xs font-medium text-[#00f0ff] tracking-wider uppercase">Taproot Assets Protocol</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
              <span className="neon-text-pink">{t("home_title").split(" ")[0]}</span>{" "}
              <span className="text-foreground">{t("home_title").split(" ").slice(1, -1).join(" ")}</span>{" "}
              <span className="neon-text-cyan">{t("home_title").split(" ").slice(-1)}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-[#00f0ff] font-medium mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {t("home_subtitle")}
            </p>

            {/* Description */}
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("home_description")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create">
                <Button size="lg" className="bg-gradient-to-r from-[#ff2d7b] to-[#ff006e] hover:from-[#ff006e] hover:to-[#ff2d7b] text-white font-bold text-base neon-glow-pink px-8">
                  <Zap className="h-5 w-5 mr-2" />
                  {t("home_cta_create")}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/tokens">
                <Button size="lg" variant="outline" className="border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.1)] font-bold text-base px-8 bg-transparent">
                  {t("home_cta_explore")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-[rgba(0,240,255,0.08)]">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="hud-bracket p-6 rounded-lg bg-[rgba(15,15,40,0.6)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(0,240,255,0.2)] transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-t border-[rgba(0,240,255,0.08)]">
        <div className="container">
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { value: "1,000+", label: t("home_stats_tokens"), color: "#ff2d7b" },
              { value: "500+", label: t("home_stats_users"), color: "#00f0ff" },
              { value: "10,000+", label: t("home_stats_tx"), color: "#ffd700" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-4xl font-black mb-1" style={{ color: stat.color, fontFamily: "'Orbitron', sans-serif" }}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[rgba(0,240,255,0.08)]">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#ff2d7b]" />
              <span>{t("footer_powered")}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{t("footer_protocol")}</span>
              <span>|</span>
              <a
                href="https://lightning.engineering/api-docs/api/taproot-assets/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00f0ff] hover:underline"
              >
                API Docs
              </a>
              <span>|</span>
              <a
                href="https://github.com/kanutsanan1988/LiMeiHua-Create-Taproot-Assets"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00f0ff] hover:underline"
              >
                {t("footer_open_source")}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
