const express = require("express");
const router = express.Router();
const user = require("../database/users");
const authMail = require("../utills/auth-email");
const { upload, deleteS3 } = require("../utills/multer-s3");
const passwordHash = require("../utills/passwordHash");

/**
 * @api {post} /users/auth Auth User
 * @apiName AuthUser
 * @apiGroup User
 * @apiDescription 하루 500통 limit, 잘못된 메일주소일 때 에러 응답 없음, 메일이 안올 경우 주소 다시 확인하라는 알림 있어야 할 듯
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

/**
 * @api {post} /users/login Login User
 * @apiName LoginUser
 * @apiGroup User
 *
 * @apiParam {Json} body body.
 * @apiParamExample {json} User Action:
 * {
 *     "user_id": "user1@gmail.com",
 *     "password": "qwerty"
 * }
 *
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 200 OK
 * true / false
 */
router.post("/login", authMail, function(req, res, next) {
  const userId = req.body.user_id;
  const password = req.body.password;
  user
    .getUserId(userId)
    .then(user => {
      const status = user.password === password ? true : false;
      res.status(200).send(status);
    })
    .catch(err => {
      next(err);
    });
});

/**
 * @api {post} /users Create User
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiParam {FormData} body form data로 post 시 file input의 name=file 이여야 함.
 * @apiParamExample {json} User Action:
 * {
 *     "user_id": "user1",
 *     "password": "qwerty",
 *     "nickname": "hello",
 *     "email": "user1@gmail.com",
 *     "file": "image1",
 *     "background": "#fffff"
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
 *     "image": "https://nyamnyam.s3.ap-northeast-2.amazonaws.com/images/1.png",
 *     "background": "#fffff",
 *     "reg_date": "2018-11-24 14:52:30"
 * }
 */
router.post("/", upload.single("file"), function(req, res, next) {
  const url = req.file ? req.file.location : undefined;

  const userId = req.body["user_id"];
  const userPassword = req.body["password"];
  const userNickname = req.body["nickname"];
  const userEmail = req.body["email"];
  const userProfile = url;
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
 *     "image": "https://nyamnyam.s3.ap-northeast-2.amazonaws.com/images/1.png",
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
 *     "image": "https://nyamnyam.s3.ap-northeast-2.amazonaws.com/images/1.png",
 *     "background": "#fffff",
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

/**
 * @api {post} /users/:userKey Modify User
 * @apiName ModifyUser
 * @apiGroup User
 *
 * @apiParam (path) {Number} userKey userKey.
 * @apiParam {FormData} body form data로 post 시 file input의 name=file 이여야 함.
 * @apiParamExample {json} User Action:
 * {
 *     "nickname": "hi",
 *     "file": "https://nyamnyam.s3.ap-northeast-2.amazonaws.com/images/3.png"
 *     "background": "#fffff"
 * }
 *
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 200 OK
 * {
 *     "user_key": 1,
 *     "user_id": "user1",
 *     "password": "qwerty",
 *     "nickname": "hi",
 *     "image": "https://nyamnyam.s3.ap-northeast-2.amazonaws.com/images/3.png"
 *     "background": "#fffff",
 *     "reg_date": "2018-11-24 14:52:30"
 * }
 */
router.put("/:userKey", upload.single("file"), function(req, res, next) {
  const url = req.file ? req.file.location : undefined;
  const userKey = req.params["userKey"];
  user
    .modifyUser(userKey, req.body["nickname"], url, req.body["background"])
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      next(err);
    });
});

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
    .getUser(userKey)
    .then(result => {
      deleteS3(result["image"]);
    })
    .catch(err => {
      next(err);
    });

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
