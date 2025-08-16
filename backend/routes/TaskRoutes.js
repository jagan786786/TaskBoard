const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controllers');
const auth = require('../middlewares/auth.middlewares');

router.get('/', auth, taskController.listTasks);

router.get('/:id', auth, taskController.getTask);

router.post('/', auth, taskController.createTask);

router.put('/:id', auth, taskController.updateTask);

router.patch('/:id/move', auth, taskController.moveTask);

router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
