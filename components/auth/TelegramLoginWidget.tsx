"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void;
  }
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export function TelegramLoginWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Callback вызывается Telegram после авторизации
    window.onTelegramAuth = async (user: TelegramUser) => {
      try {
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });

        if (res.ok) {
          router.push("/");
          router.refresh();
        } else {
          alert("Ошибка авторизации. Попробуйте ещё раз.");
        }
      } catch {
        alert("Ошибка сети. Попробуйте ещё раз.");
      }
    };

    // Inject Telegram widget script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "agronomvubot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [router]);

  return (
    <div className="flex justify-center" ref={containerRef} />
  );
}
