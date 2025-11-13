FROM python:3.10-slim

WORKDIR /code

RUN apt-get update && apt-get install -y libgl1 libglib2.0-0

COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY . /code/

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]