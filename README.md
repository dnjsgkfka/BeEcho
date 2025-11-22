<p align="center">
  <img alt="Image" src="https://github.com/user-attachments/assets/a96a6ca9-b623-401c-b48d-2fc46f142d5f" width="70%"/>
</p>

# 🌱 BeEcho. AI 기반 텀블러 인증 플랫폼

![React](https://img.shields.io/badge/React-19.0.2-61DAFB?logo=react)
![Python](https://img.shields.io/badge/Python-3.10-3776AB?logo=python)
![YOLOv8](https://img.shields.io/badge/AI-YOLOv8-purple)
![License](https://img.shields.io/badge/License-MIT-green.svg)

<p align="center">
  <img src="https://github.com/user-attachments/assets/7ecb2195-7723-4a1f-a5d8-24760bd1d269" width="24%" />
  <img src="https://github.com/user-attachments/assets/2d84ce7e-552e-4d3a-a1b4-fd576f5fc04e" width="24%" />
  <img src="https://github.com/user-attachments/assets/3d6264c6-55e2-43bf-9fb9-f6c34aa947ee" width="24%" />
  <img src="https://github.com/user-attachments/assets/dd03bb40-f72b-41cf-a0ca-c3117920e18a" width="24%" />
</p>

#### BeEcho.의 AI 텀블러 인증을 통해 환경 보호를 매일 실천해보세요!

## 목차
1. [AI Model & Performance](#ai-model--performance)
2. [주요 기능](#주요-기능)
3. [Demo](#demo)
4. [기술 스택](#기술-스택)
5. [레퍼런스](#레퍼런스)
6. [라이선스](#라이선스)

## AI Model & Performance

BeEcho.는 **YOLOv8 기반의 커스텀 객체 인식 모델**을 탑재하여, 실생활의 다양한 환경에서도 텀블러와 일회용 컵을 구분합니다.

### 1. Dataset

| Class | Description |
| :--- | :--- |
| **Tumbler** | 다양한 재질, 형태, 배경의 텀블러 직접 촬영 |
| **Disposable Cup** | 카페 테이크아웃 컵, 투명 플라스틱 컵 |
| **Negative Samples** | 원기둥 물체 (로션, 필통, 캔 등), 매장 컵 등 |

### 2. Labeling
labelImg를 통해 라벨링 작업을 하였습니다.
#### disposable_cup
<img src="https://github.com/user-attachments/assets/4fd69abe-9888-4d86-a5e7-3590fa399a6f" width="50%" />

#### tumbler
<img src="https://github.com/user-attachments/assets/c8db6991-d9d0-4335-949e-2c5aa79d255b" width="50%"/>


### 3. Performance Analysis

negative samples를 추가하고 tumbler, disposable cup dataset을 늘려 성능을 향상시켰습니다.

| 지표 | v01 | v02 | 증감 |
| :--- | :---: | :---: | :--- |
| Precision | 0.808 | 0.885 | ▲ 7.7%p |
| Tumbler Precision | 0.538 | 0.958 | ▲ 42.0%p |
| Tumbler mAP50 | 0.644 | 0.933 | ▲ 28.9%p  |
| Disposable Cup P | 0.908 | 0.909 | ▲ 0.1%p |

#### v01 Performance
  <img src="https://github.com/user-attachments/assets/665b2128-c1d3-4eb0-b6fc-5b03792271d2" width="80%"/>
  
<br/>

#### v02 Performance
  <img src="https://github.com/user-attachments/assets/8f8288d1-7afc-425d-a4d7-cb3217b0caac" width="80%"/>
  

### 4. Result
**[Confusion Matrix]**
<img alt="confusion_matrix" src="https://github.com/user-attachments/assets/c0c340af-36bb-4445-b808-385137ab041a" width="80%" />


**[Training Results]**
<img width="100%" alt="result" src="https://github.com/user-attachments/assets/0660015c-96cd-4779-a957-a8e0232709ae" />

---

## 주요 기능

### 1. 홈
<p>
  <img src="https://github.com/user-attachments/assets/2ae82979-1d48-46af-b836-c47038e4e0ae" width="35%" />
  <img src="https://github.com/user-attachments/assets/7ecb2195-7723-4a1f-a5d8-24760bd1d269" width="35%" />
</p>

* 사용자의 현재 티어, LP, 스트릭 현황을 확인하고 오늘의 환경 팁을 제공합니다.

### 2. 인증
<p>
  <img src="https://github.com/user-attachments/assets/14344961-0c6e-4062-9d35-339eaf34080d" width="35%" />
  <img src="https://github.com/user-attachments/assets/2d84ce7e-552e-4d3a-a1b4-fd576f5fc04e" width="35%" />
</p>

* AI 모델을 통해 실시간으로 텀블러를 촬영해 텀블러 사용을 인증합니다.

### 3. 인사이트
<p>
  <img src="https://github.com/user-attachments/assets/fc229262-ff43-4c45-82c5-38dba75ab2c3" width="35%" />
  <img src="https://github.com/user-attachments/assets/3d6264c6-55e2-43bf-9fb9-f6c34aa947ee" width="35%" />
</p>

* 활동 기록 캘린더와 주간 인증 기록을 제공합니다.

### 4. 업적
<p>
  <img src="https://github.com/user-attachments/assets/9c796142-4fb4-470a-8505-6bc16494d583" width="35%" />
  <img src="https://github.com/user-attachments/assets/dd03bb40-f72b-41cf-a0ca-c3117920e18a" width="35%" />
</p>

* 업적에 따른 배지를 부여합니다.
<p>
  <img src="https://github.com/user-attachments/assets/f26eae7c-0b0d-46de-86ce-322896a5e4a0" width="35%" />
</p>

  * 나의 BeEcho 기록을 SNS에 공유해보세요!

---

## Demo

* 자세한 기능들은 데모 비디오를 확인해보세요.

---

## 기술 스택

* Backend: FastAPI (Python)
* Frontend: React (Create React App), CSS, JavaScript
* ASGI Server: Uvicorn
* AI/ML: YOLO Model (Hugging Face)
* Hosting: Vercel

---

## 레퍼런스

### 파이썬 라이브러리

| 이름         | 링크                                       |
| ------------ | ------------------------------------------ |
| FastAPI      | https://fastapi.tiangolo.com               |
| Uvicorn      | https://www.uvicorn.org                    |
| Ultralytics  | https://docs.ultralytics.com               |
| Pillow (PIL) | https://pillow.readthedocs.io              |
| FastAPI-CORS | https://fastapi.tiangolo.com/tutorial/cors |

### JavaScript 라이브러리

| 이름             | 링크                                                             |
| ---------------- | ---------------------------------------------------------------- |
| React            | https://react.dev                                                |
| Create React App | https://create-react-app.dev                                     |
| html2canvas      | https://html2canvas.hertzen.com                                  |
| Web Storage API  | https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API |

### 웹 API

| 이름           | 링크                                                             |
| -------------- | ---------------------------------------------------------------- |
| Fetch API      | https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API       |
| FileReader API | https://developer.mozilla.org/en-US/docs/Web/API/FileReader      |
| Canvas API     | https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API      |
| Blob API       | https://developer.mozilla.org/en-US/docs/Web/API/Blob            |
| Web Share API  | https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share |

### 기타

| 이름                    | 링크                         |
| ----------------------- | ---------------------------- |
| Docker                  | https://www.docker.com       |
| YOLO (Object Detection) | https://docs.ultralytics.com |

---

## 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.

