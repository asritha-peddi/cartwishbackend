const mongoose = require("mongoose");

mongoose
  .connect(process.env.DATABASE)
  .then(async () => {
    const Products = require("./models/products");
    await Products.updateOne(
      { _id: "6a9546bb8e37f39d57c2ce84" },
      { $set: { reviews: { rate: 4, counts: 0 } } }
    );
    console.log("Updated!");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
