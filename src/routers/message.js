import { Router } from "express";
import controller from "../controllers/message.js";

const router = Router();

router.get("/messages", controller.GET);
router.post("/messages", controller.POST);
router.get("/messages/:fileName", controller.DOWNLOAD);

export default router;
