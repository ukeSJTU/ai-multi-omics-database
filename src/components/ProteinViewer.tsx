"use client";

import React, { useEffect, useRef, useState } from "react";
import * as $3Dmol from "3dmol";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProteinViewerProps {
  pdbId: string;
}

const ProteinViewer: React.FC<ProteinViewerProps> = ({ pdbId }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<any>(null);
  const [style, setStyle] = useState<string>("cartoon");
  const [colorScheme, setColorScheme] = useState<string>("spectrum");
  const [error, setError] = useState<string | null>(null);
  const [pdbData, setPdbData] = useState<string | null>(null);

  useEffect(() => {
    if (viewerRef.current && !viewer) {
      const v = $3Dmol.createViewer(viewerRef.current, {
        backgroundColor: "white",
      });
      setViewer(v);

      fetch(`/api/protein-info?id=${pdbId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.alias) {
            return fetch(`/pdb/${data.alias}.pdb`);
          } else {
            throw new Error("Alias not found for the given pdbId");
          }
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error("PDB file not found");
          }
          return response.text();
        })
        .then((data) => {
          setPdbData(data);
          setError(null);
        })
        .catch((error) => {
          console.error("Error loading PDB file:", error);
          setError(error.message);
        });
    }

    return () => {
      if (viewer) {
        viewer.clear();
      }
    };
  }, [pdbId, viewer]);

  const updateStyle = (v: any, newStyle: string, newColorScheme: string) => {
    if (!v || !pdbData) return;

    v.clear();
    v.addModel(pdbData, "pdb");

    if (newStyle === "cartoon") {
      v.setStyle({}, { cartoon: { color: newColorScheme } });
    } else if (newStyle === "stick") {
      v.setStyle({}, { stick: { color: newColorScheme } });
    }

    v.zoomTo();
    v.render();
  };

  useEffect(() => {
    if (viewer && pdbData && !error) {
      updateStyle(viewer, style, colorScheme);
    }
  }, [style, colorScheme, viewer, pdbData, error]);

  return (
    <div className="protein-viewer-container w-[600px] mx-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
      <div
        ref={viewerRef}
        className="h-[400px] w-full relative mb-4"
        id="viewer"
      />
      {error ? (
        <div className="text-red-500 text-center">
          {error === "Alias not found for the given pdbId"
            ? "Protein structure not available for this ID."
            : "Unable to load protein structure. Please try again later."}
        </div>
      ) : (
        <div className="flex justify-between">
          <div className="flex items-center space-x-2">
            <label>Style: </label>
            <Select value={style} onValueChange={setStyle} disabled={!!error}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cartoon">Cartoon</SelectItem>
                <SelectItem value="stick">Stick</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <label>Color: </label>
            <Select
              value={colorScheme}
              onValueChange={setColorScheme}
              disabled={!!error}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select color scheme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spectrum">Spectrum</SelectItem>
                <SelectItem value="chainHetatm">Chain</SelectItem>
                <SelectItem value="secondary structure">
                  Secondary Structure
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProteinViewer;
