import { Router } from "express";
import controller from "../controllers/message.js";
import checkToken from "../middlewares/checkToken.js";

const router = Router();

router.get("/messages", checkToken, controller.GET);
// router.post("/messages", checkToken, controller.POST);
router.get("/download/:fileName", controller.DOWNLOAD);

export default router;
