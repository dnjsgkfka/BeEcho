![Image](https://github.com/user-attachments/assets/a54b40bd-c3fe-4778-b705-6658f2d7dd3f)

## link

## 목차

1. [Why?](#why)
2. [주요 기능](#주요-기능)
3. [AI Model & Performance](#ai-model--performance)
4. [Demo](#demo)
5. [기술 스택](#기술-스택)
6. [레퍼런스](#레퍼런스)
7. [라이선스](#라이선스)

---

## Why?

매일의 작은 실천이 모여 큰 사회적 변화를 만듭니다.

BeEcho.는 소셜 기반 텀블러 인증을 통해 환경 보호 문화 확산을 독려합니다.

![Image](https://github.com/user-attachments/assets/3d3f74b4-0774-4e3d-a68d-eef18a1ba890)

---

## 주요 기능
![Image](https://github.com/user-attachments/assets/ef0a61c8-608f-4de0-bdb8-f22f12b9928f)
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/628878cc-6318-46db-b228-03a0e4328aa3" />
![Image](https://github.com/user-attachments/assets/3fed8aa5-d574-4282-b27c-6b899720532c)
![Image](https://github.com/user-attachments/assets/c493c7e5-a932-4ac3-9e72-cb9b763fd3f0)

---

## AI Model & Performance

BeEcho.는 **YOLOv8 기반의 커스텀 객체 인식 모델**을 탑재하여, 실생활의 다양한 환경에서도 텀블러와 일회용 컵을 구분합니다.

### 1. Dataset

| Class                | Description                                 |
| :------------------- | :------------------------------------------ |
| **Tumbler**          | 다양한 재질, 형태, 배경의 텀블러 직접 촬영  |
| **Disposable Cup**   | 카페 테이크아웃 컵, 투명 플라스틱 컵        |
| **Negative Samples** | 원기둥 물체 (로션, 필통, 캔 등), 매장 컵 등 |

### 2. Labeling

labelImg를 통해 라벨링 작업을 하였습니다.

#### disposable_cup

<img src="https://github.com/user-attachments/assets/4fd69abe-9888-4d86-a5e7-3590fa399a6f" width="50%" />

#### tumbler

<img src="https://github.com/user-attachments/assets/c8db6991-d9d0-4335-949e-2c5aa79d255b" width="50%"/>

### 3. Performance Analysis

negative samples를 추가하고 tumbler, disposable cup dataset을 늘려 성능을 향상시켰습니다.

| 지표              |  v01  |  v02  | 증감     |
| :---------------- | :---: | :---: | :------- |
| Precision         | 0.808 | 0.885 | ▲ 7.7%p  |
| Tumbler Precision | 0.538 | 0.958 | ▲ 42.0%p |
| Tumbler mAP50     | 0.644 | 0.933 | ▲ 28.9%p |
| Disposable Cup P  | 0.908 | 0.909 | ▲ 0.1%p  |

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

## Demo

- 자세한 기능들은 데모 비디오를 확인해보세요.

---

## 기술 스택

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React (CRA) | UI 구축 및 컴포넌트 기반 개발 |
| **Backend** | FastAPI | Python 기반 고성능 비동기 API 서버 |
| **AI / ML** | YOLOv8 | 객체 인식 및 커스텀 모델 학습 |
| **Database** | Firebase | 사용자 데이터 및 이미지 저장 |
| **Hosting** | Vercel | 프론트엔드 배포 및 호스팅 |
| **Server** | Uvicorn | ASGI 웹 서버 구현체 |

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

| 이름             | 링크                                  |
| ---------------- | ------------------------------------- |
| React            | https://react.dev                     |
| React DOM        | https://react.dev/reference/react-dom |
| Create React App | https://create-react-app.dev          |
| Firebase         | https://firebase.google.com           |
| html2canvas      | https://html2canvas.hertzen.com       |
| Web Vitals       | https://web.dev/vitals/               |

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

### 기타

| 이름                    | 링크                         |
| ----------------------- | ---------------------------- |
| Docker                  | https://www.docker.com       |
| YOLO (Object Detection) | https://docs.ultralytics.com |

---

## 라이선스

본 프로젝트는 Core AI 엔진으로 Ultralytics YOLOv8을 사용하고 있습니다. YOLOv8은 AGPL-3.0 라이선스를 따르고 있으며, 이는 네트워크를 통해 서비스를 제공하는 경우(SaaS) 소스코드를 공개해야 한다는 의무 조항을 포함합니다.

이에 따라 라이선스 전염성(Copyleft)을 준수하기 위해, 본 프로젝트(Front/Back) 또한 AGPL-3.0 라이선스를 채택하여 전체 소스코드를 투명하게 공개하였습니다.