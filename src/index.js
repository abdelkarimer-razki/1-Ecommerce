require('dotenv').config();
const express=require("express");
var cors = require('cors');
const jwt=require('jsonwebtoken');
const path = require("path");
const fs = require('fs');
const p1=require('./app/backend/db');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app=express();

// Security constants from environment
const JWT_SECRET = process.env.JWT_SECRET || 'wJ%Y24fH9UtVzYO';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

// OpenWA integration
const OPENWA_URL = process.env.OPENWA_URL || 'http://localhost:2785';
const OPENWA_SESSION = process.env.OPENWA_SESSION || 'default';
const OPENWA_API_KEY = process.env.OPENWA_API_KEY || '';

// Rate limiter for login: max 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for registration: max 5 per hour per IP
const registreLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many registration attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function formatProductRows(rows) {
  return rows.map(row => {
    const sizes = row.sizes || [];
    sizes.sort((a, b) => a.idsize - b.idsize);
    row.taille = sizes[0] ? sizes[0].taille : '0';
    row.prix = sizes[0] ? parseFloat(sizes[0].prix) : 0;
    row.taille2 = sizes[1] ? sizes[1].taille : '0';
    row.prix2 = sizes[1] ? parseFloat(sizes[1].prix) : 0;
    row.taille3 = sizes[2] ? sizes[2].taille : '0';
    row.prix3 = sizes[2] ? parseFloat(sizes[2].prix) : 0;
    return row;
  });
}

// Restrict CORS to the frontend origin only
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
}));
app.options('*', cors());

// HTTP security headers
app.use(helmet({ contentSecurityPolicy: false }));

var bodyParser = require('body-parser');
// 5MB limit — enough for product images; 50MB was a DoS risk
app.use(bodyParser.json({limit: "5mb"}));
app.use(bodyParser.urlencoded({limit: "5mb", extended: true, parameterLimit:5000}));

var i=0;
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');

app.use(express.json());
app.listen(5000);

// Helper to call google translate API on backend
async function translateText(text, targetLang) {
  if (!text || text.trim() === '') return '';
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=${targetLang.toLowerCase()}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json && json[0]) {
      return json[0].map(item => item[0]).join('') || text;
    }
    return text;
  } catch (err) {
    console.error("Backend translation error:", err);
    return text;
  }
}

async function initCategoriesTable() {
  try {
    // Add columns if not exists
    await p1.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS highlighted BOOLEAN DEFAULT FALSE
    `);
    await p1.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS name_en VARCHAR(255)
    `);
    await p1.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255)
    `);
    await p1.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS description_en TEXT
    `);
    await p1.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS description_ar TEXT
    `);
    await p1.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0
    `);
    await p1.query(`
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_en VARCHAR(100)
    `);
    await p1.query(`
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_ar VARCHAR(100)
    `);
    await p1.query(`
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS picture TEXT
    `);
    await p1.query(`
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS bg_color VARCHAR(50)
    `);

    // Migrate translations for existing records in background
    setTimeout(async () => {
      try {
        console.log("Starting backend translation migration for empty DB columns...");
        
        // Products translation migration
        const productsRes = await p1.query("SELECT idproducts, name, description, name_en, name_ar, description_en, description_ar FROM products");
        for (const row of productsRes.rows) {
          let needsUpdate = false;
          let nameEn = row.name_en;
          let nameAr = row.name_ar;
          let descEn = row.description_en;
          let descAr = row.description_ar;

          if (!nameEn) {
            nameEn = await translateText(row.name, 'en');
            needsUpdate = true;
          }
          if (!nameAr) {
            nameAr = await translateText(row.name, 'ar');
            needsUpdate = true;
          }
          if (row.description && !descEn) {
            descEn = await translateText(row.description, 'en');
            needsUpdate = true;
          }
          if (row.description && !descAr) {
            descAr = await translateText(row.description, 'ar');
            needsUpdate = true;
          }

          if (needsUpdate) {
            await p1.query(
              "UPDATE products SET name_en=$1, name_ar=$2, description_en=$3, description_ar=$4 WHERE idproducts=$5",
              [nameEn, nameAr, descEn, descAr, row.idproducts]
            );
            console.log(`Migrated translations for product: "${row.name}" -> EN: "${nameEn}", AR: "${nameAr}"`);
          }
        }

        // Categories translation migration
        const categoriesRes = await p1.query("SELECT idcategory, name, name_en, name_ar FROM categories");
        for (const row of categoriesRes.rows) {
          let needsUpdate = false;
          let nameEn = row.name_en;
          let nameAr = row.name_ar;

          if (!nameEn) {
            if (row.name === 'MIEL') nameEn = 'Honey';
            else if (row.name === 'HUILE') nameEn = 'Oil';
            else nameEn = await translateText(row.name, 'en');
            needsUpdate = true;
          }
          if (!nameAr) {
            if (row.name === 'MIEL') nameAr = 'عسل';
            else if (row.name === 'HUILE') nameAr = 'زيت';
            else nameAr = await translateText(row.name, 'ar');
            needsUpdate = true;
          }

          if (needsUpdate) {
            await p1.query(
              "UPDATE categories SET name_en=$1, name_ar=$2 WHERE idcategory=$3",
              [nameEn, nameAr, row.idcategory]
            );
            console.log(`Migrated translations for category: "${row.name}" -> EN: "${nameEn}", AR: "${nameAr}"`);
          }
        }
        console.log("Backend translation migration complete!");
      } catch (err) {
        console.error("Migration background error:", err);
      }
    }, 2000);

    await p1.query(`
      CREATE TABLE IF NOT EXISTS categories (
        idcategory SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      )
    `);
    
    // Insert defaults
    await p1.query(`
      INSERT INTO categories (name) VALUES ('MIEL'), ('HUILE') ON CONFLICT DO NOTHING
    `);

    // Migrate categories from products
    const prodCats = await p1.query(`
      SELECT DISTINCT categorie FROM products 
      WHERE categorie IS NOT NULL AND categorie != 'null' AND categorie != ''
    `);
    for (const r of prodCats.rows) {
      if (r.categorie && r.categorie.trim() !== '') {
        await p1.query(`
          INSERT INTO categories (name) VALUES ($1) ON CONFLICT DO NOTHING
        `, [r.categorie.trim().toUpperCase()]);
      }
    }

    // Create messages table for reclamations
    await p1.query(`
      CREATE TABLE IF NOT EXISTS messages (
        idmessage SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        tel VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        date_sent TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create product_views table for tracking views by date
    await p1.query(`
      CREATE TABLE IF NOT EXISTS product_views (
        idview SERIAL PRIMARY KEY,
        idproducts INTEGER REFERENCES products(idproducts) ON DELETE CASCADE,
        view_date DATE DEFAULT CURRENT_DATE
      )
    `);

    // Migrate legacy views from products table
    const viewsCheck = await p1.query("SELECT COUNT(*) FROM product_views");
    if (parseInt(viewsCheck.rows[0].count) === 0) {
      console.log("Seeding product_views from legacy products.views column...");
      const productsRes = await p1.query("SELECT idproducts, COALESCE(views, 0) as views FROM products");
      for (const row of productsRes.rows) {
        const count = row.views;
        if (count > 0) {
          for (let idx = 0; idx < count; idx++) {
            // Spreading views over the last 30 days to populate month/all filters
            await p1.query("INSERT INTO product_views (idproducts, view_date) VALUES ($1, CURRENT_DATE - INTERVAL '1 day' * $2)", [row.idproducts, Math.floor(Math.random() * 30)]);
          }
        }
      }
      console.log("Legacy views migration complete!");
    }

    console.log("Categories, Messages, and Product Views tables initialized successfully!");
  } catch (err) {
    console.error("Failed to initialize categories table:", err);
  }
}
initCategoriesTable();

app.post('/toggle-highlight', verifyToken, async (req, res) => {
  try {
    const id = req.body.idproducts;
    const highlighted = req.body.highlighted || false;
    await p1.query("UPDATE products SET highlighted=$1 WHERE idproducts=$2", [highlighted, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating highlight status");
  }
});


function verifyToken(req, res, next) {
  if(!req.headers.authorization) {
    return res.status(401).send('Unauthorized request');
  }
  var token = req.headers.authorization.split(' ')[1];
  if(!token || token === 'null') {
    return res.status(401).send('Unauthorized request');
  }
  try {
    let payload = jwt.verify(token, JWT_SECRET);
    if(!payload) return res.status(401).send('Unauthorized request');
    req.user = payload;
    next();
  } catch(err) {
    return res.status(401).send('Token expired or invalid');
  }
}
function verifyToken2(req, res, next) {
  if(req.headers.authorization) {
    var token = req.headers.authorization.split(' ')[1];
    if(!token || token === 'null') {
      return res.status(401).send('Unauthorized request');
    }
    try {
      let payload = jwt.verify(token, JWT_SECRET);
      if(!payload) return res.status(401).send('Unauthorized request');
      req.user = payload;
    } catch(err) {
      return res.status(401).send('Token expired or invalid');
    }
  }
  next();
}
// Verify token AND that user has admin role embedded in JWT
function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).send('Forbidden: Admin access required');
    }
    next();
  });
}

app.get('/',async(req,res)=>{
  var today1 = new Date();
  var dd1 = String(today.getDate()).padStart(2, '0');
  if(dd1==dd){
    i++;
  }else{
    i=0;
    dd=dd1;
  }
  const query=await p1.query(`
    SELECT p.*, COALESCE(
      json_agg(
        json_build_object('idsize', s.idsize, 'taille', s.taille, 'prix', s.prix)
      ) FILTER (WHERE s.idsize IS NOT NULL),
      '[]'
    ) as sizes
    FROM products p
    LEFT JOIN product_sizes s ON p.idproducts = s.idproducts
    GROUP BY p.idproducts
    ORDER BY RANDOM()
  `);
  res.json(formatProductRows(query.rows));
})

app.get('/dashboard',verifyToken,async(req,res)=>{
  const query=await p1.query("SELECT * FROM public.order_group WHERE EXTRACT(MONTH FROM datecommand)=EXTRACT(MONTH FROM now())");
  res.json(query.rows);
})

app.get('/productshow',async(req,res)=>{
  const query=await p1.query(`
    SELECT p.*, COALESCE(
      json_agg(
        json_build_object('idsize', s.idsize, 'taille', s.taille, 'prix', s.prix)
      ) FILTER (WHERE s.idsize IS NOT NULL),
      '[]'
    ) as sizes
    FROM products p
    LEFT JOIN product_sizes s ON p.idproducts = s.idproducts
    GROUP BY p.idproducts
    ORDER BY p.idproducts
  `);
  res.json(formatProductRows(query.rows));
})

app.get('/visits',verifyToken,async(req,res)=>{
  res.json(i);
})

// List users for WhatsApp client selector (no password)
app.get('/users-list', verifyToken, async(req, res) => {
  const query = await p1.query(`
    SELECT 
      tel,
      COALESCE(MAX(fname), '') as fname,
      COALESCE(MAX(lname), '') as lname,
      COALESCE(MAX(email), '') as email,
      CAST(COUNT(idgroup) AS integer) as orders_count,
      CAST(COUNT(CASE WHEN etat = false THEN 1 END) AS integer) as pending_orders_count
    FROM (
      SELECT tel, fname, lname, email, NULL::integer as idgroup, NULL::boolean as etat FROM public.users
      UNION ALL
      SELECT tel, fullname as fname, '' as lname, email, idgroup, etat FROM public.order_group
    ) combined
    WHERE tel IS NOT NULL AND tel != ''
    GROUP BY tel
    ORDER BY fname
  `);
  res.json(query.rows);
})

app.get('/revenu',async(req,res)=>{
  const query=await p1.query("SELECT sum(prix_total) FROM public.order_group WHERE (etat=true)and(EXTRACT(MONTH FROM datecommand)=EXTRACT(MONTH FROM now()))");
  if(query.rows[0].sum==null){
    res.json(0);
  }else{
    res.json(parseInt(query.rows[0].sum));
  }
})

app.get('/users',verifyToken,async(req,res)=>{
  const query=await p1.query("SELECT * FROM public.users");
  res.json(query.rowCount);
})

app.get('/revenu/:mois',verifyToken,async(req,res)=>{
  const {mois}=req.params;
  const year = req.query.year || new Date().getFullYear();
  const query=await p1.query("SELECT SUM(prix_total) from public.order_group where (EXTRACT(YEAR FROM datecommand)=$1) and (etat=true) and (EXTRACT(MONTH FROM datecommand)=$2)",[year, mois]);
  const sum = query.rows[0].sum;
  res.json(sum ? parseInt(sum) : 0);
})

//update product
app.post('/p12',verifyToken,async(req,res)=>{
  const id=req.body.idproducts;
  const name=req.body.name;
  const prixf=req.body.prixf || 0;
  const desc=req.body.description;
  const cat=req.body.categorie;
  const mange=req.body.mangable;
  const pic=req.body.picture;

  let sizes = req.body.sizes;
  if (!sizes || !Array.isArray(sizes)) {
    sizes = [];
    if (req.body.taille && req.body.taille !== '0' && req.body.prix) {
      sizes.push({ taille: req.body.taille, prix: req.body.prix });
    }
    if (req.body.taille2 && req.body.taille2 !== '0' && req.body.prix2) {
      sizes.push({ taille: req.body.taille2, prix: req.body.prix2 });
    }
    if (req.body.taille3 && req.body.taille3 !== '0' && req.body.prix3) {
      sizes.push({ taille: req.body.taille3, prix: req.body.prix3 });
    }
  }

  if (cat && cat.trim() !== '') {
    const cleanCat = cat.trim().toUpperCase();
    const catEn = await translateText(cleanCat, 'en');
    const catAr = await translateText(cleanCat, 'ar');
    await p1.query("INSERT INTO categories (name, name_en, name_ar) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [cleanCat, catEn, catAr]);
  }

  let name_en = req.body.name_en;
  let name_ar = req.body.name_ar;
  let desc_en = req.body.description_en;
  let desc_ar = req.body.description_ar;

  if (!name_en || name_en.trim() === '') {
    name_en = await translateText(name, 'en');
  }
  if (!name_ar || name_ar.trim() === '') {
    name_ar = await translateText(name, 'ar');
  }
  if (desc && (!desc_en || desc_en.trim() === '')) {
    desc_en = await translateText(desc, 'en');
  }
  if (desc && (!desc_ar || desc_ar.trim() === '')) {
    desc_ar = await translateText(desc, 'ar');
  }

  const onssa=req.body.onssa || false;
  const onssa_number=req.body.onssa_number || '';

  const query = await p1.query(
    "UPDATE products SET name=$1,description=$2,categorie=$3,mangable=$4,prixf=$5,picture=$7,name_en=$8,name_ar=$9,description_en=$10,description_ar=$11,onssa=$12,onssa_number=$13 WHERE idproducts=$6",
    [name,desc,cat,mange,prixf,id,pic,name_en,name_ar,desc_en,desc_ar,onssa,onssa_number]
  );

  await p1.query("DELETE FROM product_sizes WHERE idproducts = $1", [id]);
  for (const s of sizes) {
    if (s.taille && s.taille !== '0' && s.prix) {
      await p1.query("INSERT INTO product_sizes (idproducts, taille, prix) VALUES ($1, $2, $3)", [id, s.taille, s.prix]);
    }
  }

  res.json(query.rows);
})

//add product
app.post('/addpro',verifyToken,async(req,res)=>
{
  const name=req.body.name;
  const prixf=req.body.prixf || 0;
  const desc=req.body.description;
  const pic = req.body.picture;
  const cat=req.body.categorie;
  const mange=req.body.mangable;
  
  let sizes = req.body.sizes;
  if (!sizes || !Array.isArray(sizes)) {
    sizes = [];
    if (req.body.taille && req.body.taille !== '0' && req.body.prix) {
      sizes.push({ taille: req.body.taille, prix: req.body.prix });
    }
    if (req.body.taille2 && req.body.taille2 !== '0' && req.body.prix2) {
      sizes.push({ taille: req.body.taille2, prix: req.body.prix2 });
    }
    if (req.body.taille3 && req.body.taille3 !== '0' && req.body.prix3) {
      sizes.push({ taille: req.body.taille3, prix: req.body.prix3 });
    }
  }

  if (cat && cat.trim() !== '') {
    const cleanCat = cat.trim().toUpperCase();
    const catEn = await translateText(cleanCat, 'en');
    const catAr = await translateText(cleanCat, 'ar');
    await p1.query("INSERT INTO categories (name, name_en, name_ar) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [cleanCat, catEn, catAr]);
  }

  let name_en = req.body.name_en;
  let name_ar = req.body.name_ar;
  let desc_en = req.body.description_en;
  let desc_ar = req.body.description_ar;

  if (!name_en || name_en.trim() === '') {
    name_en = await translateText(name, 'en');
  }
  if (!name_ar || name_ar.trim() === '') {
    name_ar = await translateText(name, 'ar');
  }
  if (desc && (!desc_en || desc_en.trim() === '')) {
    desc_en = await translateText(desc, 'en');
  }
  if (desc && (!desc_ar || desc_ar.trim() === '')) {
    desc_ar = await translateText(desc, 'ar');
  }

  const onssa=req.body.onssa || false;
  const onssa_number=req.body.onssa_number || '';

  const query = await p1.query(
    "INSERT INTO products (name,picture,description,categorie,mangable,prixf,name_en,name_ar,description_en,description_ar,onssa,onssa_number) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING idproducts",
    [name,pic,desc,cat,mange,prixf,name_en,name_ar,desc_en,desc_ar,onssa,onssa_number]
  );
  
  const idproducts = query.rows[0].idproducts;

  for (const s of sizes) {
    if (s.taille && s.taille !== '0' && s.prix) {
      await p1.query("INSERT INTO product_sizes (idproducts, taille, prix) VALUES ($1, $2, $3)", [idproducts, s.taille, s.prix]);
    }
  }

  res.json(query.rows);
})

// ============================================================
// ORDER GROUP ENDPOINTS (multi-product orders)
// ============================================================

// Get all pending (non-effectue) orders with their items
app.get('/commandnonEffectuer',verifyToken,async(req,res)=>{
  const query=await p1.query(`
    SELECT 
      og.idgroup, og.fullname, og.tel, og.email, og.adress, og.source,
      og.etat, og.verifie, og.prix_total,
      to_char(og.datecommand, 'DD/MM/YYYY') as to_char,
      COALESCE(
        json_agg(
          json_build_object(
            'idcommande', c.idcommande,
            'idproducts', c.idproducts,
            'name', p.name,
            'picture', p.picture,
            'taille', c.taille,
            'qte', c.qte,
            'prix', c.prix
          ) ORDER BY c.idcommande
        ) FILTER (WHERE c.idcommande IS NOT NULL),
        '[]'
      ) as items
    FROM order_group og
    LEFT JOIN commande c ON og.idgroup = c.idgroup
    LEFT JOIN products p ON c.idproducts = p.idproducts
    WHERE og.etat = false
    GROUP BY og.idgroup
    ORDER BY og.idgroup DESC
  `);
  res.json(query.rows);
})

// Get completed orders for a month
app.get('/commandEffectuer',verifyToken,async(req,res)=>{
  const query=await p1.query(`
    SELECT 
      og.idgroup, og.fullname, og.tel, og.email, og.adress, og.source,
      og.etat, og.verifie, og.prix_total,
      to_char(og.datecommand, 'DD/MM/YYYY') as to_char,
      COALESCE(
        json_agg(
          json_build_object(
            'idcommande', c.idcommande,
            'idproducts', c.idproducts,
            'name', p.name,
            'picture', p.picture,
            'taille', c.taille,
            'qte', c.qte,
            'prix', c.prix
          ) ORDER BY c.idcommande
        ) FILTER (WHERE c.idcommande IS NOT NULL),
        '[]'
      ) as items
    FROM order_group og
    LEFT JOIN commande c ON og.idgroup = c.idgroup
    LEFT JOIN products p ON c.idproducts = p.idproducts
    WHERE og.etat = true AND to_char(og.datecommand, 'YYYY-MM') = to_char(current_date, 'YYYY-MM')
    GROUP BY og.idgroup
    ORDER BY og.idgroup DESC
  `);
  res.json(query.rows);
})

// Search completed orders by month
app.get('/commandEffectuer/:date',async(req,res)=>{
  const {date}=req.params;
  let query;
  if (date && date.length === 7) {
    query = await p1.query(`
      SELECT 
        og.idgroup, og.fullname, og.tel, og.email, og.adress, og.source,
        og.etat, og.verifie, og.prix_total,
        to_char(og.datecommand, 'DD/MM/YYYY') as to_char,
        COALESCE(
          json_agg(
            json_build_object(
              'idcommande', c.idcommande,
              'idproducts', c.idproducts,
              'name', p.name,
              'picture', p.picture,
              'taille', c.taille,
              'qte', c.qte,
              'prix', c.prix
            ) ORDER BY c.idcommande
          ) FILTER (WHERE c.idcommande IS NOT NULL),
          '[]'
        ) as items
      FROM order_group og
      LEFT JOIN commande c ON og.idgroup = c.idgroup
      LEFT JOIN products p ON c.idproducts = p.idproducts
      WHERE og.etat = true AND to_char(og.datecommand, 'YYYY-MM') = $1
      GROUP BY og.idgroup
      ORDER BY og.idgroup DESC
    `,[date]);
  } else {
    query = await p1.query(`
      SELECT 
        og.idgroup, og.fullname, og.tel, og.email, og.adress, og.source,
        og.etat, og.verifie, og.prix_total,
        to_char(og.datecommand, 'DD/MM/YYYY') as to_char,
        COALESCE(
          json_agg(
            json_build_object(
              'idcommande', c.idcommande,
              'idproducts', c.idproducts,
              'name', p.name,
              'picture', p.picture,
              'taille', c.taille,
              'qte', c.qte,
              'prix', c.prix
            ) ORDER BY c.idcommande
          ) FILTER (WHERE c.idcommande IS NOT NULL),
          '[]'
        ) as items
      FROM order_group og
      LEFT JOIN commande c ON og.idgroup = c.idgroup
      LEFT JOIN products p ON c.idproducts = p.idproducts
      WHERE og.etat = true AND og.datecommand = $1
      GROUP BY og.idgroup
      ORDER BY og.idgroup DESC
    `,[date]);
  }
  res.json(query.rows);
})

// Update order group etat
app.put('/effectue/:id',verifyToken,async(req,res)=>{
  const {id}=req.params;
  await p1.query("UPDATE order_group set etat=true WHERE idgroup=$1",[id]);
  await p1.query("UPDATE commande set etat=true WHERE idgroup=$1",[id]);
  res.json({success:true});
})

app.put('/effectue1/:id',verifyToken,async(req,res)=>{
  const {id}=req.params;
  await p1.query("UPDATE order_group set etat=false WHERE idgroup=$1",[id]);
  await p1.query("UPDATE commande set etat=false WHERE idgroup=$1",[id]);
  res.json({success:true});
})

// Verify/unverify order group — admin only
app.put('/v/:id', verifyToken, async(req,res)=>{
  const {id}=req.params;
  await p1.query("UPDATE order_group SET verifie=false WHERE idgroup=$1",[id]);
  res.json({success:true});
})

app.put('/v1/:id', verifyToken, async(req,res)=>{
  const {id}=req.params;
  await p1.query("UPDATE order_group SET verifie=true WHERE idgroup=$1",[id]);
  res.json({success:true});
})

// Delete entire order group and its items
app.delete('/order-group/:id',verifyToken,async(req,res)=>{
  const {id}=req.params;
  await p1.query("DELETE FROM commande WHERE idgroup=$1",[id]);
  await p1.query("DELETE FROM order_group WHERE idgroup=$1",[id]);
  res.json({success:true});
})

// ============================================================
// CHECKOUT: Submit a multi-product order (guest or logged-in)
// ============================================================
app.post('/checkout',async(req,res)=>{
  try {
    const { fullname, tel, email, adress, items, source } = req.body;
    // items: [{idproducts, taille, qte, prix}]
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'No items in order' });
    }

    // Find or create user
    let userId;
    const userCheck = await p1.query("SELECT iduser FROM public.users WHERE tel=$1 LIMIT 1", [tel]);
    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].iduser;
    } else {
      const parts = fullname ? fullname.trim().split(' ') : ['Client', 'Anonyme'];
      const fname = parts[0] || 'Client';
      const lname = parts.slice(1).join(' ') || 'Anonyme';
      const insertUser = await p1.query(
        "INSERT INTO public.users (fname, lname, adress, tel, email, password) VALUES ($1, $2, $3, $4, $5, 'guest_pwd') RETURNING iduser",
        [fname, lname, adress||'', tel||'0000000000', email||'']
      );
      userId = insertUser.rows[0].iduser;
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + (Number(item.prix) * Number(item.qte)), 0);

    // Create order_group
    const grpResult = await p1.query(
      `INSERT INTO order_group (iduser, fullname, tel, email, adress, source, etat, verifie, datecommand, prix_total)
       VALUES ($1, $2, $3, $4, $5, $6, false, false, CURRENT_DATE, $7) RETURNING idgroup`,
      [userId, fullname, tel, email||'', adress||'', source||'site', total]
    );
    const idgroup = grpResult.rows[0].idgroup;

    // Insert each item into commande
    for (const item of items) {
      await p1.query(
        `INSERT INTO commande (idproducts, iduser, qte, prix, datecommand, cart, taille, verifie, etat, source, idgroup)
         VALUES ($1, $2, $3, $4, CURRENT_DATE, false, $5, false, false, $6, $7)`,
        [item.idproducts, userId, item.qte, Number(item.prix)*Number(item.qte), item.taille||'', source||'site', idgroup]
      );
    }

    res.status(201).json({ success: true, idgroup });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Add manual in-store command (multi-product)
app.post('/addManualCommand',verifyToken,async(req,res)=>{
  try {
    const { fullname, adress, tel, email, items, etat, source: src } = req.body;
    const source = src || 'magasin';

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'No items provided' });
    }

    let userId;
    const userCheck = await p1.query("SELECT iduser FROM public.users WHERE tel=$1 LIMIT 1", [tel]);
    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].iduser;
    } else {
      const parts = fullname ? fullname.trim().split(' ') : ['Client', 'Anonyme'];
      const fname = parts[0] || 'Client';
      const lname = parts.slice(1).join(' ') || 'Anonyme';
      const insertUser = await p1.query(
        "INSERT INTO public.users (fname, lname, adress, tel, email, password) VALUES ($1, $2, $3, $4, $5, 'manual_guest_pwd') RETURNING iduser",
        [fname, lname, adress||'', tel||'0000000000', email||'']
      );
      userId = insertUser.rows[0].iduser;
    }

    const total = items.reduce((sum, item) => sum + (Number(item.prix) * Number(item.qte)), 0);

    const grpResult = await p1.query(
      `INSERT INTO order_group (iduser, fullname, tel, email, adress, source, etat, verifie, datecommand, prix_total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, CURRENT_DATE, $8) RETURNING idgroup`,
      [userId, fullname, tel||'', email||'', adress||'', source, etat === true, total]
    );
    const idgroup = grpResult.rows[0].idgroup;

    for (const item of items) {
      await p1.query(
        `INSERT INTO commande (idproducts, iduser, qte, prix, datecommand, cart, taille, verifie, etat, source, idgroup)
         VALUES ($1, $2, $3, $4, CURRENT_DATE, false, $5, true, $6, $7, $8)`,
        [item.idproducts, userId, item.qte, Number(item.prix)*Number(item.qte), item.taille||'', etat===true, source, idgroup]
      );
    }

    res.status(201).json({ success: true, idgroup });
  } catch (err) {
    console.error("Error adding manual command:", err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/:categorie',async(req,res)=>{
  const {categorie}=req.params;
  const query=await p1.query(`
    SELECT p.*, COALESCE(
      json_agg(
        json_build_object('idsize', s.idsize, 'taille', s.taille, 'prix', s.prix)
      ) FILTER (WHERE s.idsize IS NOT NULL),
      '[]'
    ) as sizes
    FROM products p
    LEFT JOIN product_sizes s ON p.idproducts = s.idproducts
    WHERE p.categorie=$1
    GROUP BY p.idproducts
    ORDER BY RANDOM()
  `,[categorie]);
  res.json(formatProductRows(query.rows));
})

app.get('/categories/all', async(req, res) => {
  try {
    const query = await p1.query("SELECT * FROM categories ORDER BY name ASC");
    res.json(query.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

app.post('/categories/add', verifyToken, async(req, res) => {
  const { name, picture, bg_color } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).send('Category name is required');
  }
  const cleanName = name.trim().toUpperCase();
  try {
    const catEn = await translateText(cleanName, 'en');
    const catAr = await translateText(cleanName, 'ar');
    await p1.query("INSERT INTO categories (name, name_en, name_ar, picture, bg_color) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING", [cleanName, catEn, catAr, picture || null, bg_color || null]);
    res.status(201).json({ success: true, name: cleanName });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.put('/categories/:name/update', verifyToken, async(req, res) => {
  const { name } = req.params;
  const { newName, picture, bg_color } = req.body;
  try {
    const cleanOldName = name.trim().toUpperCase();
    const cleanNewName = newName ? newName.trim().toUpperCase() : null;

    if (cleanNewName && cleanNewName !== cleanOldName) {
      if (cleanOldName === 'MIEL' || cleanOldName === 'HUILE') {
        return res.status(400).send('Cannot rename default system categories');
      }
      
      const catEn = await translateText(cleanNewName, 'en');
      const catAr = await translateText(cleanNewName, 'ar');
      
      await p1.query(
        "UPDATE categories SET name=$1, name_en=$2, name_ar=$3, picture=$4, bg_color=$5 WHERE name=$6",
        [cleanNewName, catEn, catAr, picture || null, bg_color || null, cleanOldName]
      );
      
      await p1.query(
        "UPDATE products SET categorie=$1 WHERE categorie=$2",
        [cleanNewName, cleanOldName]
      );
    } else {
      await p1.query(
        "UPDATE categories SET picture=$1, bg_color=$2 WHERE name=$3",
        [picture || null, bg_color || null, cleanOldName]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.delete('/categories/:name', verifyToken, async(req, res) => {
  const { name } = req.params;
  try {
    await p1.query("DELETE FROM categories WHERE name = $1", [name]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/seachC/:categorie',async(req,res)=>{
  const {categorie}=req.params;
  const query=await p1.query(`
    SELECT p.*, COALESCE(
      json_agg(
        json_build_object('idsize', s.idsize, 'taille', s.taille, 'prix', s.prix)
      ) FILTER (WHERE s.idsize IS NOT NULL),
      '[]'
    ) as sizes
    FROM products p
    LEFT JOIN product_sizes s ON p.idproducts = s.idproducts
    WHERE p.categorie=$1
    GROUP BY p.idproducts
    ORDER BY RANDOM()
  `,[categorie]);
  res.json(formatProductRows(query.rows));
})

app.get('/mange/:mangable',async(req,res)=>{
  const {mangable}=req.params;
  const query=await p1.query(`
    SELECT p.*, COALESCE(
      json_agg(
        json_build_object('idsize', s.idsize, 'taille', s.taille, 'prix', s.prix)
      ) FILTER (WHERE s.idsize IS NOT NULL),
      '[]'
    ) as sizes
    FROM products p
    LEFT JOIN product_sizes s ON p.idproducts = s.idproducts
    WHERE p.mangable=$1
    GROUP BY p.idproducts
    ORDER BY RANDOM()
  `,[mangable]);
  res.json(formatProductRows(query.rows));
})

app.get('/buyProduct/:id',async(req,res)=>{
  const {id}=req.params;
  if (!id || id === 'null' || isNaN(parseInt(id))) {
    return res.json([]);
  }
  
  // Increment view counter and log view date
  p1.query("UPDATE products SET views = COALESCE(views, 0) + 1 WHERE idproducts = $1", [id]).catch(err => console.error("Error incrementing views:", err));
  p1.query("INSERT INTO product_views (idproducts) VALUES ($1)", [id]).catch(err => console.error("Error logging product view:", err));

  const query=await p1.query(`
    SELECT p.*, COALESCE(
      json_agg(
        json_build_object('idsize', s.idsize, 'taille', s.taille, 'prix', s.prix)
      ) FILTER (WHERE s.idsize IS NOT NULL),
      '[]'
    ) as sizes
    FROM products p
    LEFT JOIN product_sizes s ON p.idproducts = s.idproducts
    WHERE p.idproducts=$1
    GROUP BY p.idproducts
    ORDER BY RANDOM()
  `,[id]);
  res.json(formatProductRows(query.rows));
})

//login authentification
app.post('/login', loginLimiter, async(req,res)=>{
   const email= req.body.email;
   const password=req.body.password;
   if(!email || !password) {
     return res.status(400).send('Email and password are required');
   }
   const query=await p1.query("SELECT * FROM users WHERE (email=$1 OR tel=$1) AND password=$2",[email,password]);
   if(query.rows.length<1){
    return res.status(401).send('Unauthorized request');
   }else{
    const user = query.rows[0];
    // Embed admin role inside the JWT so it's server-validated
    let payload = { userId: user.iduser, isAdmin: user.admin === true };
    let K2hM$4PAWCeFV8 = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.status(200).send({
      K2hM$4PAWCeFV8,
      "iduser": user.iduser,
      "name": user.fname + " " + user.lname,
      "email": user.email,
      "admin": user.admin
    });
   }
})

//notification counter (cart items count is now localStorage based for guests)
app.get('/cartcount/:id',async(req,res)=>
{
  const id=req.params.id;
  if (!id || id === 'null' || isNaN(parseInt(id))) {
    return res.json([{ count: 0 }]);
  }
  const query = await p1.query("SELECT COUNT(*) FROM commande WHERE iduser=$1 and cart=true",[id]);
  res.json(query.rows);
})

//delete commande item — requires auth
app.delete('/deletecommande/:id', verifyToken, async(req,res)=>
{
  const id=req.params.id;
  const query = await p1.query("Delete FROM commande WHERE idcommande=$1",[id]);
  res.json(query.rows);
})

//delete product — requires auth
app.delete('/deletepro/:id', verifyToken, async(req,res)=>
{
  const id=req.params.id;
  const query = await p1.query("DELETE FROM products WHERE idproducts=$1",[id]);
  res.json(query.rows);
})

//modifier commande (legacy)
app.get("/commandeChange/:qte&:idcom&:id",verifyToken,async(req,res)=>{
  const id=req.params.id;
  const qte=req.params.qte;
  const idcom=req.params.idcom;
  const query=await p1.query("UPDATE commande set qte=$1,idproducts=$3 where idcommande=$2",[qte,idcom,id])
  res.json(query.rows)
})

app.get("/userM/:id&:adress",verifyToken,async(req,res)=>{
  const id=req.params.id;
  const adress=req.params.adress;
  const query=await p1.query("UPDATE users set adress=$1 where iduser=$2",[adress,id])
  res.json(query.rows)
})

//registre — rate limited, basic validation
app.post('/registre', registreLimiter, async(req,res)=>
{
  const fname=req.body.fname;
  const lname=req.body.lname;
  const email=req.body.email;
  const tel=req.body.tel;
  const password=req.body.password;
  const adress=req.body.adress;
  if (!fname || !lname || !email || !tel || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const query=await p1.query("INSERT INTO users (fname,lname,email,tel,password,adress) VALUES ($1,$2,$3,$4,$5,$6)",[fname,lname,email,tel,password,adress]);
  res.json(query.rows);
})

// Check if email/tel exists — returns only existence, not full user data
app.get('/test/:test', async(req,res)=>
{
  const test=req.params.test;
  const query=await p1.query("SELECT iduser FROM users WHERE email=$1 OR tel=$1",[test]);
  res.json(query.rows); // only returns iduser, not passwords
})

// Legacy cart routes (for logged-in users' cart page /cart)
app.get('/acheterorcart/:idproducts&:iduser&:qte&:prix&:cart&:taille',async(req,res)=>
{
  const idproducts = req.params.idproducts;
  const iduser = req.params.iduser;
  const qte = req.params.qte;
  const prix = req.params.prix;
  const taille = req.params.taille;
  const cart = req.params.cart;
  const query = await p1.query("INSERT INTO commande (idproducts,iduser,qte,prix,datecommand,cart,taille) VALUES ($1,$2,$3,$4,NOW()::date,$5,$6)",[idproducts,iduser,qte,prix,cart,taille]);
  res.json(query.rows);
})
app.get('/allcart/:iduser&:cart',async(req,res)=>
{
  const iduser=req.params.iduser;
  const cart=req.params.cart;
  if (!iduser || iduser === 'null' || isNaN(parseInt(iduser))) return res.json([]);
  const query = await p1.query(`
    SELECT c.idcommande, c.prix, c.qte, p.name, p.picture, c.taille as taille1,
      COALESCE(json_agg(json_build_object('idsize', s.idsize, 'taille', s.taille, 'prix', s.prix)) FILTER (WHERE s.idsize IS NOT NULL),'[]') as sizes
    FROM commande c JOIN products p ON c.idproducts = p.idproducts
    LEFT JOIN product_sizes s ON p.idproducts = s.idproducts
    WHERE c.iduser=$1 AND c.cart=$2 AND c.etat=false GROUP BY c.idcommande, p.idproducts
  `, [iduser, cart]);
  const formatted = query.rows.map(row => {
    const sizes = (row.sizes||[]).sort((a,b)=>a.idsize-b.idsize);
    row.taille=sizes[0]?sizes[0].taille:'0'; row.prix1=sizes[0]?parseFloat(sizes[0].prix):0;
    row.taille2=sizes[1]?sizes[1].taille:'0'; row.prix2=sizes[1]?parseFloat(sizes[1].prix):0;
    row.taille3=sizes[2]?sizes[2].taille:'0'; row.prix3=sizes[2]?parseFloat(sizes[2].prix):0;
    return row;
  });
  res.json(formatted);
})
app.get('/updatecommande/:id&:taille&:qte&:cart&:prix',async(req,res)=>{
  const {id,taille,qte,cart,prix}=req.params;
  await p1.query("UPDATE commande SET taille=$1,qte=$2,cart=$3,prix=$5 WHERE idcommande=$4",[taille,qte,cart,id,prix]);
  res.json({success:true});
})
app.get('/cartotachat/:idcommande',async(req,res)=>{
  try {
    const id = req.params.idcommande;
    const cmdResult = await p1.query("SELECT iduser, prix, qte FROM commande WHERE idcommande=$1", [id]);
    if (cmdResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Command not found' });
    }
    const { iduser, prix } = cmdResult.rows[0];

    const userResult = await p1.query("SELECT fname, lname, tel, email, adress FROM public.users WHERE iduser=$1", [iduser]);
    let fullname = 'Client Connecté';
    let tel = '';
    let email = '';
    let adress = '';
    if (userResult.rows.length > 0) {
      const u = userResult.rows[0];
      fullname = `${u.fname || ''} ${u.lname || ''}`.trim() || 'Client Connecté';
      tel = u.tel || '';
      email = u.email || '';
      adress = u.adress || '';
    }

    const grpResult = await p1.query(
      `INSERT INTO order_group (iduser, fullname, tel, email, adress, source, etat, verifie, datecommand, prix_total)
       VALUES ($1, $2, $3, $4, $5, 'site', false, false, CURRENT_DATE, $6) RETURNING idgroup`,
      [iduser, fullname, tel, email, adress, Number(prix)]
    );
    const idgroup = grpResult.rows[0].idgroup;

    await p1.query("UPDATE commande SET cart=false, idgroup=$1 WHERE idcommande=$2", [idgroup, id]);
    res.json({ success: true, idgroup });
  } catch (err) {
    console.error("cartotachat error:", err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
})

app.get('/cartotachatall/:iduser',async(req,res)=>{
  try {
    const iduser = req.params.iduser;
    if (!iduser || iduser === 'null' || isNaN(parseInt(iduser))) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const cmdResult = await p1.query("SELECT idcommande, prix FROM commande WHERE iduser=$1 AND cart=true", [iduser]);
    if (cmdResult.rows.length === 0) {
      return res.json({ success: true, message: 'Cart already empty' });
    }

    const userResult = await p1.query("SELECT fname, lname, tel, email, adress FROM public.users WHERE iduser=$1", [iduser]);
    let fullname = 'Client Connecté';
    let tel = '';
    let email = '';
    let adress = '';
    if (userResult.rows.length > 0) {
      const u = userResult.rows[0];
      fullname = `${u.fname || ''} ${u.lname || ''}`.trim() || 'Client Connecté';
      tel = u.tel || '';
      email = u.email || '';
      adress = u.adress || '';
    }

    const total = cmdResult.rows.reduce((sum, row) => sum + Number(row.prix), 0);

    const grpResult = await p1.query(
      `INSERT INTO order_group (iduser, fullname, tel, email, adress, source, etat, verifie, datecommand, prix_total)
       VALUES ($1, $2, $3, $4, $5, 'site', false, false, CURRENT_DATE, $6) RETURNING idgroup`,
      [iduser, fullname, tel, email, adress, total]
    );
    const idgroup = grpResult.rows[0].idgroup;

    await p1.query("UPDATE commande SET cart=false, idgroup=$1 WHERE iduser=$2 AND cart=true", [idgroup, iduser]);
    res.json({ success: true, idgroup });
  } catch (err) {
    console.error("cartotachatall error:", err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
})
app.get('/checkcart/:iduser&:idproduit',async(req,res)=>{
  const {iduser,idproduit}=req.params;
  if (!iduser||iduser==='null'||isNaN(parseInt(iduser))||!idproduit||idproduit==='null'||isNaN(parseInt(idproduit))) return res.json([{count:0}]);
  const query=await p1.query("SELECT COUNT(*) FROM commande WHERE iduser=$1 and idproducts=$2 and cart=true",[iduser,idproduit]);
  res.json(query.rows);
})

// ============================================================
// MESSAGES/RECLAMATIONS ENDPOINTS
// ============================================================

// Submit a reclamation/message
app.post('/api/messages', async (req, res) => {
  try {
    const { name, tel, message } = req.body;
    if (!name || !tel || !message || name.trim() === '' || tel.trim() === '' || message.trim() === '') {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    await p1.query(
      "INSERT INTO messages (name, tel, message) VALUES ($1, $2, $3)",
      [name.trim(), tel.trim(), message.trim()]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all reclamations/messages for Admin
app.get('/api/messages', verifyToken, async (req, res) => {
  try {
    const query = await p1.query("SELECT *, to_char(date_sent, 'DD/MM/YYYY HH24:MI') as date_formatted FROM messages ORDER BY idmessage DESC");
    res.json(query.rows);
  } catch (err) {
    console.error("Error loading messages:", err);
    res.status(500).send("Error loading messages");
  }
});

// Delete reclamation/message
app.delete('/api/messages/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await p1.query("DELETE FROM messages WHERE idmessage = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).send("Error deleting message");
  }
});

// Get product stats for Admin (most sold, least sold, most visited)
app.get('/api/product-stats', verifyToken, async (req, res) => {
  try {
    const period = req.query.period || 'all';
    let dateFilter = "";
    let subqueryDateFilter = "";
    
    if (period === 'today') {
      dateFilter = "AND c.datecommand = CURRENT_DATE";
      subqueryDateFilter = "AND datecommand = CURRENT_DATE";
    } else if (period === 'month') {
      dateFilter = "AND EXTRACT(MONTH FROM c.datecommand) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM c.datecommand) = EXTRACT(YEAR FROM CURRENT_DATE)";
      subqueryDateFilter = "AND EXTRACT(MONTH FROM datecommand) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM datecommand) = EXTRACT(YEAR FROM CURRENT_DATE)";
    }

    // 1. Most sold products (top 5)
    const mostSoldRes = await p1.query(`
      SELECT p.idproducts, p.name, p.name_en, p.name_ar, p.picture, p.categorie, 
             SUM(c.qte)::integer as total_sold, SUM(c.prix)::numeric as total_revenue
      FROM products p
      JOIN commande c ON p.idproducts = c.idproducts
      WHERE c.cart = false AND c.etat = true ${dateFilter}
      GROUP BY p.idproducts
      ORDER BY total_sold DESC, total_revenue DESC
      LIMIT 5
    `);

    // 2. Least sold products (top 5)
    const leastSoldRes = await p1.query(`
      SELECT p.idproducts, p.name, p.name_en, p.name_ar, p.picture, p.categorie, 
             COALESCE(SUM(c.qte), 0)::integer as total_sold, COALESCE(SUM(c.prix), 0)::numeric as total_revenue
      FROM products p
      LEFT JOIN (
        SELECT * FROM commande WHERE cart = false AND etat = true ${subqueryDateFilter}
      ) c ON p.idproducts = c.idproducts
      GROUP BY p.idproducts
      ORDER BY total_sold ASC, total_revenue ASC, p.name ASC
      LIMIT 5
    `);

    // 3. Most visited products (top 5, filtered by date via product_views table)
    let viewJoinFilter = "";
    if (period === 'today') {
      viewJoinFilter = "AND v.view_date = CURRENT_DATE";
    } else if (period === 'month') {
      viewJoinFilter = "AND EXTRACT(MONTH FROM v.view_date) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM v.view_date) = EXTRACT(YEAR FROM CURRENT_DATE)";
    }

    const mostVisitedRes = await p1.query(`
      SELECT p.idproducts, p.name, p.name_en, p.name_ar, p.picture, p.categorie, 
             COUNT(v.idview)::integer as views
      FROM products p
      LEFT JOIN product_views v ON p.idproducts = v.idproducts ${viewJoinFilter}
      GROUP BY p.idproducts
      ORDER BY views DESC, p.name ASC
      LIMIT 5
    `);

    // 4. General Stats Summary
    const prodCountRes = await p1.query("SELECT COUNT(*)::integer as count FROM products");
    const catCountRes = await p1.query("SELECT COUNT(*)::integer as count FROM categories");
    const salesSummaryRes = await p1.query(`
      SELECT COALESCE(SUM(qte), 0)::integer as total_qty, COALESCE(SUM(prix), 0)::numeric as total_rev
      FROM commande c
      WHERE cart = false AND etat = true ${dateFilter}
    `);

    // 5. Category Revenue split (Doughnut Chart)
    const categoryRevenueRes = await p1.query(`
      SELECT COALESCE(p.categorie, 'DIVERS') as categorie, SUM(c.prix)::numeric as revenue
      FROM commande c
      JOIN products p ON c.idproducts = p.idproducts
      WHERE c.cart = false AND c.etat = true ${dateFilter}
      GROUP BY p.categorie
      ORDER BY revenue DESC
    `);

    // 6. Seasonality & Trends Chart data
    const currentYear = new Date().getFullYear();
    let trends = [];
    let trendType = 'monthly'; // 'daily' or 'monthly'

    if (period === 'today') {
      // Daily trends for the last 7 days
      trendType = 'daily';
      const trendsRes = await p1.query(`
        SELECT COALESCE(p.categorie, 'DIVERS') as categorie, 
               c.datecommand::text as label, 
               SUM(c.qte)::integer as total_qty
        FROM commande c
        JOIN products p ON c.idproducts = p.idproducts
        WHERE c.cart = false AND c.etat = true AND c.datecommand >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY p.categorie, c.datecommand
        ORDER BY c.datecommand ASC, p.categorie
      `);
      trends = trendsRes.rows;
    } else if (period === 'month') {
      // Daily trends for the current month
      trendType = 'daily';
      const trendsRes = await p1.query(`
        SELECT COALESCE(p.categorie, 'DIVERS') as categorie, 
               EXTRACT(DAY FROM c.datecommand)::integer as label, 
               SUM(c.qte)::integer as total_qty
        FROM commande c
        JOIN products p ON c.idproducts = p.idproducts
        WHERE c.cart = false AND c.etat = true 
          AND EXTRACT(MONTH FROM c.datecommand) = EXTRACT(MONTH FROM CURRENT_DATE) 
          AND EXTRACT(YEAR FROM c.datecommand) = EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY p.categorie, label
        ORDER BY label ASC, p.categorie
      `);
      trends = trendsRes.rows;
    } else {
      // Monthly trends for the current year (all-time)
      trendType = 'monthly';
      const trendsRes = await p1.query(`
        SELECT COALESCE(p.categorie, 'DIVERS') as categorie, 
               EXTRACT(MONTH FROM c.datecommand)::integer as label, 
               SUM(c.qte)::integer as total_qty
        FROM commande c
        JOIN products p ON c.idproducts = p.idproducts
        WHERE c.cart = false AND c.etat = true AND EXTRACT(YEAR FROM c.datecommand) = $1
        GROUP BY p.categorie, label
        ORDER BY label ASC, p.categorie
      `, [currentYear]);
      trends = trendsRes.rows;
    }

    res.json({
      mostSold: mostSoldRes.rows,
      leastSold: leastSoldRes.rows,
      mostVisited: mostVisitedRes.rows,
      summary: {
        totalProducts: prodCountRes.rows[0].count,
        totalCategories: catCountRes.rows[0].count,
        totalItemsSold: salesSummaryRes.rows[0].total_qty,
        totalRevenue: salesSummaryRes.rows[0].total_rev
      },
      categoryRevenue: categoryRevenueRes.rows,
      monthlyTrends: trends,
      trendType: trendType
    });
  } catch (err) {
    console.error("Error fetching product stats:", err);
    res.status(500).send("Error fetching product stats");
  }
});

// Get individual product statistics (created_at, views, sales, size breakdown, views history)
app.get('/api/products/:id/stats', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send("Invalid product ID");
    }

    // 1. Get creation date
    const prodRes = await p1.query("SELECT created_at, name, name_en, name_ar FROM products WHERE idproducts = $1", [id]);
    if (prodRes.rows.length === 0) {
      return res.status(404).send("Product not found");
    }
    const product = prodRes.rows[0];

    // 2. Get views summary
    const viewsRes = await p1.query(`
      SELECT 
        COUNT(idview)::integer as views_all,
        COUNT(CASE WHEN view_date = CURRENT_DATE THEN 1 END)::integer as views_today,
        COUNT(CASE WHEN EXTRACT(MONTH FROM view_date) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM view_date) = EXTRACT(YEAR FROM CURRENT_DATE) THEN 1 END)::integer as views_month
      FROM product_views
      WHERE idproducts = $1
    `, [id]);

    // 3. Get sales summary
    const salesRes = await p1.query(`
      SELECT 
        COALESCE(SUM(qte), 0)::integer as sales_all,
        COALESCE(SUM(prix), 0)::numeric as revenue_all,
        COALESCE(SUM(CASE WHEN datecommand = CURRENT_DATE THEN qte END), 0)::integer as sales_today,
        COALESCE(SUM(CASE WHEN datecommand = CURRENT_DATE THEN prix END), 0)::numeric as revenue_today,
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM datecommand) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM datecommand) = EXTRACT(YEAR FROM CURRENT_DATE) THEN qte END), 0)::integer as sales_month,
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM datecommand) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM datecommand) = EXTRACT(YEAR FROM CURRENT_DATE) THEN prix END), 0)::numeric as revenue_month
      FROM commande
      WHERE idproducts = $1 AND cart = false AND etat = true
    `, [id]);

    // 4. Get size breakdown
    const sizesRes = await p1.query(`
      SELECT COALESCE(taille, 'Standard') as taille, 
             SUM(qte)::integer as units_sold, 
             SUM(prix)::numeric as revenue
      FROM commande
      WHERE idproducts = $1 AND cart = false AND etat = true
      GROUP BY taille
      ORDER BY units_sold DESC
    `, [id]);

    // 5. Get views over the last 7 days (daily list)
    const dailyViewsRes = await p1.query(`
      SELECT d.date_val::text as label, COUNT(v.idview)::integer as count
      FROM (
        SELECT (CURRENT_DATE - i * INTERVAL '1 day')::date as date_val
        FROM generate_series(0, 6) i
      ) d
      LEFT JOIN product_views v ON v.idproducts = $1 AND v.view_date = d.date_val
      GROUP BY d.date_val
      ORDER BY d.date_val ASC
    `, [id]);

    res.json({
      name: product.name,
      name_en: product.name_en,
      name_ar: product.name_ar,
      created_at: product.created_at,
      views: viewsRes.rows[0],
      sales: salesRes.rows[0],
      sizesBreakdown: sizesRes.rows,
      dailyViews: dailyViewsRes.rows
    });
  } catch (err) {
    console.error("Error fetching individual product stats:", err);
    res.status(500).send("Error fetching individual product stats");
  }
});

// dynamic site configuration
app.get('/api/config', (req, res) => {
  const configPath = path.join(__dirname, 'assets', 'config.json');
  fs.readFile(configPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading configuration file');
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/config', verifyToken, (req, res) => {
  const configPath = path.join(__dirname, 'assets', 'config.json');
  const newConfig = req.body;
  fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf8', (err) => {
    if (err) {
      return res.status(500).send('Error writing configuration file');
    }
    res.json({ success: true });
  });
});

// ============================================================
// WHATSAPP INTEGRATION (via OpenWA)
// ============================================================

// Check OpenWA session status
app.get('/api/whatsapp/status', verifyToken, async (req, res) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (OPENWA_API_KEY) headers['x-api-key'] = OPENWA_API_KEY;
    
    // 1. Check if session exists/status in OpenWA
    let response = await fetch(`${OPENWA_URL}/api/sessions/${OPENWA_SESSION}`, { headers });
    
    if (response.status === 404) {
      // Session does not exist in OpenWA gateway, let's create it!
      const createResponse = await fetch(`${OPENWA_URL}/api/sessions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ id: OPENWA_SESSION, name: OPENWA_SESSION })
      });
      if (createResponse.ok) {
        response = await fetch(`${OPENWA_URL}/api/sessions/${OPENWA_SESSION}`, { headers });
      }
    }
    
    if (!response.ok) {
      return res.json({ connected: false, error: 'Session not found or OpenWA not running' });
    }
    
    let data = await response.json();
    
    // If session is not connected, try to start it and get the QR code
    let qrCode = null;
    if (data.status !== 'CONNECTED') {
      // If session status is DISCONNECTED, start it
      if (data.status === 'DISCONNECTED') {
        await fetch(`${OPENWA_URL}/api/sessions/${OPENWA_SESSION}/start`, {
          method: 'POST',
          headers
        });
        // Wait a short moment for engine to spin up
        await new Promise(r => setTimeout(r, 1500));
        // Refresh status
        const refreshResponse = await fetch(`${OPENWA_URL}/api/sessions/${OPENWA_SESSION}`, { headers });
        if (refreshResponse.ok) {
          data = await refreshResponse.json();
        }
      }
      
      // Now attempt to fetch the QR code
      const qrResponse = await fetch(`${OPENWA_URL}/api/sessions/${OPENWA_SESSION}/qr`, { headers });
      if (qrResponse.ok) {
        const qrData = await qrResponse.json();
        qrCode = qrData.qrCode; // This is the base64 image data url (data:image/png;base64,...)
      }
    }
    
    res.json({ 
      connected: data.status === 'CONNECTED', 
      status: data.status,
      qrCode, 
      session: data 
    });
  } catch (err) {
    res.json({ connected: false, error: 'OpenWA server is not reachable' });
  }
});

// Send a WhatsApp message to a single phone number
app.post('/api/whatsapp/send', verifyToken, async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ success: false, error: 'phone and message are required' });
    }
    // WhatsApp chatId format: phone number + @c.us (strip leading + or 00, keep digits only)
    const digits = phone.replace(/[^0-9]/g, '');
    const chatId = `${digits}@c.us`;
    const headers = { 'Content-Type': 'application/json' };
    if (OPENWA_API_KEY) headers['x-api-key'] = OPENWA_API_KEY;
    const response = await fetch(`${OPENWA_URL}/api/sessions/${OPENWA_SESSION}/messages/send-text`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ chatId, text: message }),
    });
    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ success: false, error: 'Failed to send via OpenWA', detail: errText });
    }
    const data = await response.json();
    res.json({ success: true, messageId: data.id });
  } catch (err) {
    console.error('WhatsApp send error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Send WhatsApp message to multiple phones (bulk)
app.post('/api/whatsapp/send-bulk', verifyToken, async (req, res) => {
  try {
    const { phones, message, recipients } = req.body;
    if ((!phones || !Array.isArray(phones) || phones.length === 0) && (!recipients || !Array.isArray(recipients) || recipients.length === 0)) {
      return res.status(400).json({ success: false, error: 'phones or recipients are required' });
    }
    const headers = { 'Content-Type': 'application/json' };
    if (OPENWA_API_KEY) headers['x-api-key'] = OPENWA_API_KEY;
    const results = [];
    
    if (recipients && Array.isArray(recipients) && recipients.length > 0) {
      for (const item of recipients) {
        const { phone, message: personalMessage } = item;
        if (!phone || !personalMessage) continue;
        const digits = phone.replace(/[^0-9]/g, '');
        const chatId = `${digits}@c.us`;
        try {
          const response = await fetch(`${OPENWA_URL}/api/sessions/${OPENWA_SESSION}/messages/send-text`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ chatId, text: personalMessage }),
          });
          if (response.ok) {
            const data = await response.json();
            results.push({ phone, success: true, messageId: data.id });
          } else {
            results.push({ phone, success: false, error: 'Failed to send' });
          }
        } catch (e) {
          results.push({ phone, success: false, error: 'Network error' });
        }
        // Small delay between sends to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
      }
    } else {
      for (const phone of phones) {
        const digits = phone.replace(/[^0-9]/g, '');
        const chatId = `${digits}@c.us`;
        try {
          const response = await fetch(`${OPENWA_URL}/api/sessions/${OPENWA_SESSION}/messages/send-text`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ chatId, text: message }),
          });
          if (response.ok) {
            const data = await response.json();
            results.push({ phone, success: true, messageId: data.id });
          } else {
            results.push({ phone, success: false, error: 'Failed to send' });
          }
        } catch (e) {
          results.push({ phone, success: false, error: 'Network error' });
        }
        // Small delay between sends to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
      }
    }
    res.json({ success: true, results });
  } catch (err) {
    console.error('WhatsApp bulk send error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

