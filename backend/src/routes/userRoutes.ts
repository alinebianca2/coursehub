import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  getUserController,
  listUsersController,
  updateUserController,
} from "../controllers/userController";
import { authorize } from "../middlewares/authorize";
import { authorizeSelfOrRoles } from "../middlewares/authorizeSelfOrRoles";

export const userRoutes = Router();

userRoutes.post("/", authorize("ADMIN"), createUserController);
userRoutes.get("/", authorize("ADMIN", "OPERATOR"), listUsersController);
userRoutes.get("/:id", authorizeSelfOrRoles("ADMIN", "OPERATOR"), getUserController);
userRoutes.put("/:id", authorize("ADMIN", "OPERATOR"), updateUserController);
userRoutes.delete("/:id", authorize("ADMIN"), deleteUserController);
