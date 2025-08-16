const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controllers');
const auth = require('../middlewares/auth.middlewares');

// Publicish: list tasks (you may require auth in prod)
router.get('/', auth, taskController.listTasks);

// Get task details with comments
router.get('/:id', auth, taskController.getTask);

// Create
router.post('/', auth, taskController.createTask);

// Update (generic)
router.put('/:id', auth, taskController.updateTask);

// Move status (or you can use update)
router.patch('/:id/move', auth, taskController.moveTask);

// Delete
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
