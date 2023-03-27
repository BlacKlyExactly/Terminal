import express from "express";
import cors from "cors";
import api from "./routes/api";
import auth from "./routes/auth";

const app = express();
const port = process.env.PORT || 1111;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      `http://localhost:${process.env.PORT}`,
      "https://terminal-simulation.up.railway.app",
    ],
  })
);

app.use(express.json());

app.listen(port, () => {
  console.log(`Backend > listening on port: ${port}`);
});

app.use("/", express.static("dist"));
app.use("/api", api);
app.use("/auth", auth);
