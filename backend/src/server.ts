import "dotenv/config";
import { createApp } from "./app";

const port = process.env.PORT ?? 3333;

const app = createApp();

app.listen(port, () => {
  console.log(`CourseHub API rodando em http://localhost:${port}`);
});
