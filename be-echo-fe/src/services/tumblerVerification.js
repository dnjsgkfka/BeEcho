import { logWarn } from "../utils/logger";

const MOCK_DELAY = 900;
const YOLO_BASE_URL =
  process.env.REACT_APP_TUMBLER_BASE_URL ||
  "https://hamhoon-be-echo-be-aeb4cb2.hf.space";
const YOLO_EXTRA_PATH = process.env.REACT_APP_TUMBLER_PATH || "";

const CANDIDATE_PATHS = [YOLO_EXTRA_PATH, "/predict", "/predict/"];

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const mockResponse = async (file, imageDataUrl) => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  return {
    success: true,
    message: "목업 텀블러 인증 결과입니다.",
    detected: ["tumbler"],
    mocked: true,
    filename: file?.name ?? "capture.jpg",
    timestamp: Date.now(),
    imageDataUrl,
  };
};

const parsePrediction = (data = {}) => {
  if (data.success !== undefined) {
    return data;
  }
  if (Array.isArray(data.data) && data.data.length > 0) {
    return data.data[0];
  }
  return data;
};

const callYoloEndpoint = async (url, file) => {
  const formData = new FormData();
  formData.append("file", file, file.name || "capture.jpg");

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`YOLO 서버 응답 오류: ${response.status}`);
  }

  return response.json();
};

export const verifyTumblerImage = async (file) => {
  if (!file) {
    throw new Error("인증할 이미지를 찾을 수 없습니다.");
  }

  const dataUrl = await readFileAsDataUrl(file);

  for (const path of CANDIDATE_PATHS) {
    if (!path) continue;
    const endpoint = `${YOLO_BASE_URL}${path}`.replace(/(?<!:)\/+/g, "/");
    try {
      const payload = await callYoloEndpoint(endpoint, file);
      const prediction = parsePrediction(payload);

      const success = prediction?.success ?? false;
      const message = prediction?.message || "인증 결과를 확인할 수 없습니다.";
      const detected = prediction?.detected || [];

      return {
        success: Boolean(success),
        message: message,
        detected: detected,
        imageDataUrl: dataUrl,
        raw: payload,
        endpoint,
      };
    } catch (error) {
      logWarn(`YOLO 엔드포인트 ${path} 호출 실패`, error);
    }
  }

  logWarn("사용 가능한 YOLO 엔드포인트를 찾지 못해 목업 데이터를 반환합니다.");
  return mockResponse(file, dataUrl);
};
