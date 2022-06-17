import { Router } from "express";
import validation from "../middlewares/validation.js";
import controller from "../controllers/user.js";

const router = Router();

router.get("/users", controller.GET);
router.post("/login", validation, controller.LOGIN);
router.post("/register", validation, controller.REGISTER);

export default router;
