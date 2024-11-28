/**
 * @swagger
 * components:
 *   schemas:
 *     Education:
 *       type: object
 *       required:
 *         - edu_name
 *         - study_year
 *         - degree
 *         - specialty
 *       properties:
 *         edu_name:
 *           type: string
 *           description: Name of the educational institution
 *         study_year:
 *           type: string
 *           description: Years of study (e.g., "2010-2014")
 *         degree:
 *           type: string
 *           description: Degree obtained
 *         specialty:
 *           type: string
 *           description: Field of study or specialization
 * 
 *     User:
 *       type: object
 *       required:
 *         - fullname
 *         - email
 *         - birth_date
 *         - department
 *         - position
 *         - phone
 *         - edu
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the user
 *         fullname:
 *           type: string
 *           description: Full name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         birth_date:
 *           type: string
 *           format: date
 *           description: User's birth date (YYYY-MM-DD)
 *         picture:
 *           type: string
 *           description: URL or path to the user's profile picture
 *         department:
 *           type: string
 *           description: User's department
 *         position:
 *           type: string
 *           description: User's position
 *         phone:
 *           type: string
 *           description: User's phone number
 *         edu:
 *           type: array
 *           description: List of user's education records
 *           items:
 *             $ref: '#/components/schemas/Education'
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was last updated
 * 
 *     UserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the operation was successful
 *         data:
 *           oneOf:
 *             - $ref: '#/components/schemas/User'
 *             - type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *         total:
 *           type: integer
 *           description: Total number of records (for paginated responses)
 *         page:
 *           type: integer
 *           description: Current page number (for paginated responses)
 *         limit:
 *           type: integer
 *           description: Number of items per page (for paginated responses)
 * 
 *     ErrorResponse:
 *       type: object
 *       required:
 *         - success
 *         - error
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *           description: Always false for error responses
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Error message describing what went wrong
 *             code:
 *               type: string
 *               description: Error code for identifying the type of error
 *             details:
 *               type: object
 *               description: Additional error details if available
 */

