import { Router } from "express";
import controller from '../controllers/message.js'

const router = Router();

router.get("/messages", controller.GET);

export default router;
