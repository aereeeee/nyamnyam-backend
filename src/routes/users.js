var express = require('express');
var router = express.Router();
var user = require('../database/users')

// 회원가입 - 유저 등록
/**
 * @api {post} /users Create User
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiParam {Json} body body.
 * @apiParamExample {json} User Action:
 * {
 *     "id": "user1",
 *     "password": "qwerty",
 *     "nickname": "hello",
 *     "image": "image1",
 *     "background": "image2"
 *     "payload": {}
 * }
 *
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 200 OK
 * {
 *     "user_id": 1,
 *     "id": "user1",
 *     "pw": "qwerty",
 *     "reg_date": "2018-11-24 14:52:30"
 * }
 */
router.post('/', function(req, res, next) {
  const userId = req.body["id"];
  const userPassword = req.body["password"];
  const userNickname = req.body["nickname"];
  const userProfile = req.body["image"];
  const userBackground = req.body["background"]

  user.createUser(userId, userPassword, userNickname, userProfile, userBackground)
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      next(err);
    })
});

// 유저 정보 가져오기
/**
 * @api {get} /users/:userId Get User
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam (path) {Number} userId userId.
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 200 OK
 * {
 *     "user_id": 1,
 *     "id": "user1",
 *     "password": "qwerty",
 *     "nickname": "hello",
 *     "image": "image1",
 *     "background": "image2"
 *     "reg_date": "2018-11-24 14:52:30"
 * }
 */
router.get('/:userId', function (req, res, next) {
  const userId = req.params["userId"];

  user.getUser(userId)
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      next(err);
    })
});


// 유저 정보 수정(닉네임, 프로필사진, 배경사진만 가능)
/**
 * @api {put} /users/:userId Modify User
 * @apiName ModifyUser
 * @apiGroup User
 *
 * @apiParam (path) {Number} userId userId.
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
 *     "user_id": 1,
 *     "id": "user1",
 *     "password": "qwerty",
 *     "nickname": "hi",
 *     "image": "picture1"
 *     "background": "picture2",
 *     "reg_date": "2018-11-24 14:52:30"
 * }
 */
router.put('/:userId', function (req, res, next) {
  const userId = req.params["userId"];

  user.modifyUser(userId, req.body["nickname"], req.body["image"], req.body["background"])
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      next(err);
    });
});

// 회원탈퇴 - 유저 삭제
/**
 * @api {delete} /users/:userId Delete User
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiParam (path) {Number} userId userId.
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 204 No Content
 */
router.delete('/:userId', function (req, res, next) {
  const userId = req.params["userId"];

  user.deleteUser(userId)
    .then((result) => {
      res.status(204).end();
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;