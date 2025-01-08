// snacks.js 파일 수정
const mongoose = require("mongoose");

// 환경 변수에서 MongoDB 접속 정보 가져오기
const GUESTBOOK_DB_ADDR = process.env.GUESTBOOK_DB_ADDR;
const USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME;
const PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD;

// MongoDB 고정된 접속 정보
const REQUIRED_USERNAME = "admin";
const REQUIRED_PASSWORD = "k8spass";

// 검증 로직 추가
if (!GUESTBOOK_DB_ADDR) {
  console.error("환경 변수 GUESTBOOK_DB_ADDR가 설정되지 않았습니다.");
  process.exit(1);
}

if (USERNAME !== REQUIRED_USERNAME || PASSWORD !== REQUIRED_PASSWORD) {
  console.error("MongoDB 접속 정보가 올바르지 않습니다.");
  console.error(`받은 아이디: ${USERNAME || "없음"}`);
  console.error(`받은 비밀번호: ${PASSWORD || "없음"}`);
  process.exit(1); // 아이디/비밀번호가 틀리면 종료
}

// MongoDB URI 구성
const mongoURI = `mongodb://${USERNAME}:${PASSWORD}@${GUESTBOOK_DB_ADDR}/snacks?authSource=admin`;

// MongoDB 연결 이벤트 핸들러
const db = mongoose.connection;

db.on("disconnected", () => {
  console.error(`Disconnected: unable to reconnect to ${mongoURI}`);
  throw new Error(`Disconnected: unable to reconnect to ${mongoURI}`);
});

db.on("error", (err) => {
  console.error(`Unable to connect to ${mongoURI}: ${err}`);
});

db.once("open", () => {
  console.log(`Connected to MongoDB at ${mongoURI}`);
});

// MongoDB 연결 함수
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB 연결 성공");
  } catch (err) {
    console.error("MongoDB 연결 실패:", err);
    process.exit(1);
  }
};

// snacks 컬렉션용 스키마 정의
const snackSchema = mongoose.Schema({
  name: { type: String, required: [true, "Name is required"] },
  image: { type: String, required: [true, "Image URL is required"] },
  nutritionalIngredients: {
    type: Map,
    of: String,
    require: true,
  },
  required: { type: Number, default: 0 },
});

const snackModel = mongoose.model("Snack", snackSchema); // snacks 컬렉션 모델

// users 컬렉션용 스키마 정의
const userSchema = mongoose.Schema({
  num: { type: Number, required: [true, "UserNum is required"] },
  name: { type: String, required: [true, "Username is required"] },
  password: { type: String, required: [true, "Password is required"] },
});

const userModel = mongoose.model("User", userSchema); // users 컬렉션 모델

// snacks 데이터를 생성 및 저장하는 함수
const createSnack = async (params) => {
  try {
    const snack = new snackModel({
      name: params.name,
      image: params.image,
      nutritionalIngredients: params.nutritionalIngredients,
    });
    const validationError = snack.validateSync();
    if (validationError) {
      throw validationError;
    }
    await snack.save();
    return snack;
  } catch (error) {
    throw error;
  }
};

// users 데이터를 생성 및 저장하는 함수
const createUser = async (params) => {
  try {
    const user = new userModel({
      num: params.num,
      name: params.name,
      password: params.password,
    });
    const validationError = user.validateSync();
    if (validationError) {
      throw validationError;
    }
    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  connectToMongoDB,
  snackModel,
  createSnack,
  userModel,
  createUser,
};
