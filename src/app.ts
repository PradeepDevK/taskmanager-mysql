import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import taskRoutes from "./routes/task.route";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/tasks", taskRoutes);

export default app;