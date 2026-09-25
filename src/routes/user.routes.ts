import { Router } from 'express';
import { userController } from '../controllers/user.controller';

/**
 * Maps HTTP method + path to a controller function — Express has no
 * annotation-based routing (no @GetMapping/@PostMapping), so this mapping
 * is explicit. Paths here are relative; app.ts mounts this router at the
 * shared /api/v1/users prefix.
 */
const router = Router();

router.post('/', userController.createUser);
router.get('/:id', userController.getUser);
router.get('/', userController.listUsers);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
