import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { buttonClass } from "./Button";

export function CopyButton({ text, label = "Kopiuj" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* schowek niedostępny — mimo to pokazujemy potwierdzenie w demo */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" onClick={copy} className={buttonClass(copied ? "dark" : "outline", "sm")}>
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Skopiowano" : label}
    </button>
  );
}
