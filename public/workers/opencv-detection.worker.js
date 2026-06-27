/* Classic Web Worker — detecção híbrida: contorno (longe) + nitidez na área guia (perto). */
const OPENCV_SCRIPT = "/opencv/opencv.js";
const ANALYSIS_WIDTH = 480;
const ANALYSIS_HEIGHT = 360;
const MIN_CONTOUR_AREA_RATIO = 0.05;
const GUIDE_MARGIN_X = 0.1;
const GUIDE_MARGIN_Y = 0.15;
/** Laplacian stddev mínimo para considerar a imagem nítida o suficiente (modo guia). */
const SHARPNESS_MIN = 28;
/** Área relativa acima da qual aceitamos o maior contorno como "nota preenchendo tela" */
const LARGE_CONTOUR_AREA_RATIO = 0.40;

/** @type {import("@techstark/opencv-js") | null} */
let opencv = null;
let cvReady = false;

function post(message) {
  self.postMessage(message);
}

async function loadOpenCv() {
  importScripts(OPENCV_SCRIPT);

  const cvExport = self.cv;
  if (!cvExport) {
    throw new Error("OpenCV não carregou no worker");
  }

  if (typeof cvExport === "function") {
    opencv = await cvExport();
  } else if (cvExport instanceof Promise) {
    opencv = await cvExport;
  } else if (cvExport.Mat) {
    opencv = cvExport;
  } else {
    await new Promise((resolve) => {
      cvExport.onRuntimeInitialized = resolve;
    });
    opencv = cvExport;
  }

  self.cv = opencv;
}

function extractPolygon(approx) {
  const polygon = [];
  for (let j = 0; j < 4; j++) {
    let x = 0;
    let y = 0;
    if (approx.data32S && approx.data32S.length >= (j + 1) * 2) {
      x = approx.data32S[j * 2];
      y = approx.data32S[j * 2 + 1];
    } else {
      x = approx.intPtr(j, 0);
      y = approx.intPtr(j, 1);
    }
    polygon.push([x, y]);
  }
  return polygon;
}

function buildGuidePolygon(width, height) {
  const mx = width * GUIDE_MARGIN_X;
  const my = height * GUIDE_MARGIN_Y;
  return [
    [mx, my],
    [width - mx, my],
    [width - mx, height - my],
    [mx, height - my],
  ];
}

function scoreContour(polygon, area, imageArea) {
  const areaRatio = area / imageArea;
  const xs = polygon.map((point) => point[0]);
  const ys = polygon.map((point) => point[1]);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  const aspect = Math.max(width, height) / Math.max(1, Math.min(width, height));
  const aspectBonus = aspect >= 1.05 && aspect <= 5 ? 1.2 : 1;
  return areaRatio * aspectBonus;
}

/**
 * Build a bounding-box quad from any contour — used when the note fills most of the frame
 * and approxPolyDP can't find clean 4 corners.
 */
function boundingBoxPolygon(contour) {
  const rect = opencv.boundingRect(contour);
  return [
    [rect.x, rect.y],
    [rect.x + rect.width, rect.y],
    [rect.x + rect.width, rect.y + rect.height],
    [rect.x, rect.y + rect.height],
  ];
}

/**
 * Find edges using Canny. When sharpness is high (close-up), use more sensitive thresholds
 * so Canny can detect edges even when they are softer/less contrasted due to proximity.
 */
function findEdges(gray, edges, sharpness) {
  const blurred = new opencv.Mat();
  const kernel = opencv.Mat.ones(3, 3, opencv.CV_8U);
  const isCloseUp = sharpness >= SHARPNESS_MIN;

  try {
    opencv.GaussianBlur(gray, blurred, new opencv.Size(5, 5), 0);
    // More sensitive thresholds for close-up shots to catch softer edges
    const lowThresh = isCloseUp ? 20 : 30;
    const highThresh = isCloseUp ? 80 : 100;
    opencv.Canny(blurred, edges, lowThresh, highThresh);
    opencv.dilate(edges, edges, kernel);
  } finally {
    blurred.delete();
    kernel.delete();
  }
}

function measureSharpness(gray, width, height) {
  const marginX = Math.floor(width * GUIDE_MARGIN_X);
  const marginY = Math.floor(height * GUIDE_MARGIN_Y);
  const roiW = Math.max(8, width - marginX * 2);
  const roiH = Math.max(8, height - marginY * 2);
  const rect = new opencv.Rect(marginX, marginY, roiW, roiH);
  const roi = gray.roi(rect);
  const laplacian = new opencv.Mat();
  const stddev = new opencv.Mat();

  try {
    opencv.Laplacian(roi, laplacian, opencv.CV_64F);
    opencv.meanStdDev(laplacian, new opencv.Mat(), stddev);
    return stddev.data64F[0];
  } finally {
    roi.delete();
    laplacian.delete();
    stddev.delete();
  }
}

function findBestDocumentContour(gray, edges, contours, hierarchy, sharpness) {
  findEdges(gray, edges, sharpness);
  opencv.findContours(edges, contours, hierarchy, opencv.RETR_LIST, opencv.CHAIN_APPROX_SIMPLE);

  const imageArea = gray.rows * gray.cols;
  const contourCount = Math.min(contours.size(), 25);
  let best = null;
  let largestContour = null;
  let largestArea = 0;

  for (let i = 0; i < contourCount; i++) {
    const contour = contours.get(i);
    const area = opencv.contourArea(contour);

    // Track the largest contour for the close-up fallback
    if (area > largestArea) {
      largestArea = area;
      if (largestContour) largestContour.delete();
      largestContour = contour.clone();
    }

    const perimeter = opencv.arcLength(contour, true);
    if (perimeter < 40) {
      contour.delete();
      continue;
    }

    const approx = new opencv.Mat();
    opencv.approxPolyDP(contour, approx, 0.02 * perimeter, true);

    if (approx.rows === 4) {
      if (area > imageArea * MIN_CONTOUR_AREA_RATIO) {
        const polygon = extractPolygon(approx);
        const score = scoreContour(polygon, area, imageArea);
        if (!best || score > best.score) {
          best = { polygon, areaRatio: area / imageArea, score };
        }
      }
    }

    approx.delete();
    contour.delete();
  }

  // Close-up fallback: if the largest contour covers a large portion of the frame
  // but approxPolyDP didn't produce a clean quad, use its bounding box.
  if (!best && largestContour && largestArea > imageArea * LARGE_CONTOUR_AREA_RATIO) {
    const polygon = boundingBoxPolygon(largestContour);
    best = { polygon, areaRatio: largestArea / imageArea, score: largestArea / imageArea };
  }

  if (largestContour) largestContour.delete();

  return best;
}

function detectDocument(imageData) {
  const src = opencv.matFromImageData(imageData);
  const resized = new opencv.Mat();
  const gray = new opencv.Mat();
  const edges = new opencv.Mat();
  const contours = new opencv.MatVector();
  const hierarchy = new opencv.Mat();

  try {
    opencv.resize(src, resized, new opencv.Size(ANALYSIS_WIDTH, ANALYSIS_HEIGHT));
    opencv.cvtColor(resized, gray, opencv.COLOR_RGBA2GRAY);

    const sharpness = measureSharpness(gray, ANALYSIS_WIDTH, ANALYSIS_HEIGHT);
    const contourResult = findBestDocumentContour(gray, edges, contours, hierarchy, sharpness);

    const scaleX = imageData.width / ANALYSIS_WIDTH;
    const scaleY = imageData.height / ANALYSIS_HEIGHT;

    if (contourResult) {
      const polygon = contourResult.polygon.map(([x, y]) => [x * scaleX, y * scaleY]);
      post({
        type: "result",
        detected: true,
        polygon,
        areaRatio: contourResult.areaRatio,
        mode: "contour",
        sharpness,
      });
      return;
    }

    if (sharpness >= SHARPNESS_MIN) {
      const guide = buildGuidePolygon(imageData.width, imageData.height);
      const guideArea =
        (imageData.width * (1 - 2 * GUIDE_MARGIN_X)) *
        (imageData.height * (1 - 2 * GUIDE_MARGIN_Y));
      post({
        type: "result",
        detected: true,
        polygon: guide,
        areaRatio: guideArea / (imageData.width * imageData.height),
        mode: "guide",
        sharpness,
      });
      return;
    }

    post({
      type: "result",
      detected: false,
      polygon: buildGuidePolygon(imageData.width, imageData.height),
      areaRatio: 0,
      mode: "none",
      sharpness,
    });
  } finally {
    src.delete();
    resized.delete();
    gray.delete();
    edges.delete();
    contours.delete();
    hierarchy.delete();
  }
}

function handleDetect(message) {
  if (!cvReady || !opencv) {
    post({
      type: "result",
      detected: false,
      polygon: null,
      areaRatio: 0,
      mode: "none",
      sharpness: 0,
    });
    return;
  }

  try {
    detectDocument(message.imageData);
  } catch (error) {
    post({
      type: "error",
      message: error instanceof Error ? error.message : "Detection failed",
    });
  }
}

self.onmessage = (event) => {
  if (event.data?.type === "detect") {
    handleDetect(event.data);
  }
};

void loadOpenCv()
  .then(() => {
    cvReady = true;
    post({ type: "ready" });
  })
  .catch((error) => {
    post({
      type: "error",
      message: error instanceof Error ? error.message : "Failed to load OpenCV",
    });
  });
