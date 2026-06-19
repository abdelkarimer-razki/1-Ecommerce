const p1 = require('./app/backend/db');

async function migrate() {
  try {
    console.log("Starting DB Migration...");
    
    // Create product_sizes table
    await p1.query(`
      CREATE TABLE IF NOT EXISTS product_sizes (
        idsize SERIAL PRIMARY KEY,
        idproducts INT REFERENCES products(idproducts) ON DELETE CASCADE,
        taille VARCHAR(50) NOT NULL,
        prix DECIMAL(10, 2) NOT NULL
      )
    `);
    console.log("Table 'product_sizes' created or already exists.");

    // Check if we need to migrate existing sizes.
    const countRes = await p1.query("SELECT COUNT(*) FROM product_sizes");
    if (parseInt(countRes.rows[0].count) === 0) {
      console.log("No sizes in product_sizes. Migrating sizes from products table...");
      const productsRes = await p1.query("SELECT idproducts, taille, prix, taille2, prix2, taille3, prix3 FROM products");
      
      for (const prod of productsRes.rows) {
        // Size 1
        if (prod.taille && prod.taille !== '0' && prod.prix && parseFloat(prod.prix) > 0) {
          await p1.query("INSERT INTO product_sizes (idproducts, taille, prix) VALUES ($1, $2, $3)", [prod.idproducts, prod.taille, prod.prix]);
        }
        // Size 2
        if (prod.taille2 && prod.taille2 !== '0' && prod.prix2 && parseFloat(prod.prix2) > 0) {
          await p1.query("INSERT INTO product_sizes (idproducts, taille, prix) VALUES ($1, $2, $3)", [prod.idproducts, prod.taille2, prod.prix2]);
        }
        // Size 3
        if (prod.taille3 && prod.taille3 !== '0' && prod.prix3 && parseFloat(prod.prix3) > 0) {
          await p1.query("INSERT INTO product_sizes (idproducts, taille, prix) VALUES ($1, $2, $3)", [prod.idproducts, prod.taille3, prod.prix3]);
        }
      }
      console.log("Migration of existing product sizes complete.");
    } else {
      console.log("product_sizes table already contains data. Skipping initial migration.");
    }
    
    console.log("DB Migration Complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration Error:", err);
    process.exit(1);
  }
}

migrate();
