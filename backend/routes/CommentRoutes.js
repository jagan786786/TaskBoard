const express = require("express");
const auth = require("../middlewares/auth.middlewares");
const router = express.Router();
const commentController = require('../controllers/comment.controllers')

router.post('/:taskId',auth,commentController.addComment);
router.get('/:taskId',auth,commentController.listComments);

module.exports = router;