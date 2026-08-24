const { createApp } = require("./app");

const PORT = process.env.PORT || 4000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Smart Offshore Wind Farm Management Platform API listening on port ${PORT}`);
});
