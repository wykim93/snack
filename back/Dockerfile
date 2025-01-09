# back_snack Dockerfile
FROM alpine:3.19

# 환경 설정
ENV PORT=3000
ENV GUESTBOOK_DB_ADDR=db_snack:27017

# 필수 패키지 설치
RUN apk update && \
    apk add --no-cache nodejs npm git

# 작업 디렉터리 설정
WORKDIR /app

# 로컬 소스 복사
COPY . /app

# NPM 설치
RUN npm install

# 앱 실행
CMD ["npm", "start"]
