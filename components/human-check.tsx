"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
export function HumanCheck({ onToken }: { onToken: (token: string) => void }) {
  const [loaded, setLoaded] = useState(false);
  const element = useRef<HTMLDivElement>(null);
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    if (!loaded || !element.current || !window.turnstile || !key) return;
    const id = window.turnstile.render(element.current, {
      sitekey: key,
      theme: "dark",
      action: "checkout",
      callback: onToken,
      "expired-callback": () => onToken(""),
    });
    return () => window.turnstile?.remove(id);
  }, [loaded, key, onToken]);
  if (!key)
    return (
      <p className="small muted">
        Secure checkout verification is being configured.
      </p>
    );
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={() => setLoaded(true)}
      />
      <div ref={element} style={{ marginTop: 20 }} />
    </>
  );
}
