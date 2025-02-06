const express = require("express");

const app = express();
const PORT = process.env.CLIENT_PORT;

app.use(express.static("client"));

app.listen(PORT, () => {
  console.log(`Client running at http://localhost:${PORT}`);
});
