import type { ExtractedReceiptPayload } from "@smart-scanner/shared";

export type RootStackParamList = {
  MainTabs: undefined;
  ReviewReceipt: {
    extractionId: string;
    receipt: ExtractedReceiptPayload;
  };
  ReceiptDetail: undefined;
};

export type MainTabParamList = {
  Upload: undefined;
  History: undefined;
};
