"use client";

import React, { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol';

interface ProteinViewerProps {
  pdbId: string;
}

const ProteinViewer: React.FC<ProteinViewerProps> = ({ pdbId }) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewerRef.current) {
      const viewer = $3Dmol.createViewer(viewerRef.current, {
        backgroundColor: 'white',
      });

    //   fetch(`/pdb/${pdbId}.pdb`)
      fetch(`/pdb/1A00.pdb`)
        .then(response => response.text())
        .then(data => {
          viewer.addModel(data, 'pdb');
        //   viewer.setStyle({}, { stick: {} });
          // Set style to cartoon (ribbon) representation
          viewer.setStyle({}, {cartoon: {colorscheme: 'chainHetatm', opacity: 0.8}});
          
          // Add some secondary structure coloring
          viewer.setStyle({hetflag: false}, {cartoon: {color: 'spectrum'}});
          
          // Optional: Add a subtle outline to enhance visibility
          viewer.addSurface($3Dmol.SurfaceType.VDW, {
            opacity:0.1,
            color:'white'
          });
          viewer.zoomTo();
          viewer.render();
          viewer.zoom(1.2, 1000);
        })
        .catch(error => console.error('Error loading PDB file:', error));

      return () => {
        viewer.clear();
      };
    }
  }, [pdbId]);

  return <div ref={viewerRef} style={{ height: '400px', width: '100%', position: "relative"}} />;
};

export default ProteinViewer;