# front_snack Dockerfile
FROM alpine:3.19

# 환경 설정
ENV PORT=3001
ENV GUESTBOOK_API_ADDR=back_snack:3000

# 필수 패키지 설치
RUN apk update && \
    apk add --no-cache nodejs npm

# 작업 디렉터리 설정
WORKDIR /app

# 로컬 소스 복사
COPY . /app

# NPM 설치
RUN npm install

# 앱 실행
CMD ["npm", "start"]

