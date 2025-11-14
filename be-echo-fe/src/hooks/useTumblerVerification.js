import { useCallback, useMemo, useState } from "react";
import { verifyTumblerImage } from "../services/tumblerVerification";

const INITIAL_STATE = {
  status: "idle",
  result: null,
  error: null,
};

const useTumblerVerification = (options = {}) => {
  const { onSuccess, onError } = options;
  const [state, setState] = useState(INITIAL_STATE);

  const verifyImage = useCallback(
    async (file) => {
      if (!file) {
        return;
      }

      setState({ status: "loading", result: null, error: null });

      try {
        const result = await verifyTumblerImage(file);
        setState({ status: "success", result, error: null });
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } catch (error) {
        const formattedError =
          error instanceof Error ? error : new Error("인증에 실패했어요.");
        setState({
          status: "error",
          result: null,
          error: formattedError,
        });
        if (onError) {
          onError(formattedError);
        }
        throw formattedError;
      }
    },
    [onError, onSuccess]
  );

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  const message = useMemo(() => {
    if (state.status === "loading") return "인증 처리가 진행 중이에요...";
    if (state.status === "success") {
      if (state.result?.message) {
        return state.result.message;
      }
    }
    if (state.status === "error") {
      return state.error?.message ?? "인증에 실패했어요.";
    }
    return null;
  }, [state]);

  return {
    ...state,
    message,
    verifyImage,
    reset,
  };
};

export default useTumblerVerification;
