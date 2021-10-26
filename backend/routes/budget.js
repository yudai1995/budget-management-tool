const Router = require("express");

const {
  createBudget,
  getBudget,
  updateBudget,
  deleteBudget,
} = require("../controllers/budget");
const router = Router();

router.post("/api", createBudget);

router.get("/api", getBudget);

router.patch("/api/:id", updateBudget);

router.delete("/api/:id", deleteBudget);

router.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/build/index.html"));
});

module.exports = router;