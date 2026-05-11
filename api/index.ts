import { Router } from "express";
import authRouter from "./routes/auth.js";
import profilesRouter from "./routes/profiles.js";
import tasksRouter from "./routes/tasks.js";
import branchesRouter from "./routes/branches.js";
import retroRouter from "./routes/retro.js";
import adminRouter from "./routes/admin.js";

const api = Router();

api.use("/auth", authRouter);
api.use("/profiles", profilesRouter);
api.use("/tasks", tasksRouter);
api.use("/branches", branchesRouter);
api.use("/retro", retroRouter);
api.use("/admin", adminRouter);

export default api;
