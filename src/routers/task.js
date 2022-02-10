const express = require('express')
const router = new express.Router()
const authMiddleware = require('../middleware/auth')
const TaskController = require('../controllers/task')

router.post('/', authMiddleware, TaskController.createTask)

router.get('/', authMiddleware, TaskController.getTasks)

router.get('/:id', authMiddleware, TaskController.getTask)

router.patch('/:id', authMiddleware, TaskController.updateTask)

router.delete('/:id', authMiddleware, TaskController.deleteTask)

module.exports = router
