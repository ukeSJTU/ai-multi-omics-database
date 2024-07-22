"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as $3Dmol from '3dmol';

interface ProteinViewerProps {
  pdbId: string;
}

const ProteinViewer: React.FC<ProteinViewerProps> = ({ pdbId }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<any>(null);
  const [style, setStyle] = useState<string>('cartoon');
  const [colorScheme, setColorScheme] = useState<string>('spectrum');

  useEffect(() => {
    if (viewerRef.current && !viewer) {
      const v = $3Dmol.createViewer(viewerRef.current, {
        backgroundColor: 'white',
      });
      setViewer(v);

      fetch(`/pdb/1A00.pdb`)
        .then(response => response.text())
        .then(data => {
          v.addModel(data, 'pdb');
          updateStyle(v, style, colorScheme);
          v.zoomTo();
          v.render();
        })
        .catch(error => console.error('Error loading PDB file:', error));
    }

    return () => {
      if (viewer) {
        viewer.clear();
      }
    };
  }, [pdbId]);

  const updateStyle = (v: any, newStyle: string, newColorScheme: string) => {
    v.setStyle({}, {}); // Clear previous styles
    if (newStyle === 'cartoon') {
      v.setStyle({}, {cartoon: {colorscheme: newColorScheme, opacity: 0.8}});
      v.setStyle({hetflag: false}, {cartoon: {color: newColorScheme}});
      v.addSurface($3Dmol.SurfaceType.VDW, {
        opacity: 0.1,
        color: 'white'
      });
    } else if (newStyle === 'stick') {
      v.setStyle({}, {stick: {colorscheme: newColorScheme}});
    }
    v.render();
  };

  useEffect(() => {
    if (viewer) {
      updateStyle(viewer, style, colorScheme);
    }
  }, [style, colorScheme, viewer]);

  return (
    <div className="protein-viewer-container" style={{ width: '600px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '8px', padding: '16px', backgroundColor: '#f9f9f9' }}>
      <div ref={viewerRef} style={{ height: '400px', width: '100%', position: "relative", marginBottom: '16px' }} />
      <div className="controls" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <label>Style: </label>
          <select value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="cartoon">Cartoon</option>
            <option value="stick">Stick</option>
          </select>
        </div>
        <div>
          <label>Color: </label>
          <select value={colorScheme} onChange={(e) => setColorScheme(e.target.value)}>
            <option value="spectrum">Spectrum</option>
            <option value="chainHetatm">Chain</option>
            <option value="secondary structure">Secondary Structure</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProteinViewer;