![Image](https://github.com/user-attachments/assets/a54b40bd-c3fe-4778-b705-6658f2d7dd3f)

## link
BeEcho.는 모바일 전용으로 만들어졌으며, 모바일 환경에서 사용하는 것을 권장합니다.

PC 환경도 접속이 가능하지만, 인증 시 카메라 기능이 실행되지 않고 이미지 첨부 방식으로 실행됩니다.

[BeEcho.](be-echo-app.vercel.app)

**테스트 계정**:

ID: 4@naver.com

password: halam0427!

## 목차

1. [Why?](#why)
2. [주요 기능](#주요-기능)
3. [AI Model & Performance](#ai-model--performance)
4. [설치 및 실행](#설치-및-실행행)
5. [기술 스택](#기술-스택)
6. [레퍼런스](#레퍼런스)
7. [라이선스](#라이선스)

---

## Why?

한국은 고도로 발달된 카페 문화로 세계 최고 수준의 1인당 플라스틱 소비량을 기록하고 있습니다.

이에 국가와 학교 차원에서 플라스틱 소비량을 줄이기 위해 다각도로 텀블러 사용을 독려하고 있지만, 개인의 지속적인 실천을 이끌어내기에는 여전히 어려움이 있습니다.

**소셜 기반 챌린지**는 이러한 한계를 극복합니다. 공공적인 가치를 담은 소셜 챌린지는 개인의 동기를 부여하고, 주변과의 경쟁과 공유를 통해 지속적인 실천을 자연스럽게 유도합니다.

따라서, **BeEcho**는 소셜 기반 텀블러 인증을 통해 환경 보호 문화 확산을 독려합니다.
YOLOv8 AI 기술로 텀블러 사용을 쉽게 인증하고, 그 결과를 공유하며 환경을 보호하는 습관을 시작해보세요!

![Image](https://github.com/user-attachments/assets/3d3f74b4-0774-4e3d-a68d-eef18a1ba890)

---

## 주요 기능
![Image](https://github.com/user-attachments/assets/06e914a4-0680-4110-9442-2463c3ae08d2)
![Image](https://github.com/user-attachments/assets/86db6125-be34-4807-af41-7ad50d9b8147)
![Image](https://github.com/user-attachments/assets/184d99bf-057a-4c8e-bfe6-a9ffa9567f1f)
![Image](https://github.com/user-attachments/assets/4fbdf389-45da-4184-a07e-77d6e07b95f7)
![Image](https://github.com/user-attachments/assets/d9dd142c-2258-4de9-b3f6-c94743a31291)
![Image](https://github.com/user-attachments/assets/116705b5-dcfa-4cae-ad2c-0ca5657c3f33)

---

## AI Model & Performance

BeEcho.는 **YOLOv8 기반의 커스텀 객체 인식 모델**을 탑재하여, 실생활의 다양한 환경에서도 텀블러와 일회용 컵을 구분합니다.

### 1. Dataset
최종 모델의 class는 다음과 같습니다.

| Class                | Description                                 |
| :------------------- | :------------------------------------------ |
| **Tumbler**          | 다양한 재질, 형태, 배경의 텀블러 직접 촬영  |
| **Disposable Cup**   | 카페 테이크아웃 컵, 투명 플라스틱 컵        |

- **Negative Samples**: 텀블러로 오인되기 쉬운 원기둥 물체를 라벨링하지 않고 추가하였습니다.

### 2. Labeling

labelImg를 사용하여 직접 라벨링 작업을 하였습니다.

#### disposable_cup

<img src="https://github.com/user-attachments/assets/4fd69abe-9888-4d86-a5e7-3590fa399a6f" width="50%" />

#### tumbler

<img src="https://github.com/user-attachments/assets/c8db6991-d9d0-4335-949e-2c5aa79d255b" width="50%"/>

### 3. Performance Analysis
처음 학습한 모델은 다음과 같은 문제점이 있어 개선하였습니다.

![Image](https://github.com/user-attachments/assets/55a8d72b-54a6-4f06-a2d4-241429a66b75)

개선 결과 텀블러 정확도가 42%p, 재현율은 약 10%p가 증가하며 모델의 정확도가 매우 높아졌습니다.

| 지표              |  v01  |  v02  | 증감     |
| :---------------- | :---: | :---: | :------- |
| Precision         | 0.808 | 0.885 | ▲ 7.7%p  |
| Tumbler Precision | 0.538 | 0.958 | ▲ 42.0%p |
| Tumbler Recall    | 0.727 | 0.811 | ▲ 9.7%p |
| Tumbler mAP50     | 0.644 | 0.933 | ▲ 28.9%p |

#### v01 Performance

  <img src="https://github.com/user-attachments/assets/665b2128-c1d3-4eb0-b6fc-5b03792271d2" width="80%"/>
  
<br/>

#### v02 Performance

  <img src="https://github.com/user-attachments/assets/8f8288d1-7afc-425d-a4d7-cb3217b0caac" width="80%"/>

### 4. Result

**[Training Results]**
<img width="100%" alt="result" src="https://github.com/user-attachments/assets/0660015c-96cd-4779-a957-a8e0232709ae" />

---

## 기술 스택
![Image](https://github.com/user-attachments/assets/25458f8d-d504-42af-acf7-f5d42241cbc6)

| Category | Technology |
| :--- | :--- |
| **Frontend** | React (CRA) |
| **Backend** | FastAPI, Firebase |
| **AI** | YOLOv8, Google Colab |
| **Hosting** | Vercel, Hugging face |
| **ASGI Server** | Uvicorn |

---

## 레퍼런스

### 파이썬 라이브러리
| 이름 | 링크 |
|------|------|
| FastAPI | https://fastapi.tiangolo.com |
| Uvicorn | https://www.uvicorn.org |
| Ultralytics | https://docs.ultralytics.com |
| Pillow (PIL) | https://pillow.readthedocs.io |
| FastAPI-CORS | https://fastapi.tiangolo.com/tutorial/cors |
| Python-Multipart | https://github.com/andrew-d/python-multipart |
| scikit-learn | https://scikit-learn.org |
| PyYAML | https://pyyaml.org |
| PyTorch | https://pytorch.org |
| NumPy | https://numpy.org |
| OpenCV | https://opencv.org |
| Matplotlib | https://matplotlib.org |

### JavaScript 라이브러리
| 이름 | 링크 |
|------|------|
| React | https://react.dev |
| React DOM | https://react.dev/reference/react-dom |
| Create React App | https://create-react-app.dev |
| Firebase | https://firebase.google.com |
| html2canvas | https://html2canvas.hertzen.com |
| Web Vitals | https://web.dev/vitals/ |
| @testing-library/react | https://testing-library.com/react |
| @testing-library/jest-dom | https://github.com/testing-library/jest-dom |

### 도구 및 플랫폼
| 이름 | 링크 |
|------|------|
| labelImg | https://github.com/heartexlabs/labelImg |
| Google Colab | https://colab.research.google.com |
| Docker | https://www.docker.com |
| YOLO (Object Detection) | https://docs.ultralytics.com |

### 웹 API
| 이름 | 링크 |
|------|------|
| Fetch API | https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API |
| FileReader API | https://developer.mozilla.org/en-US/docs/Web/API/FileReader |
| Canvas API | https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API |
| Blob API | https://developer.mozilla.org/en-US/docs/Web/API/Blob |
| Web Share API | https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share |
| Clipboard API | https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API |
| URL API | https://developer.mozilla.org/en-US/docs/Web/API/URL |
| Web Storage API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API |
| Base64 API | https://developer.mozilla.org/en-US/docs/Glossary/Base64 |

---

## 라이선스

본 프로젝트는 Core AI 엔진으로 Ultralytics YOLOv8을 사용하고 있습니다. YOLOv8은 AGPL-3.0 라이선스를 따르고 있으며, 이는 소스코드를 공개해야 한다는 의무 조항을 포함합니다.

이에 따라 라이선스 전염성을 준수하기 위해, 본 프로젝트 또한 AGPL-3.0 라이선스를 채택하여 전체 소스코드를 투명하게 공개하였습니다.
