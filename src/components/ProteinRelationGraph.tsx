import React, { useState, useRef, useEffect } from "react";
import { ForceGraph2D, ForceGraph3D } from "react-force-graph";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid3X3, Box, Tag } from "lucide-react";

interface Node {
  id: string;
  name: string;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface ProteinRelationshipGraphProps {
  centerId: string;
  topK: number;
}

const ProteinRelationshipGraph: React.FC<ProteinRelationshipGraphProps> = ({
  centerId,
  topK,
}) => {
  const [mode, setMode] = useState<"2d" | "3d">("3d");
  const [showLabels, setShowLabels] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const graphRef = useRef<any>();
  const graphContainerRef = useRef<HTMLDivElement>(null);

  // Mock data (replace with API call in the future)
  const mockData = {
    nodes: [
      { id: centerId, name: `Protein ${centerId}` },
      { id: "ENSP00000356607", name: "Protein ENSP00000356607" },
      { id: "ENSP00000427567", name: "Protein ENSP00000427567" },
      { id: "ENSP00000253413", name: "Protein ENSP00000253413" },
      { id: "ENSP00000493357", name: "Protein ENSP00000493357" },
    ],
    links: [
      { source: centerId, target: "ENSP00000356607", value: 173 },
      { source: centerId, target: "ENSP00000427567", value: 154 },
      { source: centerId, target: "ENSP00000253413", value: 151 },
      { source: centerId, target: "ENSP00000493357", value: 471 },
    ],
  };

  const handleModeChange = (value: string) => {
    setMode(value as "2d" | "3d");
  };

  const handleLabelsToggle = (value: string) => {
    setShowLabels(value === "show");
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (graphContainerRef.current) {
        const containerWidth = graphContainerRef.current.clientWidth;
        const containerHeight = graphContainerRef.current.clientHeight;
        setDimensions({
          width: Math.min(containerWidth, 600), // Limit max width to 600px
          height: Math.min(containerHeight, 400), // Limit max height to 400px
        });
      }

      if (graphRef.current) {
        graphRef.current.zoomToFit();
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const GraphComponent = mode === "3d" ? ForceGraph3D : ForceGraph2D;

  return (
    <div className="flex flex-col h-[400px]">
      <div className="mb-4 flex justify-between items-center">
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={handleModeChange}
        >
          <ToggleGroupItem value="2d" aria-label="2D">
            <Grid3X3 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="3d" aria-label="3D">
            <Box className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup
          type="single"
          value={showLabels ? "show" : "hide"}
          onValueChange={handleLabelsToggle}
        >
          <ToggleGroupItem value="show" aria-label="Show Labels">
            <Tag className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="hide" aria-label="Hide Labels">
            <Tag className="h-4 w-4 opacity-50" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div
        className="flex-grow flex justify-center items-center"
        ref={graphContainerRef}
      >
        <div
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
          }}
        >
          <GraphComponent
            ref={graphRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={mockData}
            nodeLabel={showLabels ? "name" : undefined}
            nodeAutoColorBy="id"
            linkWidth={1}
          />
        </div>
      </div>
    </div>
  );
};

export default ProteinRelationshipGraph;
