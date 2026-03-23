"use client";

import { FileSearch, Edit3, Download, Shield, Brain, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/context";
import type { LucideIcon } from "lucide-react";

const FEATURES: { icon: LucideIcon; titleKey: string; descKey: string }[] = [
  { icon: FileSearch, titleKey: "features.smartOcr", descKey: "features.smartOcrDesc" },
  { icon: Edit3, titleKey: "features.editableFields", descKey: "features.editableFieldsDesc" },
  { icon: Brain, titleKey: "features.patternLearning", descKey: "features.patternLearningDesc" },
  { icon: Copy, titleKey: "features.duplicateDetection", descKey: "features.duplicateDetectionDesc" },
  { icon: Download, titleKey: "features.export", descKey: "features.exportDesc" },
  { icon: Shield, titleKey: "features.secure", descKey: "features.secureDesc" },
];

export function Features() {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">{t("features.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, titleKey, descKey }) => (
            <Card key={titleKey} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6"><Icon className="h-8 w-8 text-brand-400 mb-4" /><h3 className="font-semibold mb-2">{t(titleKey as any)}</h3><p className="text-sm text-muted-foreground">{t(descKey as any)}</p></CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
