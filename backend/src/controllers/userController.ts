import { NextFunction, Request, Response } from "express";
import * as userService from "../services/userService";
import { createUserSchema, updateUserSchema, userIdParamSchema } from "../validators/userSchemas";

export async function createUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createUserSchema.parse(req.body);
    const user = await userService.createUser(input);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function listUsersController(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.listUsers();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

export async function getUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    const input = updateUserSchema.parse(req.body);
    const user = await userService.updateUser(id, input);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export async function deleteUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
