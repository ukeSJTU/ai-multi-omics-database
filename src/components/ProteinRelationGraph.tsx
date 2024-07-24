import React, { useState, useRef, useEffect, useCallback } from "react";
import { ForceGraph2D, ForceGraph3D } from "react-force-graph";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Grid3X3, Box, Tag, Focus, Orbit, Atom } from "lucide-react";

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
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [showLabels, setShowLabels] = useState(true);
  const [emitParticles, setEmitParticles] = useState(false);
  const [focusOnClick, setFocusOnClick] = useState(false);
  const [cameraOrbit, setCameraOrbit] = useState(false);
  const [orbitSpeed, setOrbitSpeed] = useState(1);
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
              graphData={mockData}
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
              graphData={mockData}
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
