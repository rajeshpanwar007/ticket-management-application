import { Router } from 'express';
import ticketRoutes from './ticket.routes.js';
import commentRoutes from './comment.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/tickets', ticketRoutes);
router.use('/tickets/:id/comments', commentRoutes);
router.use('/users', userRoutes);

export default router;
