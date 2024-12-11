/**
 * @swagger
 * tags:
 *   - name: Tasks
 *     description: Task management endpoints
 */

/**
 * @swagger
 * /task:
 *   post:
 *     summary: Create new task (Admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - status
 *               - user_id
 *               - file
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *                 example: "Yangi vazifa"
 *               status:
 *                 type: string
 *                 enum: [yuborildi,jarayonda,bajarildi,bekor qilindi]
 *                 description: Task status
 *                 example: "yuborildi"
 *               user_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of user IDs 1ta input 1ta ID!
 *                 example: 2
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Task file attachment
 *           encoding:
 *             user_id:
 *               style: form
 *               explode: true
 *             file:
 *               contentType: multipart/form-data
 *     responses:
 *       '200':
 *         description: Task created successfully
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Topshiriqqa hech bo'lmaganda bitta hodim tanlang."
 *       '401':
 *         description: Unauthorized - No token provided
 *       '403':
 *         description: Forbidden - Invalid token or not admin
 *       '500':
 *         description: Server error
 *
 *   get:
 *     summary: Get all tasks with pagination and filters
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [barchasi, jarayonda, bajarildi, bekor qilindi]
 *         description: Filter by status
 *     responses:
 *       '200':
 *         description: List of tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       '403':
 *         description: Unauthorized access
 *       '500':
 *         description: Server error
 */

/**
 * @swagger
 * /task/status:
 *   post:
 *     summary: Accept or reject task (Employee only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task_id
 *               - status
 *             properties:
 *               task_id:
 *                 type: integer
 *                 description: Task ID
 *               status:
 *                 type: string
 *                 enum: [accept, reject]
 *                 description: Decision status
 *     responses:
 *       '200':
 *         description: Task status updated successfully
 *       '400':
 *         description: Invalid request
 *       '500':
 *         description: Server error
 */

/**
 * @swagger
 * /task/complete:
 *   post:
 *     summary: Complete task with file upload (Employee only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - task_id
 *               - comment
 *               - file
 *             properties:
 *               task_id:
 *                 type: integer
 *                 description: Task ID
 *               comment:
 *                 type: string
 *                 description: Completion comment
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Completed task file
 *     responses:
 *       '200':
 *         description: Task completed successfully
 *       '400':
 *         description: Invalid request
 *       '500':
 *         description: Server error
 */

/**
 * @swagger
 * /task/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       '200':
 *         description: Task found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Server error
 *
 *   put:
 *     summary: Update task (Admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *               status:
 *                 type: string
 *                 description: Task status
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Task file
 *     responses:
 *       '200':
 *         description: Task updated successfully
 *       '403':
 *         description: Unauthorized - Admin access required
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Server error
 *
 *   delete:
 *     summary: Delete task (Admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       '200':
 *         description: Task deleted successfully
 *       '403':
 *         description: Unauthorized - Admin access required
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         task_id:
 *           type: integer
 *         title:
 *           type: string
 *         status:
 *           type: string
 *         file:
 *           type: string
 *         comment:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *
 *     TaskResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Task'
 */
