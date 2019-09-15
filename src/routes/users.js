const express = require("express");
const router = express.Router();
const user = require("../database/users");
const authMail = require("../utills/auth-email");

// 이메일 회원가입 - 인증
/**
 * @api {post} /users/auth Auth User
 * @apiName AuthUser
 * @apiGroup User
 * @apiDescription 하루 500통 limit 있음
 *
 * 잘못된 메일주소일 때 에러 응답 없음
 *
 * 메일이 안올 경우 주소 다시 확인하라는 알림 있어야 할 듯
 *
 *
 * @apiParam {Json} body body.
 * @apiParamExample {json} User Action:
 * {
 *     "email": "user1@gmail.com",
 * }
 *
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 200 OK
 * {
 *   "email": "user1@gmail.com",
 *   "auth_code": 123456,
 * }
 */
router.post("/auth", authMail, function(req, res, next) {
  const userEmail = req.body["email"];
  const authCode = req.code;

  res.status(200).json({ email: userEmail, code: authCode });
});

// 회원가입 - 유저 등록
/**
 * @api {post} /users Create User
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiParam {Json} body body.
 * @apiParamExample {json} User Action:
 * {
 *     "user_id": "user1",
 *     "password": "qwerty",
 *     "nickname": "hello",
 *     "email": "user1@gmail.com",
 *     "image": "image1",
 *     "background": "image2",
 *     "payload": {}
 * }
 *
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 200 OK
 * {
 *     "user_key": 1,
 *     "user_id": "user1",
 *     "password": "qwerty",
 *     "nickname": "hello",
 *     "email": "user1@gmail.com",
 *     "image": "image1",
 *     "background": "image2",
 *     "reg_date": "2018-11-24 14:52:30"
 * }
 */
router.post("/", function(req, res, next) {
  const userId = req.body["user_id"];
  const userPassword = req.body["password"];
  const userNickname = req.body["nickname"];
  const userEmail = req.body["email"];
  const userProfile = req.body["image"];
  const userBackground = req.body["background"];

  user
    .createUser(
      userId,
      userPassword,
      userNickname,
      userEmail,
      userProfile,
      userBackground
    )
    .then(user => {
      res.status(200).json(user);
    })
    .catch(err => {
      next(err);
    });
});

// 유저 정보 가져오기
/**
 * @api {get} /users/userinfo/:userKey Get User
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam (path) {Number} userKey userKey.
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 200 OK
 * {
 *     "user_key": 1,
 *     "user_id": "user1",
 *     "password": "qwerty",
 *     "nickname": "hello",
 *     "image": "image1",
 *     "background": "image2"
 *     "reg_date": "2018-11-24 14:52:30"
 * }
 */
router.get("/userinfo/:userKey", function(req, res, next) {
  const userKey = req.params["userKey"];

  user
    .getUser(userKey)
    .then(user => {
      res.status(200).json(user);
    })
    .catch(err => {
      next(err);
    });
});

// 유저 정보 가져오기
/**
 * @api {get} /users/userid/:userId Get UserKey
 * @apiName GetUserKey
 * @apiGroup User
 *
 * @apiParam (path) {Number} userId userId.
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 200 OK
 * {
 *     "user_key": 1,
 *     "user_id": "user1",
 *     "password": "qwerty",
 *     "nickname": "hello",
 *     "image": "image1",
 *     "background": "image2"
 *     "reg_date": "2018-11-24 14:52:30"
 * }
 */
router.get("/userid/:userId", function(req, res, next) {
  const userId = req.params["userId"];

  user
    .getUserId(userId)
    .then(user => {
      res.status(200).json(user);
    })
    .catch(err => {
      next(err);
    });
});

// 유저 정보 수정(닉네임, 프로필사진, 배경사진만 가능)
/**
 * @api {put} /users/:userKey Modify User
 * @apiName ModifyUser
 * @apiGroup User
 *
 * @apiParam (path) {Number} userKey userKey.
 * @apiParam {Json} body body.
 * @apiParamExample {json} User Action:
 * {
 *     "nickname": "hi",
 *     "image": "picture1"
 *     "background": "picture2"
 *     "payload": {}
 * }
 *
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 200 OK
 * {
 *     "user_key": 1,
 *     "user_id": "user1",
 *     "password": "qwerty",
 *     "nickname": "hi",
 *     "image": "picture1"
 *     "background": "picture2",
 *     "reg_date": "2018-11-24 14:52:30"
 * }
 */
router.put("/:userKey", function(req, res, next) {
  const userKey = req.params["userKey"];

  user
    .modifyUser(
      userKey,
      req.body["nickname"],
      req.body["image"],
      req.body["background"]
    )
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      next(err);
    });
});

// 회원탈퇴 - 유저 삭제
/**
 * @api {delete} /users/:userKey Delete User
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiParam (path) {Number} userKey userKey.
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 204 No Content
 */
router.delete("/:userKey", function(req, res, next) {
  const userKey = req.params["userKey"];

  user
    .deleteUser(userKey)
    .then(result => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
