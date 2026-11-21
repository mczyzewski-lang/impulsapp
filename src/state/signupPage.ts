import { useCallback, useState } from "react";
import { defaultSignupPage, type Channel, type SignupPage } from "@/data/mock";

const key = (slug: string) => `impuls.signup.${slug}`;

function read(channel: Channel): SignupPage {
  try {
    const raw = localStorage.getItem(key(channel.creator.slug));
    if (raw) return { ...defaultSignupPage(channel), ...JSON.parse(raw) };
  } catch {
    /* brak storage — używamy treści domyślnej */
  }
  return defaultSignupPage(channel);
}

/**
 * Treść strony zapisu twórcy. W demo zapisuje się lokalnie,
 * dzięki czemu zmiany z panelu widać od razu na stronie publicznej.
 */
export function useSignupPage(channel: Channel) {
  const [page, setPage] = useState<SignupPage>(() => read(channel));

  const update = useCallback(
    (patch: Partial<SignupPage>) =>
      setPage((current) => {
        const next = { ...current, ...patch };
        try {
          localStorage.setItem(key(channel.creator.slug), JSON.stringify(next));
        } catch {
          /* zmiana zostaje tylko w pamięci */
        }
        return next;
      }),
    [channel.creator.slug],
  );

  return [page, update] as const;
}
