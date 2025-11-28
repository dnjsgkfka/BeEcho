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

      const confidence =
        prediction?.confidence ?? prediction?.score ?? prediction?.prob ?? null;
      const label = prediction?.label ?? "unknown";
      const success =
        prediction?.success ??
        (typeof confidence === "number"
          ? confidence >= 0.5
          : label === "tumbler");

      return {
        success: Boolean(success),
        message:
          prediction?.message ||
          (success
            ? "텀블러 인증을 완료했어요!"
            : "텀블러로 인식되지 않았어요."),
        confidence: typeof confidence === "number" ? confidence : null,
        imageDataUrl: dataUrl,
        raw: payload,
        endpoint,
      };
    } catch (error) {
      // 404나 기타 오류면 다음 후보 경로로 시도합니다.
      // eslint-disable-next-line no-console
      logWarn(`YOLO 엔드포인트 ${path} 호출 실패`, error);
    }
  }

  logWarn("사용 가능한 YOLO 엔드포인트를 찾지 못해 목업 데이터를 반환합니다.");
  return mockResponse(file, dataUrl);
};
