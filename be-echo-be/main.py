import io
from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# load model
try:
    model = YOLO("best.pt") 
    print("AI 모델 로드 성공.")
except Exception as e:
    print(f"AI 모델 로드 실패: {e}")
    model = None

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    print("이미지 수신 시작...")
    
    if not model:
        return {"success": False, "error": "모델이 로드되지 않았습니다."}

    # read image
    contents = await file.read()
    
    try:
        image = Image.open(io.BytesIO(contents))
        print("이미지 변환 성공.")
    except Exception as e:
        print(f"이미지 변환 실패: {e}")
        return {"success": False, "error": "이미지 파일 형식이 잘못되었습니다."}

    # predict
    try:
        results = model(image)
        print("AI 예측 성공.")
    except Exception as e:
        print(f"AI 예측 실패: {e}")
        return {"success": False, "error": "AI 예측 중 오류 발생"}

    # result
    detected_objects = []
    if results:
        for result in results:
            for box in result.boxes:
                class_id = int(box.cls)
                class_name = model.names[class_id]
                detected_objects.append(class_name)
    
    print(f"탐지된 객체: {detected_objects}")

    # tumbler 인증
    is_tumbler_present = "tumbler" in detected_objects
    is_disposable_present = "disposable_cup" in detected_objects
    
    success = False
    message = "error!"

    if is_tumbler_present and not is_disposable_present:
        success = True
        message = "텀블러 인증 성공!"
    elif is_disposable_present:
        message = "텀블러 인증 실패! 일회용 컵이 감지되었습니다."
    else:
        message = "텀블러 인증 실패! 텀블러가 감지되지 않았습니다."

    # 인증 성공/실패 반환
    return {"success": success, "message": message, "detected": detected_objects}