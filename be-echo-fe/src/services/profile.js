import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../config/firebase";
import { logError } from "../utils/logger";

/**
 * DataURL을 Blob으로 변환
 */
const dataURLtoBlob = (dataURL) => {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * 프로필 사진을 Firebase Storage에 업로드하고 URL 반환
 * @param {string} imageDataUrl - Base64 이미지 데이터 URL
 * @param {string} userId - 사용자 ID
 * @returns {Promise<string>} 이미지 다운로드 URL
 */
export const uploadProfileImage = async (imageDataUrl, userId) => {
  try {
    const fileName = `profiles/${userId}/profile.jpg`;
    const storageRef = ref(storage, fileName);

    const blob = dataURLtoBlob(imageDataUrl);
    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    logError("프로필 사진 업로드 오류:", error);
    throw error;
  }
};

/**
 * 기존 프로필 사진 삭제
 * @param {string} userId - 사용자 ID
 */
export const deleteProfileImage = async (userId) => {
  try {
    const fileName = `profiles/${userId}/profile.jpg`;
    const storageRef = ref(storage, fileName);
    await deleteObject(storageRef);
  } catch (error) {
    // 파일이 없어도 에러 무시
    if (error.code !== "storage/object-not-found") {
      logError("프로필 사진 삭제 오류:", error);
    }
  }
};
