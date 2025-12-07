![Image](https://github.com/user-attachments/assets/a5fd68c2-6070-4984-b247-1222ea2379b9)

## link

BeEcho.는 모바일 전용으로 만들어졌으며, 모바일 환경에서 사용하는 것을 권장합니다.

PC 환경도 접속이 가능하지만, 인증 시 카메라 기능이 바로 실행되지 않고 이미지 첨부 방식으로 실행됩니다.

[BeEcho.](https://be-echo-app.vercel.app)

**테스트 계정**:

ID: oss@example.com

password: 123456

## 목차

1. [Why?](#why)
2. [AI Pipeline & Strategy](#ai-pipeline--strategy)
3. [주요 기능](#주요-기능)
4. [설치 및 실행](#설치-및-실행)
5. [기술 스택](#기술-스택)
6. [레퍼런스](#레퍼런스)
7. [라이선스](#라이선스)

---

## Why?

한국은 고도로 발달된 카페 문화로 세계 최고 수준의 1인당 플라스틱 소비량을 기록하고 있습니다.

이에 국가와 학교 차원에서 플라스틱 소비량을 줄이기 위해 다각도로 텀블러 사용을 독려하고 있지만, 개인의 지속적인 실천을 이끌어내기에는 여전히 어려움이 있습니다.

**소셜 기반 챌린지**는 이러한 한계를 극복합니다. 공공적인 가치를 담은 소셜 챌린지는 개인의 동기를 부여하고, 주변과의 경쟁과 공유를 통해 지속적인 실천을 자연스럽게 유도합니다.

따라서, **BeEcho**는 소셜 기반 텀블러 인증을 통해 환경 보호 문화 확산을 독려합니다.
YOLOv8 기반 커스텀 객체인식 모델을 통해 텀블러 사용을 쉽게 인증하고, 그 결과를 공유하며 환경을 보호하는 습관을 시작해보세요!

![Image](https://github.com/user-attachments/assets/631f63af-a34d-4a8d-abdd-e6465f4169f2)

---

## AI Pipeline & Strategy

BeEcho.는 **YOLOv8 기반의 커스텀 객체 인식 모델**을 탑재하여, 실생활의 다양한 환경에서도 텀블러를 쉽게 인증할 수 있습니다.

BeEcho.는 다음과 같은 이유로 기존의 대량 데이터셋이 아닌, 600장의 소규모 데이터셋을 직접 구축하였습니다.
![Image](https://github.com/user-attachments/assets/833e9c9e-4037-4828-80b6-2bca5e0913d6)

### 1. Dataset

최종 모델의 class는 다음과 같습니다.

| Class              | Number |
| :----------------- | :----- |
| **Tumbler**        | 250    |
| **Disposable Cup** | 250    |

- **Negative Samples** (100장): 로션 통, 페트병과 같이 텀블러로 오인되기 쉬운 원기둥 물체를 라벨이 없는 배경 이미지로 추가하였습니다.

### 2. Labeling

LabelImg를 사용하여 직접 라벨링 작업을 하였습니다.

|                                             **disposable_cup**                                             |                                                **tumbler**                                                 |
| :--------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------: |
| <img src="https://github.com/user-attachments/assets/4fd69abe-9888-4d86-a5e7-3590fa399a6f" width="100%" /> | <img src="https://github.com/user-attachments/assets/c8db6991-d9d0-4335-949e-2c5aa79d255b" width="100%" /> |

### 3. Training Strategy

- **Data Split Strategy (8:1:1)**
  - 전체 600장의 데이터를 **Train(80%) : Validation(10%) : Test(10%)** 비율로 분리하여 학습하였습니다.

- **Training Configuration**
  - **Model:** `yolov8n.pt` (Nano) 모델을 기반으로 전이 학습을 수행하였습니다.
  - **Environment:** Google Colab (Tesla T4 GPU) 환경에서 학습하였습니다.
  - **Hyperparameters:**
    
    - Epochs: `100`
    - Batch Size: `16`
    - Image Size: `640`
      
      - YOLOv8 모델의 표준 입력 크기를 준수하였습니다.

학습 코드와 전체 프로세스는 다음 노트북에서 확인할 수 있습니다:

**[학습 노트북 확인하기](https://github.com/dnjsgkfka/be-echo/blob/main/be-echo-yolo/be_echo_yolo.ipynb)**


### 4. Performance Analysis

초기 모델은 텀블러 100장, 일회용 컵 100장의 데이터셋으로 학습하였으며 다음과 같은 문제점이 있어 개선 및 확장하였습니다.

![Image](https://github.com/user-attachments/assets/55a8d72b-54a6-4f06-a2d4-241429a66b75)

개선 결과 텀블러 정확도가 42%p, 재현율은 약 10%p가 증가하며 모델의 정확도가 매우 높아졌습니다.

| 지표              |  v01  |  v02  | 증감     |
| :---------------- | :---: | :---: | :------- |
| Precision         | 0.808 | 0.885 | ▲ 7.7%p  |
| Tumbler Precision | 0.538 | 0.958 | ▲ 42.0%p |
| Tumbler Recall    | 0.727 | 0.811 | ▲ 9.7%p  |
| Tumbler mAP50     | 0.644 | 0.933 | ▲ 28.9%p |

#### v01 Performance

  <img src="https://github.com/user-attachments/assets/665b2128-c1d3-4eb0-b6fc-5b03792271d2" width="80%"/>
  
<br/>

#### v02 Performance

  <img src="https://github.com/user-attachments/assets/8f8288d1-7afc-425d-a4d7-cb3217b0caac" width="80%"/>

### 5. Result

<img width="60%" alt="result" src="https://github.com/user-attachments/assets/0660015c-96cd-4779-a957-a8e0232709ae" />

---

## 주요 기능

![홈](https://github.com/user-attachments/assets/39a19f01-44ec-4d40-b6c8-3f911b587003)
![인증](https://github.com/user-attachments/assets/57a6d783-0226-40ac-8610-85fe070d4188)
![텀블러](https://github.com/user-attachments/assets/4a2afd1e-ac22-4e45-9bfb-c87342c12ef9)
![일회용컵](https://github.com/user-attachments/assets/2ad35e7d-8cb4-41b6-8b77-61a0ba29da98)
![원기둥물체](https://github.com/user-attachments/assets/275e3098-0cb8-4c6c-8a14-4a52b8e295af)
![그룹1](https://github.com/user-attachments/assets/0ca462c8-d22b-4724-994e-b50d344ff66d)
![그룹2](https://github.com/user-attachments/assets/445b87b9-e503-477b-94eb-b4e8d858a0cb)
![랭킹](https://github.com/user-attachments/assets/7906ccfd-bdfd-4a2d-8f4e-930e92a713ef)
![통계](https://github.com/user-attachments/assets/4af25a57-fbd9-4406-8f1a-43c9a786aad7)

---

## 설치 및 실행

### 사전 요구사항

- **Node.js**: 16.x 이상
- **Package Manager**: npm 또는 yarn
- **Python**: 3.8 이상
- **Firebase**: Firebase 프로젝트 (Firebase Console에서 생성)

### 1. 프론트엔드 설정

#### 1.1 저장소 클론 및 의존성 설치

```bash
cd be-echo-fe
npm install
```

#### 1.2 환경 변수 설정

프로젝트 루트(`be-echo-fe/`)에 `.env` 파일을 생성하고 다음 환경 변수를 설정하세요.

```env
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

#### 1.3 개발 서버 실행

```bash
npm start
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

### 2. 백엔드 설정

#### 2.1 의존성 설치

```bash
cd be-echo-be
pip install -r requirements.txt
```

#### 2.2 AI 모델 파일 확인

`be-echo-be/best.pt` 파일이 있는지 확인하세요.

#### 2.3 서버 실행

```bash
# 개발 서버 실행
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 또는 프로덕션 모드
uvicorn main:app --host 0.0.0.0 --port 8000
```

백엔드 서버는 `http://localhost:8000`에서 실행됩니다.

### 3. 전체 실행 가이드

터미널 2개를 열어서 각각 실행해주세요.

1. **터미널 1 (백엔드):**

   ```bash
   cd be-echo-be
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **터미널 2 (프론트엔드):**

   ```bash
   cd be-echo-fe
   npm start
   ```

3. 브라우저에서 `http://localhost:3000` 접속

### 4. 빌드 (프로덕션 배포용)

#### 프론트엔드 빌드

```bash
cd be-echo-fe
npm run build
```

빌드된 파일은 `be-echo-fe/build/` 디렉토리에 생성됩니다.

---

## 기술 스택

![Image](https://github.com/user-attachments/assets/e9698e83-6a35-4e37-b449-3230dc52b0ae)

| Category        | Technology           |
| :-------------- | :------------------- |
| **Frontend**    | React (CRA)          |
| **Backend**     | FastAPI, Firebase    |
| **AI**          | YOLOv8, Google Colab |
| **Hosting**     | Vercel, Hugging face |
| **ASGI Server** | Uvicorn              |

---

## 레퍼런스

### 파이썬 라이브러리

| 이름             | 링크                                         |
| ---------------- | -------------------------------------------- |
| FastAPI          | https://fastapi.tiangolo.com                 |
| Uvicorn          | https://www.uvicorn.org                      |
| Ultralytics      | https://docs.ultralytics.com                 |
| Pillow (PIL)     | https://pillow.readthedocs.io                |
| FastAPI-CORS     | https://fastapi.tiangolo.com/tutorial/cors   |
| Python-Multipart | https://github.com/andrew-d/python-multipart |

### JavaScript 라이브러리

| 이름                      | 링크                                        |
| ------------------------- | ------------------------------------------- |
| React                     | https://react.dev                           |
| React DOM                 | https://react.dev/reference/react-dom       |
| Create React App          | https://create-react-app.dev                |
| Firebase                  | https://firebase.google.com                 |
| html2canvas               | https://html2canvas.hertzen.com             |
| @testing-library/react    | https://testing-library.com/react           |
| @testing-library/jest-dom | https://github.com/testing-library/jest-dom |

### 도구 및 플랫폼

| 이름                    | 링크                                    |
| ----------------------- | --------------------------------------- |
| labelImg                | https://github.com/heartexlabs/labelImg |
| Google Colab            | https://colab.research.google.com       |
| Docker                  | https://www.docker.com                  |
| YOLO (Object Detection) | https://docs.ultralytics.com            |

### 웹 API

| 이름            | 링크                                                             |
| --------------- | ---------------------------------------------------------------- |
| Fetch API       | https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API       |
| FileReader API  | https://developer.mozilla.org/en-US/docs/Web/API/FileReader      |
| Canvas API      | https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API      |
| Blob API        | https://developer.mozilla.org/en-US/docs/Web/API/Blob            |
| Web Share API   | https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share |
| Clipboard API   | https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API   |
| URL API         | https://developer.mozilla.org/en-US/docs/Web/API/URL             |
| Web Storage API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API |
| Base64 API      | https://developer.mozilla.org/en-US/docs/Glossary/Base64         |

---

## 라이선스

본 프로젝트는 Core AI 엔진으로 Ultralytics YOLOv8을 사용하고 있습니다. YOLOv8은 AGPL-3.0 라이선스를 따르고 있으며, 이는 소스코드를 공개해야 한다는 의무 조항을 포함합니다.

이에 따라 라이선스 전염성을 준수하기 위해, 본 프로젝트 또한 AGPL-3.0 라이선스를 채택하여 전체 소스코드를 투명하게 공개하였습니다.
