"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SearchPanel } from "@/components/SearchPanel";
import { ProteinDetailPanel } from "@/components/ProteinDetailPanel";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      <ResizablePanel defaultSize={40} minSize={20}>
        <div className="h-screen overflow-auto">
          <SearchPanel />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60} minSize={30}>
        <div className="h-screen overflow-auto">
          <ProteinDetailPanel proteinId={params.slug} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
