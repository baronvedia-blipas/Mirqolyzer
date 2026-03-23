"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InvoiceUploader } from "@/components/invoices/invoice-uploader";
import { BulkUploader } from "@/components/invoices/bulk-uploader";
import { useLanguage } from "@/lib/i18n/context";

export function UploadTabs() {
  const { t } = useLanguage();

  return (
    <Tabs defaultValue={0}>
      <TabsList>
        <TabsTrigger value={0}>{t("upload.singleUpload")}</TabsTrigger>
        <TabsTrigger value={1}>{t("upload.bulkUpload")}</TabsTrigger>
      </TabsList>
      <TabsContent value={0}>
        <InvoiceUploader />
      </TabsContent>
      <TabsContent value={1}>
        <BulkUploader />
      </TabsContent>
    </Tabs>
  );
}
