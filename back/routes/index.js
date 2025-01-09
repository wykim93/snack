const express = require("express");
const { snackModel, createSnack, userModel } = require("./snacks");
const axios = require("axios");
const router = express.Router();
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());

router.get("/snacks", async (req, res) => {
  try {
    const snacks = await snackModel.find(); // 모든 과자 정보 조회
    res.status(200).json(snacks); // JSON 형식으로 응답
  } catch (error) {
    console.error("Error retrieving snacks:", error);
    res
      .status(500)
      .json({ message: "Error retrieving snacks", error: error.message });
  }
});

router.post("/snacks", async (req, res) => {
  const { name, image, nutritionalIngredients } = req.body;
  console.log(req.body);
  try {
    const newSnack = new snackModel({
      name,
      image,
      nutritionalIngredients, // { calories, carbohydrates, protein, fat } 형태의 객체
    });

    await newSnack.save(); // 새로운 문서를 MongoDB에 저장
    res
      .status(201)
      .json({ message: "Snack added successfully", snack: newSnack });
  } catch (error) {
    console.error("Error adding snack:", error);
    res
      .status(500)
      .json({ message: "Error adding snack", error: error.message });
  }
});

// /snacks/required 요청 핸들러 예시
router.post("/snacks/required", async (req, res) => {
  const snackName = req.query.name;

  if (!snackName) {
    return res
      .status(400)
      .json({ message: "Snack name is required in query params" });
  }

  try {
    const snack = await snackModel.findOneAndUpdate(
      { name: snackName },
      { $inc: { required: 1 } },
      { new: true }
    );

    if (!snack) {
      return res.status(404).json({ message: "Snack not found" });
    }

    res.status(200).json({
      message: `'${snackName}' required count increased.`,
      snack: snack,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating snack", error: error.message || error });
  }
});

router.get("/snacks/ranking", async (req, res) => {
  try {
    // 좋아요 순으로 정렬하여 데이터 반환
    const snacks = await snackModel.find().sort({ required: -1 }).limit(5); // 좋아요 순으로 내림차순 정렬
    res.status(200).json(snacks); // JSON 형식으로 응답
  } catch (error) {
    console.error("Error retrieving snack rankings:", error);
    res.status(500).json({
      message: "Error retrieving snack rankings",
      error: error.message,
    });
  }
});

// /users/login 요청 핸들러 예시
router.get("/users/login", async (req, res) => {
  const { userName, userPass } = req.query;
  console.log("Received:", userName, userPass);

  try {
    // DB에서 사용자를 조회하여 확인
    const user = await userModel.findOne({
      name: userName,
      password: userPass,
    });

    if (user) {
      // 로그인 성공 시 쿠키에 `user=true` 설정
      res.cookie("user", "true", {
        httpOnly: false,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "Lax",
      });
      res.status(200).json({ message: "Login successful", num: user.num });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

/*
router.get("/users/login", async (req, res) => {
  const { userName, userPass } = req.query;
  console.log("Received:", userName, userPass);

  try {
    const user = await userModel.findOne({
      name: userName,
      password: userPass,
    });

    if (user) {
      // 로그인 성공 시 쿠키에 `user=true` 설정
      res.cookie("user", "true", {
        httpOnly: false,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "Lax",
      }); // 1일 동안 유지
      res.status(200).json({ num: user.num });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/

// test
router.get("/users", async (req, res) => {
  try {
    const users = await userModel.find(); // 모든 사용자 정보 조회
    res.status(200).json(users); // JSON 형식으로 응답
  } catch (error) {
    console.error("Error retrieving users:", error);
    res
      .status(500)
      .json({ message: "Error retrieving users", error: error.message });
  }
});

module.exports = router;
