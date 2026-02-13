import { Router, Request, Response, NextFunction } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Middleware para resolver '/me' para o ID do usuário autenticado
const resolveMe = (req: Request, _res: Response, next: NextFunction) => {
  // @ts-expect-error - userId is set by auth middleware
  req.params.id = req.userId;
  next();
};

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por username, name ou email
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', authMiddleware, userController.listUsers.bind(userController));

// Rotas /me - devem vir antes de /:id para evitar conflito
router.get('/me', authMiddleware, resolveMe, userController.getUserById.bind(userController));
router.put('/me', authMiddleware, resolveMe, userController.updateUser.bind(userController));
router.put('/me/password', authMiddleware, userController.changePassword.bind(userController));
router.delete('/me', authMiddleware, resolveMe, userController.deleteUser.bind(userController));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Buscar usuário por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', authMiddleware, userController.getUserById.bind(userController));

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualizar dados do usuário
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *               name:
 *                 type: string
 *                 minLength: 2
 *               avatar:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Sem permissão para atualizar este usuário
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', authMiddleware, userController.updateUser.bind(userController));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Deletar usuário
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Sem permissão para deletar este usuário
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', authMiddleware, userController.deleteUser.bind(userController));

export default router;
