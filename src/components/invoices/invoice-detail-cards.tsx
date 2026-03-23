"use client";

import { useLanguage } from "@/lib/i18n/context";

export function TranslatedCardTitle({ translationKey }: { translationKey: string }) {
  const { t } = useLanguage();
  return <>{t(translationKey as any)}</>;
}

export function ConfidenceLabel({ score }: { score: number }) {
  const { t } = useLanguage();
  return <p className="text-xs text-muted-foreground">{t("confidence.overall")}: {Math.round(score * 100)}%</p>;
}
