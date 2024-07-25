import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { ForceGraph2D, ForceGraph3D } from "react-force-graph";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Grid3X3,
  Box,
  Tag,
  Focus,
  Orbit,
  Atom,
  Plus,
  Minus,
} from "lucide-react";

interface Node {
  id: string;
  name: string;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface ProteinRelationshipGraphProps {
  centerId: string;
  topK: number;
}

// Mock function to generate data (replace with API call in the future)
const generateMockData = (
  centerId: string
): { proteins: string[]; values: number[] } => {
  const proteins = Array.from(
    { length: 49 },
    (_, i) => `9606.ENSP${String(i + 1).padStart(11, "0")}`
  );
  const values = Array.from({ length: 49 }, () =>
    Math.floor(Math.random() * 1000)
  );
  return { proteins, values };
};

const ProteinRelationshipGraph: React.FC<ProteinRelationshipGraphProps> = ({
  centerId,
  topK,
}) => {
  // State for graph visualization options
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [showLabels, setShowLabels] = useState(true);
  const [emitParticles, setEmitParticles] = useState(false);
  const [focusOnClick, setFocusOnClick] = useState(false);
  const [cameraOrbit, setCameraOrbit] = useState(false);
  const [orbitSpeed, setOrbitSpeed] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Refs for the graph
  const graphRef = useRef<any>();
  const graphContainerRef = useRef<HTMLDivElement>(null);

  // State for managing displayed nodes
  const [displayedNodes, setDisplayedNodes] = useState(topK);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  // Memoized mock data (replace with API call in the future)
  const mockData = useMemo(() => generateMockData(centerId), [centerId]);

  // Effect to update graph data when displayedNodes changes
  useEffect(() => {
    // Create nodes array with center node and top K nodes
    const nodes: Node[] = [
      { id: centerId, name: `Protein ${centerId}` },
      ...mockData.proteins
        .slice(0, displayedNodes - 1)
        .map((id) => ({ id, name: `Protein ${id}` })),
    ];

    // Create links array with top K links
    const links: Link[] = mockData.proteins
      .slice(0, displayedNodes - 1)
      .map((id, index) => ({
        source: centerId,
        target: id,
        value: mockData.values[index],
      }));

    // Sort links by value in descending order
    links.sort((a, b) => b.value - a.value);

    setGraphData({ nodes, links });
  }, [displayedNodes, centerId, mockData]);

  // Handler for changing the number of displayed nodes
  const handleNodeChange = (change: number) => {
    setDisplayedNodes((prev) =>
      Math.max(2, Math.min(prev + change, mockData.proteins.length + 1))
    );
  };

  const handleModeChange = (value: string) => {
    setMode(value as "2d" | "3d");
  };

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "2d" ? "3d" : "2d"));
  };

  const handleLabelsToggle = (value: string) => {
    setShowLabels(value === "show");
  };

  const handleOrbitSpeedChange = (value: number[]) => {
    setOrbitSpeed(value[0]);
  };

  // Focus on click functionality
  const handleClick = useCallback(
    (node: any) => {
      if (focusOnClick && mode === "3d" && graphRef.current) {
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        graphRef.current.cameraPosition(
          {
            x: node.x * distRatio,
            y: node.y * distRatio,
            z: node.z * distRatio,
          },
          node,
          3000
        );
      }
    },
    [focusOnClick, mode]
  );

  useEffect(() => {
    const updateDimensions = () => {
      if (graphContainerRef.current) {
        const { width, height } =
          graphContainerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (graphRef.current) {
      // Camera orbit functionality (3D only)
      let orbitInterval: NodeJS.Timeout | null = null;
      if (cameraOrbit && mode === "3d") {
        const distance = 1400;
        let angle = 0;
        orbitInterval = setInterval(() => {
          graphRef.current.cameraPosition({
            x: distance * Math.sin(angle),
            z: distance * Math.cos(angle),
          });
          angle += (Math.PI / 300) * orbitSpeed;
        }, 10);
      }

      // Cleanup function
      return () => {
        if (orbitInterval) clearInterval(orbitInterval);
      };
    }
  }, [cameraOrbit, mode, orbitSpeed]);

  return (
    <div className="flex flex-col h-[400px]">
      <div className="mb-4 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleMode}
              variant="outline"
              size="icon"
              className="relative"
            >
              {mode === "2d" ? (
                <Grid3X3 className="h-4 w-4" />
              ) : (
                <Box className="h-4 w-4" />
              )}
            </Button>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {mode === "2d" ? "2D Mode" : "3D Mode"}
            </span>
          </div>
          <ToggleGroup
            type="single"
            value={showLabels ? "show" : "hide"}
            onValueChange={(value) => setShowLabels(value === "show")}
          >
            <ToggleGroupItem value="show" aria-label="Show Labels">
              <Tag className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="hide" aria-label="Hide Labels">
              <Tag className="h-4 w-4 opacity-50" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Switch
              checked={emitParticles}
              onCheckedChange={setEmitParticles}
              id="emit-particles"
            />
            <label htmlFor="emit-particles" className="text-sm">
              <Atom className="h-4 w-4 inline mr-1" />
              Emit Particles
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={focusOnClick}
              onCheckedChange={setFocusOnClick}
              id="focus-on-click"
            />
            <label htmlFor="focus-on-click" className="text-sm">
              <Focus className="h-4 w-4 inline mr-1" />
              Focus on Click
            </label>
          </div>
        </div>
        <div
          className={`flex justify-between items-center ${
            mode === "2d" ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="flex items-center space-x-2">
            <Switch
              checked={cameraOrbit}
              onCheckedChange={setCameraOrbit}
              id="camera-orbit"
              disabled={mode === "2d"}
            />
            <label htmlFor="camera-orbit" className="text-sm">
              <Orbit className="h-4 w-4 inline mr-1" />
              Camera Orbit
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Speed:</span>
            <Slider
              value={[orbitSpeed]}
              onValueChange={handleOrbitSpeedChange}
              min={0}
              max={5}
              step={0.1}
              className="w-24"
              disabled={mode === "2d" || !cameraOrbit}
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handleNodeChange(-1)}
                variant="outline"
                size="icon"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Slider
                value={[displayedNodes]}
                onValueChange={(value) => setDisplayedNodes(value[0])}
                min={2}
                max={mockData.proteins.length + 1}
                step={1}
                className="w-32"
              />
              <Button
                onClick={() => handleNodeChange(1)}
                variant="outline"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-sm text-gray-500">
              {displayedNodes} out of {mockData.proteins.length + 1} nodes
              displayed
            </span>
          </div>
        </div>
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
          {mode === "2d" ? (
            <ForceGraph2D
              ref={graphRef}
              width={dimensions.width}
              height={dimensions.height}
              backgroundColor="#f9f9f9"
              graphData={graphData}
              nodeLabel={showLabels ? "name" : undefined}
              nodeAutoColorBy="id"
              linkWidth={1}
              linkDirectionalParticles={emitParticles ? 4 : 0}
              linkDirectionalParticleSpeed={(d) => d.value * 0.001}
              onNodeClick={handleClick}
            />
          ) : (
            <ForceGraph3D
              ref={graphRef}
              width={dimensions.width}
              height={dimensions.height}
              backgroundColor="#f9f9f9"
              graphData={graphData}
              nodeLabel={showLabels ? "name" : undefined}
              nodeAutoColorBy="id"
              linkWidth={1}
              linkDirectionalParticles={emitParticles ? 4 : 0}
              linkDirectionalParticleSpeed={(d) => d.value * 0.001}
              enableNodeDrag={!cameraOrbit}
              enableNavigationControls={!cameraOrbit}
              showNavInfo={!cameraOrbit}
              onNodeClick={handleClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProteinRelationshipGraph;
