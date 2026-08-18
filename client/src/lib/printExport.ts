export type PrintExportBridge = {
  getTitle: () => string;
  setTitle: (title: string) => void;
  print: () => void;
  onAfterPrint: (callback: () => void) => void;
  offAfterPrint: (callback: () => void) => void;
};

export function getPrintDocumentTitle(title: string) {
  const safeTitle = title.replace(/[\\/:*?"<>|]/g, "-").trim() || "خطة-درس";
  return `${safeTitle} - خطة تعليمية`;
}

export function triggerPrintExport(title: string, bridge: PrintExportBridge) {
  const previousTitle = bridge.getTitle();
  const restoreTitle = () => {
    bridge.setTitle(previousTitle);
    bridge.offAfterPrint(restoreTitle);
  };

  bridge.setTitle(getPrintDocumentTitle(title));
  bridge.onAfterPrint(restoreTitle);
  bridge.print();

  return restoreTitle;
}
