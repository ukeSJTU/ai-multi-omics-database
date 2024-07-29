import React, { useState, useRef, useEffect, useCallback } from "react";
import { ForceGraph2D, ForceGraph3D } from "react-force-graph";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import RangeSlider from "@/components/RangeSlider";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
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
import * as THREE from "three";
import SpriteText from "three-spritetext";

// Define the structure for a node in the graph
interface Node {
  id: string;
  name: string;
}

// Define the structure for a link in the graph
interface Link {
  source: string;
  target: string;
  value: number;
}

// Define the structure for the graph data
interface GraphData {
  nodes: Node[];
  links: Link[];
}

// Define the props for the ProteinRelationshipGraph component
interface ProteinRelationshipGraphProps {
  centerId: string;
  topK: number;
}

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

  // State for managing displayed nodes and graph data
  const [displayedNodes, setDisplayedNodes] = useState(topK);
  const [scoreRange, setScoreRange] = useState<number[]>([0, 1000]);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  // State to store API data
  const [proteinData, setProteinData] = useState<{
    proteins: string[];
    values: number[];
  } | null>(null);

  // Effect to fetch data from API when centerId changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/protein-links?proteinId=${centerId}&limit=50`
        );
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setProteinData(data);
        // Initialize score range based on actual data
        if (data.values.length > 0) {
          const minScore = Math.min(...data.values);
          const maxScore = Math.max(...data.values);
          setScoreRange([minScore, maxScore]);
        }
      } catch (error) {
        console.error("Error fetching protein data:", error);
      }
    };

    fetchData();
  }, [centerId]);

  const handleScoreRangeChange = useCallback((newValues: number[]) => {
    setScoreRange(newValues);
  }, []);

  const findNearestScore = useCallback(
    (target: number, direction: "left" | "right"): number => {
      if (!proteinData) return target;
      const sortedScores = [...proteinData.values].sort((a, b) => a - b);
      if (direction === "left") {
        return sortedScores.reverse().find((score) => score < target) || target;
      } else {
        return sortedScores.find((score) => score > target) || target;
      }
    },
    [proteinData]
  );

  const handleStepLeft = useCallback(
    (isMin: boolean) => {
      setScoreRange((prev) => {
        const newValue = findNearestScore(isMin ? prev[0] : prev[1], "left");
        return isMin ? [newValue, prev[1]] : [prev[0], newValue];
      });
    },
    [findNearestScore]
  );

  const handleStepRight = useCallback(
    (isMin: boolean) => {
      setScoreRange((prev) => {
        const newValue = findNearestScore(isMin ? prev[0] : prev[1], "right");
        return isMin ? [newValue, prev[1]] : [prev[0], newValue];
      });
    },
    [findNearestScore]
  );

  // Effect to update graph data when displayedNodes or proteinData changes
  useEffect(() => {
    if (!proteinData) return;

    const filteredProteins = proteinData.proteins.filter(
      (_, index) =>
        proteinData.values[index] >= scoreRange[0] &&
        proteinData.values[index] <= scoreRange[1]
    );

    // Create nodes array with center node and top K nodes
    const nodes: Node[] = [
      { id: centerId, name: `Protein ${centerId}` },
      ...filteredProteins.map((id) => ({ id, name: `Protein ${id}` })),
    ];

    // Create links array with top K links
    const links: Link[] = filteredProteins.map((id, index) => ({
      source: centerId,
      target: id,
      value: proteinData.values[index],
    }));

    console.log("Nodes:", nodes);
    console.log("Links:", links);

    setGraphData({ nodes, links });
  }, [centerId, proteinData, scoreRange]);

  // Handler for changing the number of displayed nodes
  const handleNodeChange = (change: number) => {
    setDisplayedNodes((prev) =>
      Math.max(
        2,
        Math.min(prev + change, (proteinData?.proteins.length || 0) + 1)
      )
    );
  };

  // Handler for toggling 2D/3D mode
  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "2d" ? "3d" : "2d"));
  };

  // Handler for toggling labels
  const handleLabelsToggle = (value: string) => {
    setShowLabels(value === "show");
  };

  const toggleLabels = () => {
    setShowLabels((prev) => !prev);
  };

  // Handler for changing orbit speed
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

  // Effect to update dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (graphContainerRef.current) {
        const { width, height } =
          graphContainerRef.current.getBoundingClientRect();
        console.log("Dimensions:", width, height);
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Effect for camera orbit functionality (3D only)
  useEffect(() => {
    if (graphRef.current && cameraOrbit && mode === "3d") {
      const distance = 120;
      let angle = 0;
      const interval = setInterval(() => {
        graphRef.current.cameraPosition({
          x: distance * Math.sin(angle),
          z: distance * Math.cos(angle),
        });
        angle += (Math.PI / 300) * orbitSpeed;
      }, 10);
      return () => clearInterval(interval);
    }
  }, [cameraOrbit, mode, orbitSpeed]);

  const nodeSize = 50;

  const node2D = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const size = nodeSize / globalScale;
      const x = node.x - size / 2;
      const y = node.y - size / 2;

      // Draw circular background
      ctx.beginPath();
      ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
      ctx.fillStyle = `${node.color}33`; // Light version of node color
      ctx.fill();

      // Draw border
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();

      // Extract protein ID from node name
      const proteinId = node.name.split(" ")[1];

      // Load and draw the image
      const img = new Image(size, size);
      img.src = `/img/name/${proteinId}.png`; // Replace with correct image path later
      ctx.save();
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();

      // Draw label if needed
      if (showLabels) {
        const label = node.name;
        ctx.font = `${12 / globalScale}px Sans-Serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = node.color;
        ctx.fillText(label, node.x, node.y + size / 2 + 2 / globalScale);
      }
    },
    [showLabels, nodeSize]
  );

  const node3D = useCallback(
    (node: any) => {
      const group = new THREE.Group();

      // Extract protein ID from node name
      const proteinId = node.name.split(" ")[1];

      // Create sprite for the image
      const texture = new THREE.TextureLoader().load(
        `/img/name/${proteinId}.png`
      );
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(nodeSize, nodeSize, 1);
      group.add(sprite);

      // Create circular background
      const bgGeometry = new THREE.CircleGeometry(nodeSize / 2, 32);
      const bgMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color).setHex(0x333333),
      });
      const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
      bgMesh.position.set(0, 0, -1); // Place it behind the sprite
      group.add(bgMesh);

      // Add label if needed
      if (showLabels) {
        const label = new SpriteText(node.name);
        label.color = node.color;
        label.textHeight = 8;
        // label.position.set(0, -nodeSize / 2 - 5, 0);
        group.add(label);
      }

      return group;
    },
    [showLabels, nodeSize]
  );

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* Top toolbar */}
      <div className="p-4 bg-gray-100 flex justify-between items-center">
        <div className="flex space-x-4">
          <Button onClick={toggleMode} variant="outline" size="sm">
            {mode === "2d" ? (
              <Grid3X3 className="mr-2" />
            ) : (
              <Box className="mr-2" />
            )}
            {mode === "2d" ? "2D Mode" : "3D Mode"}
          </Button>
          <Button onClick={toggleLabels} variant="outline" size="sm">
            <Tag className={`mr-2 ${showLabels ? "" : "opacity-50"}`} />
            {showLabels ? "Labels On" : "Labels Off"}
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          {graphData.nodes.length}/{proteinData?.proteins.length || 0} nodes
          displayed
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-grow flex">
        <ResizablePanelGroup direction="horizontal" className="flex-grow">
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
            <div className="p-4 h-full overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Controls</h3>

              {/* Particle toggle */}
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="emit-particles" className="text-sm">
                  <Atom className="h-4 w-4 inline mr-2" />
                  Emit Particles
                </label>
                <Switch
                  checked={emitParticles}
                  onCheckedChange={setEmitParticles}
                  id="emit-particles"
                />
              </div>

              {/* Focus on click toggle */}
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="focus-on-click" className="text-sm">
                  <Focus className="h-4 w-4 inline mr-2" />
                  Focus on Click
                </label>
                <Switch
                  checked={focusOnClick}
                  onCheckedChange={setFocusOnClick}
                  id="focus-on-click"
                />
              </div>

              {/* Camera orbit controls (3D only) */}
              <div
                className={`mb-4 ${
                  mode === "2d" ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="camera-orbit" className="text-sm">
                    <Orbit className="h-4 w-4 inline mr-2" />
                    Camera Orbit
                  </label>
                  <Switch
                    checked={cameraOrbit}
                    onCheckedChange={setCameraOrbit}
                    id="camera-orbit"
                    disabled={mode === "2d"}
                  />
                </div>
                {cameraOrbit && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Speed:</span>
                    <Slider
                      value={[orbitSpeed]}
                      onValueChange={handleOrbitSpeedChange}
                      min={0}
                      max={5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70} minSize={50}>
            {/* Graph container */}
            <div className="h-[calc(100%-80px)] w-full" ref={graphContainerRef}>
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
                  linkDirectionalParticleSpeed={(d: any) => d.value * 0.001}
                  onNodeClick={handleClick}
                  nodeCanvasObject={node2D}
                  nodePointerAreaPaint={(node, color, ctx) => {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, nodeSize / 2, 0, 2 * Math.PI);
                    ctx.fill();
                  }}
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
                  linkDirectionalParticleSpeed={(d: any) => d.value * 0.001}
                  enableNodeDrag={!cameraOrbit}
                  enableNavigationControls={!cameraOrbit}
                  showNavInfo={!cameraOrbit}
                  onNodeClick={handleClick}
                  nodeThreeObject={node3D}
                  nodeThreeObjectExtend={false}
                />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Bottom RangeSlider */}
      <div className="p-4 bg-gray-100">
        {proteinData && (
          <div className="max-w-full overflow-x-auto">
            <RangeSlider
              min={Math.min(...proteinData.values)}
              max={Math.max(...proteinData.values)}
              values={scoreRange}
              onChange={handleScoreRangeChange}
              ticks={proteinData.values}
              onStepLeft={handleStepLeft}
              onStepRight={handleStepRight}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProteinRelationshipGraph;
