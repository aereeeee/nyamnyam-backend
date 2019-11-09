const express = require("express");
const router = express.Router();
const image = require("../database/images");
const { upload, deleteS3 } = require("../utills/multer-s3");

/**
 * @api {post} /images Upload Image
 * @apiName UploadImage
 * @apiGroup Images
 * @apiDescription ModifyList 사용 전, 이미지 새로 추가할때 사용, order 0번이 대표이미지
 *
 * @apiParam {FormData} body form data로 post 시 file input의 name=file 이여야 함.
 * @apiParamExample {FormData} User Action:
 * {
 *     "listId": 1,
 *     "file": "aaaaa",
 *     "order":0
 * }
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "imageId": 4,
 *     "listId": 1,
 *     "url": "https://nyamnyam.s3.ap-northeast-2.amazonaws.",
 *     "order":0
 * }
 */
router.post("/", upload.single("file"), (req, res, next) => {
  const listId = req.body["listId"];
  const order = req.body["order"];
  const url = req.file.location;

  image
    .createImage(listId, url, order)
    .then(image => {
      res.status(200).json(image);
    })
    .catch(err => {
      next(err);
    });
});

/**
 * @api {get} /images/list/:listId Get List Images
 * @apiName GetListImages
 * @apiGroup Images
 *
 * @apiParam (path) {Number} listId listId.
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 200 OK
 * {
 *     "imageId": 2,
 *     "listId": 1,
 *     "url": "https://nyamnyam.s3.ap-northeast-2.amazonaws.",
 *     "order":0
 * },
 * {
 *     "imageId": 3,
 *     "listId": 1,
 *     "url": "https://nyamnyam.s3.ap-northeast-2.amazonaws.",
 *     "order":0
 * }
 */
router.get("/list/:listId", function(req, res, next) {
  const listId = req.params["listId"];

  image
    .getListImage(listId)
    .then(image => {
      res.status(200).json(image);
    })
    .catch(err => {
      next(err);
    });
});

/**
 * @api {get} /images/:imageId Get Image
 * @apiName GetImage
 * @apiGroup Images
 *
 * @apiParam (path) {Number} imageId imageId.
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 200 OK
 * {
 *     "imageId": 3,
 *     "listId": 1,
 *     "url": "https://nyamnyam.s3.ap-northeast-2.amazonaws."
 *     "order":0
 * }
 */
router.get("/:imageId", function(req, res, next) {
  const ImageId = req.params["imageId"];

  image
    .getImage(ImageId)
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      next(err);
    });
});

/**
 * @api {put} /images Modify Image
 * @apiName ModifyImages
 * @apiGroup Images
 * @apiDescription ModifyList 사용 전, 이미지를 변경할 때 사용
 *
 * @apiParam (path) {Number} imageId imageId.
 * @apiParam {FormData} body form data로 post 시 file input의 name=file 이여야 함.
 * @apiParamExample {FormData} User Action:
 * {
 *     "imageId": 1,
 *     "file": "aaaaa",
 *
 * }
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 200 OK
 * {
 *     "imageId": 1,
 *     "listId": 1,
 *     "url": "https://nyamnyam.s3.ap-northeast-2.amazonaws.",
 *     "order":0
 * }
 */
router.put("/", upload.single("file"), async function(req, res, next) {
  const ImageId = req.body["imageId"];
  const url = req.file.location;

  await image.getImage(ImageId).then(result => {
    deleteS3(result.url);
  });

  image
    .modifyImage(ImageId, url)
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      next(err);
    });
});

/**
 * @api {delete} /images/:imageId Delete Image
 * @apiName DeleteImage
 * @apiGroup Images
 *
 * @apiParam (path) {Number} imageId imageId.
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 204 No Content
 */
router.delete("/:imageId", async function(req, res, next) {
  const ImageId = req.params["imageId"];

  await image.getImage(ImageId).then(result => {
    deleteS3(result.url);
  });

  image
    .deleteImage(ImageId)
    .then(result => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
