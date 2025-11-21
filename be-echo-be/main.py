import io
from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
from PIL import Image, ImageOps
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
        image = ImageOps.exif_transpose(image)
        print("이미지 변환 성공 및 회전 보정 성공.")
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
        message = "텀블러 인증 성공! 내일도 beEcho 인증으로 지구를 지켜보세요."
    elif is_disposable_present:
        message = "일회용 컵으로 인식됩니다. 내일은 텀블러 사용으로 환경 보호를 실천해보세요! "
    else:
        message = "텀블러가 아닌 다른 객체이거나, 아무것도 인식되지 않고 있습니다. 다시 시도해보세요."

    # 인증 성공/실패 반환
    return {"success": success, "message": message, "detected": detected_objects}
