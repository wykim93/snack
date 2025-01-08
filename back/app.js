require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser"); // 쿠키 파서 추가
const cors = require("cors"); // CORS 모듈 추가
const routes = require("./routes");
const snacks = require("./routes/snacks");
const bodyParser = require("body-parser");
const client = require("prom-client"); // Prometheus 클라이언트 추가
const app = express();
const PORT = process.env.PORT;
const path = require("path");

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: "snack-frontend2.front.svc.cluster.local:3001", // 프론트엔드 도메인 주소로 수정
    credentials: true, // 쿠키를 포함한 요청 허용
  })
);

app.use(express.json());
//app.use(cookieParser()); // 쿠키 파서 미들웨어 추가
app.use("/", routes);

// 환경 변수 체크
if (!process.env.PORT) {
  const errMsg = "PORT environment variable is not defined";
  console.error(errMsg);
  throw new Error(errMsg);
}

if (!process.env.GUESTBOOK_DB_ADDR) {
  const errMsg = "GUESTBOOK_DB_ADDR environment variable is not defined";
  console.error(errMsg);
  throw new Error(errMsg);
}

// MongoDB 연결
snacks.connectToMongoDB();

// Prometheus 기본 메트릭 등록
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 }); // 기본 메트릭을 5초마다 수집

// 사용자 정의 메트릭 생성
const requestCount = new client.Counter({
  name: "http_requests_total", // 메트릭 이름
  help: "Total number of HTTP requests", // 메트릭 설명
  labelNames: ["method", "route"], // 레이블 이름
});

// 요청 전후로 사용자 정의 메트릭 업데이트
app.use((req, res, next) => {
  requestCount.inc({ method: req.method, route: req.path }); // 요청 수 증가
  next();
});

// Prometheus 메트릭 엔드포인트 추가
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log(
    `Prometheus metrics available at http://localhost:${PORT}/metrics`
  );
  console.log("Press Ctrl+C to quit.");
});

module.exports = app;
