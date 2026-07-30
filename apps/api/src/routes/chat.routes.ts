import { Router } from 'express';
import { getChats, getMessages, createChat } from '../controllers/chat.controller';

const router = Router();

router.get('/', getChats);
router.post('/', createChat);
router.get('/:id/messages', getMessages);

export default router;
