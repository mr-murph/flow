"use client";

import React, { useEffect, useRef } from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";

interface DicomViewerProps {
  imageUrl: string; // URL of the DICOM image (e.g., from GCS or Healthcare API)
}

export function DicomViewer({ imageUrl }: DicomViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    cornerstoneTools.init();
    cornerstoneWADOImageLoader.webWorkerManager.initialize({
      maxWebWorkers: navigator.hardwareConcurrency || 1,
      startWebWorkersOnDemand: true,
      taskConfiguration: {
        decodeTask: { preferSleuth: true },
      },
    });

    const element = viewerRef.current;
    cornerstone.enable(element);

    const loadImage = async () => {
      try {
        const imageId = `wadouri:${imageUrl}`; // Assuming WADO-URI for Healthcare API or similar
        const image = await cornerstone.loadImage(imageId);
        cornerstone.displayImage(element, image);

        // Add tools (e.g., pan, zoom, W/L)
        cornerstoneTools.addTool(cornerstoneTools.PanTool);
        cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
        cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
        cornerstoneTools.setToolActive(cornerstoneTools.PanTool.toolName, { mouseButtonMask: 1 });
        cornerstoneTools.setToolActive(cornerstoneTools.ZoomTool.toolName, { mouseButtonMask: 2 });
        cornerstoneTools.setToolActive(cornerstoneTools.WwwcTool.toolName, { mouseButtonMask: 4 });

      } catch (error) {
        console.error("Error loading DICOM image:", error);
      }
    };

    loadImage();

    return () => {
      cornerstone.disable(element);
      cornerstoneTools.clearTools();
    };
  }, [imageUrl]);

  return (
    <div
      ref={viewerRef}
      className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-500"
      style={{ position: "relative" }}
    >
      {/* Loader or message can be added here */}
      Loading DICOM image...
    </div>
  );
}
