/**
 * ชุดซอฟต์แวร์ชุดนี้ มีไว้เพื่อเป็นโครงสร้างพื้นฐานทางการเงินยุคใหม่
 * เพื่อรองรับการไหลของเงินจำนวนมหาศาลของท่านผู้เฒ่าหลี่เหมยฮัว หรือ LiMeiHua Grand Mother
 * และ source code นี้สร้างโดย Mr.Kanutsanan Pongpanna (นายคณัสนันท์ พงษ์พันนา)
 * URL: https://chatgpt.com/g/g-68d289535dec81919445deb9830f2d8e-kanutsanan-pongpanna
 *
 * Navbar - Cyberpunk-styled navigation bar with language selector
 */

import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Zap, Plus, Coins, Globe, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import type { LangCode } from "@/lib/i18n";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, lang, setLang, languages } = useLanguage();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("nav_home"), icon: Zap },
    { href: "/create", label: t("nav_create"), icon: Plus },
    { href: "/tokens", label: t("nav_my_tokens"), icon: Coins },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-[rgba(0,240,255,0.15)] bg-[rgba(10,10,30,0.9)] backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Zap className="h-7 w-7 text-[#ff2d7b] group-hover:text-[#00f0ff] transition-colors" />
            <div className="absolute inset-0 blur-md bg-[#ff2d7b] opacity-30 group-hover:bg-[#00f0ff] transition-colors" />
          </div>
          <span className="font-bold text-lg tracking-wider hidden sm:inline" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span className="text-[#ff2d7b]">LiMei</span>
            <span className="text-[#00f0ff]">Hua</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <span
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "text-[#00f0ff] bg-[rgba(0,240,255,0.1)] neon-border"
                      : "text-gray-400 hover:text-[#00f0ff] hover:bg-[rgba(0,240,255,0.05)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right side: Language + Auth */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#00f0ff] gap-1">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline text-xs uppercase">{lang}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-80 overflow-y-auto bg-[rgba(15,15,40,0.98)] border-[rgba(0,240,255,0.2)]">
              {languages.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLang(l.code as LangCode)}
                  className={`cursor-pointer ${lang === l.code ? "text-[#00f0ff]" : "text-gray-300"}`}
                >
                  <span className="mr-2 font-medium">{l.nativeName}</span>
                  <span className="text-xs text-gray-500">{l.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-[#ff2d7b] gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#ff2d7b] to-[#00f0ff] flex items-center justify-center text-xs font-bold text-black">
                    {user?.name?.[0] || "U"}
                  </div>
                  <span className="hidden sm:inline text-sm">{user?.name || "User"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[rgba(15,15,40,0.98)] border-[rgba(0,240,255,0.2)]">
                <DropdownMenuItem onClick={() => logout()} className="text-gray-300 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("nav_logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="sm" className="bg-gradient-to-r from-[#ff2d7b] to-[#ff006e] hover:from-[#ff006e] hover:to-[#ff2d7b] text-white font-semibold neon-glow-pink text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {t("nav_login")}
              </Button>
            </a>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-gray-400"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(0,240,255,0.1)] bg-[rgba(10,10,30,0.98)] px-4 pb-4">
          {navLinks.map((link) => {
            const isActive = location === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <span
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "text-[#00f0ff] bg-[rgba(0,240,255,0.1)]"
                      : "text-gray-400 hover:text-[#00f0ff]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
