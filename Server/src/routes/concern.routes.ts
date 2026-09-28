import { Router, Request, Response, NextFunction } from "express";
import { concernController, authMiddleware } from "../config/dependencies";
import { upload } from "../middlewares/upload.middleware";

const router = Router();



router.post(
  "/orders/:orderId/concern",
  authMiddleware.authenticate,
  authMiddleware.authorize("user"),
  upload.single("photo"),
  concernController.raiseConcern
);


router.get(
  "/admin/concerns",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  concernController.getAllConcerns
);


router.get(
  "/admin/concerns/:concernId",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  concernController.getConcernById
);


router.post(
  "/admin/concerns/:concernId/approve",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  concernController.approveConcern
);


router.post(
  "/admin/concerns/:concernId/reject",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  concernController.rejectConcern
);

export default router;
