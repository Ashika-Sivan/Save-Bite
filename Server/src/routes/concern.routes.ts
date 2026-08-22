import { Router, Request, Response, NextFunction } from "express";
import { concernController, authMiddleware } from "../config/dependencies";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

const handleAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// Customer raises concern for an order
router.post(
  "/orders/:orderId/concern",
  authMiddleware.authenticate,
  authMiddleware.authorize("user"),
  upload.single("photo"),
  handleAsync((req, res) => concernController.raiseConcern(req, res))
);

// Admin list all concerns
router.get(
  "/admin/concerns",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  handleAsync((req, res) => concernController.getAllConcerns(req, res))
);

// Admin get concern details by ID
router.get(
  "/admin/concerns/:concernId",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  handleAsync((req, res) => concernController.getConcernById(req, res))
);

// Admin approve concern
router.post(
  "/admin/concerns/:concernId/approve",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  handleAsync((req, res) => concernController.approveConcern(req, res))
);

// Admin reject concern
router.post(
  "/admin/concerns/:concernId/reject",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  handleAsync((req, res) => concernController.rejectConcern(req, res))
);

export default router;
