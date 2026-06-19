const fs = require('fs');
const path = require('path');
const { Client, Pool } = require('pg');
const crypto = require('crypto');

// 1. Helper to encrypt passwords frontend-style (AES-128-CBC with key/iv = 'p&aNDm6&whRD#HdL')
function encryptPassword(plainText) {
  const secret = 'p&aNDm6&whRD#HdL';
  const key = Buffer.from(secret, 'utf8');
  const iv = Buffer.from(secret, 'utf8');
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

// 2. Parse connection parameters from db.js
function getDbConfig() {
  const dbPath = path.join(__dirname, 'db.js');
  if (!fs.existsSync(dbPath)) {
    console.error('db.js not found at:', dbPath);
    process.exit(1);
  }

  const content = fs.readFileSync(dbPath, 'utf8');
  
  // Extract configuration fields using regex
  const userMatch = content.match(/user\s*:\s*["']([^"']+)["']/);
  const passwordMatch = content.match(/password\s*:\s*["']([^"']+)["']/);
  const databaseMatch = content.match(/database\s*:\s*["']([^"']+)["']/);
  const hostMatch = content.match(/host\s*:\s*["']([^"']+)["']/);
  const portMatch = content.match(/port\s*:\s*(\d+)/);

  return {
    user: userMatch ? userMatch[1] : 'postgres',
    password: passwordMatch ? passwordMatch[1] : 'postgres',
    database: databaseMatch ? databaseMatch[1] : 'postgres',
    host: hostMatch ? hostMatch[1] : 'localhost',
    port: portMatch ? parseInt(portMatch[1]) : 5432,
  };
}

async function main() {
  const config = getDbConfig();
  console.log('Parsed database configuration:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database
  });

  // Step A: Ensure target database exists
  // Connect to the default 'postgres' database to verify/create the target database
  const initClient = new Client({
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    database: 'postgres', // default system DB
  });

  try {
    await initClient.connect();
    console.log('Connected to default database "postgres" to verify database existence...');
    
    // Check if the target database exists
    const dbCheckRes = await initClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [config.database]
    );

    if (dbCheckRes.rowCount === 0) {
      console.log(`Database "${config.database}" does not exist. Creating it...`);
      // CREATE DATABASE cannot run inside a transaction block or with parameterized input in simple queries
      await initClient.query(`CREATE DATABASE "${config.database}"`);
      console.log(`Database "${config.database}" created successfully.`);
    } else {
      console.log(`Database "${config.database}" already exists.`);
    }
  } catch (err) {
    console.error('Failed checking or creating target database:', err.message);
  } finally {
    await initClient.end();
  }

  // Step B: Connect to the target database and seed tables
  const pool = new Pool(config);

  try {
    console.log(`Connecting to database "${config.database}" to create tables...`);
    
    // Create Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        iduser SERIAL PRIMARY KEY,
        fname VARCHAR(255) NOT NULL,
        lname VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        tel VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        adress TEXT,
        admin BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('Table "users" verified/created.');

    // Create Products Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        idproducts SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        picture TEXT,
        description TEXT,
        prix NUMERIC DEFAULT 0,
        categorie VARCHAR(255),
        mangable BOOLEAN DEFAULT FALSE,
        prixf NUMERIC DEFAULT 0,
        taille VARCHAR(50),
        taille2 VARCHAR(50),
        taille3 VARCHAR(50),
        prix2 NUMERIC DEFAULT 0,
        prix3 NUMERIC DEFAULT 0
      )
    `);
    console.log('Table "products" verified/created.');

    // Create Commande Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS commande (
        idcommande SERIAL PRIMARY KEY,
        idproducts INTEGER REFERENCES products(idproducts) ON DELETE CASCADE,
        iduser INTEGER REFERENCES users(iduser) ON DELETE CASCADE,
        qte INTEGER DEFAULT 1,
        prix NUMERIC DEFAULT 0,
        datecommand DATE DEFAULT CURRENT_DATE,
        cart BOOLEAN DEFAULT FALSE,
        taille VARCHAR(50),
        verifie BOOLEAN DEFAULT FALSE,
        etat BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('Table "commande" verified/created.');

    // Step C: Seed initial data if tables are empty
    // 1. Seed Users
    const userCountRes = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCountRes.rows[0].count) === 0) {
      console.log('Seeding initial users...');
      
      const adminPass = encryptPassword('admin123');
      const userPass = encryptPassword('user123');

      // Admin user
      await pool.query(
        `INSERT INTO users (fname, lname, email, tel, password, adress, admin) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['Karim', 'El Razki', 'admin@coop.com', '0600000000', adminPass, 'Coop Bab Mansour, Meknes', true]
      );

      // Normal user
      await pool.query(
        `INSERT INTO users (fname, lname, email, tel, password, adress, admin) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['Ahmed', 'Alaoui', 'user@coop.com', '0611111111', userPass, 'Meknes Centre Ville', false]
      );
      
      console.log('Users seeded (Admin: admin@coop.com / admin123, User: user@coop.com / user123).');
    } else {
      console.log('Users table already contains data.');
    }

    // 2. Seed Products
    const productCountRes = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCountRes.rows[0].count) === 0) {
      console.log('Seeding initial products...');

      // Mock base64 image strings with '/' replaced by 'kigmfhhh'
      const mockPic = 'data:imagekigmfhhhpng;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const initialProducts = [
        {
          name: "Miel d'Eucalyptus Premium",
          picture: mockPic,
          description: "Miel de fleurs d'Eucalyptus pur récolté à froid dans les forêts du Moyen Atlas.",
          prix: 60,
          categorie: "MIEL",
          mangable: true,
          prixf: 75,
          taille: "250g",
          taille2: "500g",
          taille3: "1kg",
          prix2: 110,
          prix3: 200
        },
        {
          name: "Miel de Thym Pur",
          picture: mockPic,
          description: "Miel de thym sauvage réputé pour sa saveur aromatique forte et ses propriétés antiseptiques.",
          prix: 90,
          categorie: "MIEL",
          mangable: true,
          prixf: 0,
          taille: "250g",
          taille2: "500g",
          taille3: "1kg",
          prix2: 170,
          prix3: 320
        },
        {
          name: "Huile d'Argan Alimentaire",
          picture: mockPic,
          description: "Huile d'argan torréfiée traditionnelle bio, au goût subtil de noisette.",
          prix: 120,
          categorie: "HUILE",
          mangable: true,
          prixf: 140,
          taille: "250ml",
          taille2: "500ml",
          taille3: "1L",
          prix2: 220,
          prix3: 400
        },
        {
          name: "Huile d'Argan Cosmétique",
          picture: mockPic,
          description: "Huile d'argan pure de première pression à froid, idéale pour l'hydratation de la peau et des cheveux.",
          prix: 80,
          categorie: "HUILE",
          mangable: false,
          prixf: 0,
          taille: "50ml",
          taille2: "100ml",
          taille3: "250ml",
          prix2: 150,
          prix3: 280
        },
        {
          name: "Huile d'Olive Extra Vierge",
          picture: mockPic,
          description: "Huile d'olive vierge extra pressée à froid de la région de Meknès.",
          prix: 40,
          categorie: "HUILE",
          mangable: true,
          prixf: 50,
          taille: "500ml",
          taille2: "1L",
          taille3: "2L",
          prix2: 75,
          prix3: 140
        }
      ];

      for (const p of initialProducts) {
        await pool.query(
          `INSERT INTO products (name, picture, description, prix, categorie, mangable, prixf, taille, taille2, taille3, prix2, prix3)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [p.name, p.picture, p.description, p.prix, p.categorie, p.mangable, p.prixf, p.taille, p.taille2, p.taille3, p.prix2, p.prix3]
        );
      }
      console.log('Products seeded.');
    } else {
      console.log('Products table already contains data.');
    }

    // 3. Seed Commands (Orders)
    const commandCountRes = await pool.query('SELECT COUNT(*) FROM commande');
    if (parseInt(commandCountRes.rows[0].count) === 0) {
      console.log('Seeding initial orders...');
      
      const currentYear = new Date().getFullYear();
      
      // Get a user and product to link
      const userRes = await pool.query("SELECT iduser FROM users WHERE admin=false LIMIT 1");
      const productRes = await pool.query("SELECT idproducts, prix, prix2, prix3, taille, taille2, taille3 FROM products LIMIT 3");

      if (userRes.rowCount > 0 && productRes.rowCount > 0) {
        const userId = userRes.rows[0].iduser;
        const products = productRes.rows;

        // Generate historic completed orders for each month of the current year (to populate dashboard graphs)
        const monthlyRevenues = [350, 480, 200, 600, 450, 750, 900, 300, 550, 720, 800, 950];
        
        for (let i = 0; i < 12; i++) {
          const monthStr = String(i + 1).padStart(2, '0');
          const dateStr = `${currentYear}-${monthStr}-15`;
          const amount = monthlyRevenues[i];
          const prod = products[i % products.length];

          // Seeding completed orders (cart=false, etat=true, verifie=true)
          await pool.query(
            `INSERT INTO commande (idproducts, iduser, qte, prix, datecommand, cart, taille, verifie, etat)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [prod.idproducts, userId, 1, amount, dateStr, false, prod.taille, true, true]
          );
        }

        // Add some active cart items (cart=true, etat=false)
        await pool.query(
          `INSERT INTO commande (idproducts, iduser, qte, prix, datecommand, cart, taille, verifie, etat)
           VALUES ($1, $2, $3, $4, NOW()::date, $5, $6, $7, $8)`,
          [products[0].idproducts, userId, 2, products[0].prix * 2, true, products[0].taille, false, false]
        );

        await pool.query(
          `INSERT INTO commande (idproducts, iduser, qte, prix, datecommand, cart, taille, verifie, etat)
           VALUES ($1, $2, $3, $4, NOW()::date, $5, $6, $7, $8)`,
          [products[1].idproducts, userId, 1, products[1].prix2, true, products[1].taille2, false, false]
        );

        // Add a pending checkout command (cart=false, etat=false)
        await pool.query(
          `INSERT INTO commande (idproducts, iduser, qte, prix, datecommand, cart, taille, verifie, etat)
           VALUES ($1, $2, $3, $4, NOW()::date, $5, $6, $7, $8)`,
          [products[2].idproducts, userId, 1, products[2].prix, false, products[2].taille, false, false]
        );

        console.log('Orders seeded.');
      } else {
        console.log('Could not seed orders: user or product records missing.');
      }
    } else {
      console.log('Commande table already contains data.');
    }

    console.log('Seeder completed successfully.');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await pool.end();
  }
}

main();
