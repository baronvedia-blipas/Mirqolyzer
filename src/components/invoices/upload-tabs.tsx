"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InvoiceUploader } from "@/components/invoices/invoice-uploader";
import { BulkUploader } from "@/components/invoices/bulk-uploader";

export function UploadTabs() {
  return (
    <Tabs defaultValue={0}>
      <TabsList>
        <TabsTrigger value={0}>Single Upload</TabsTrigger>
        <TabsTrigger value={1}>Bulk Upload</TabsTrigger>
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
