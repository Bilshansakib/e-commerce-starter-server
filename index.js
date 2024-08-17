const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 9000;

app.use(cors({
  origin: [
    "https://e-commerce-starter-15646.web.app",
    "http://localhost:5173",
    "http://localhost:9000",
  ],
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7hlvjai.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const productCollection = client
      .db("e-commerce-starter")
      .collection("products");
    // fetch all products
    app.get("/api/products", async (req, res) => {
      const { search, category, brand, minPrice, maxPrice, sort } = req.query;
      let query = {};
      if (search) {
        query.productName = { $regex: search, $options: "i" };
      }
      if (category) {
        query.category = category;
      }
      if (brand) {
        query.brandName = brand;
      }
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) {
          query.price.$gte = parseFloat(minPrice);
        }
        if (maxPrice) {
          query.price.$lte = parseFloat(maxPrice);
        }
      }
      let products = await productCollection.find(query).toArray();

      if (sort) {
        const sortOrder = sort === "asc" ? 1 : -1;
        products = products.sort((a, b) => (a.price - b.price) * sortOrder);
      }
      res.send(products);
    });
    // pagination
    app.get("/PaginatedProducts", async (req, res) => {
      const allProduct = await productCollection.find().toArray();
      const page = parseInt(req.query.page)
      const limit = parseInt(req.query.limit)

      const startIndex = (page - 1) * limit;
      const lastIndex = page * limit;
      const results = {};
      results.totalProducts =allProduct.length
      results.pageCount = Math.ceil(allProduct.length/limit)

      if (lastIndex < allProduct.length) {
        results.next = {
          page: page + 1,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
        };
      }

      results.result = allProduct.slice(startIndex, lastIndex);

      res.json(results);
    });
    app.get("/PaginatedProducts", async (req, res) => {
      const allProduct = await productCollection.find().toArray();
      const page = parseInt(req.query.page)
      const limit = parseInt(req.query.limit)

      const startIndex = (page - 1) * limit;
      const lastIndex = page * limit;
      const results = {};
      results.totalProducts =allProduct.length
      results.pageCount = Math.ceil(allProduct.length/limit)

      if (lastIndex < allProduct.length) {
        results.next = {
          page: page + 1,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
        };
      }

      results.result = allProduct.slice(startIndex, lastIndex);

      res.json(results);
    });
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from saaqib server....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
