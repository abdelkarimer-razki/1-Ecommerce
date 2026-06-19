const express=require("express");
var cors = require('cors')
const jwt=require('jsonwebtoken');
const path = require("path");
const fs = require('fs');
const p1=require('./app/backend/db');
const app=express();

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

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

var i=0;
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');

app.use(cors());
app.use(express.json());
app.listen(5000);


function verifyToken(req, res, next) {
  if(!req.headers.authorization) {
    return res.status(401).send('Unauthorized request')
  }
  var K2hM$4PAWCeFV8 = req.headers.authorization.split(' ')[1];
  if(K2hM$4PAWCeFV8 === 'null') {
    return res.status(401).send('Unauthorized request')
  }
  let payload = jwt.verify(K2hM$4PAWCeFV8, 'wJ%Y24fH9UtVzYO')
  if(!payload) {
    return res.status(401).send('Unauthorized request')
  }
  next()
}
function verifyToken2(req, res, next) {
  if(req.headers.authorization) {
    var K2hM$4PAWCeFV8 = req.headers.authorization.split(' ')[1];
    if(K2hM$4PAWCeFV8 === 'null') {
      return res.status(401).send('Unauthorized request')
    }
    let payload = jwt.verify(K2hM$4PAWCeFV8, 'wJ%Y24fH9UtVzYO')
    if(!payload) {
      return res.status(401).send('Unauthorized request')
    }
  }
  next()
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
  const query=await p1.query("SELECT SUM(prix_total) from public.order_group where (EXTRACT(YEAR FROM datecommand)=EXTRACT(YEAR FROM now())) and (etat=true) and (EXTRACT(MONTH FROM datecommand)=$1)",[mois]);
  res.json(parseInt(query.rows[0].sum));
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

  const query = await p1.query(
    "UPDATE products SET name=$1,description=$2,categorie=$3,mangable=$4,prixf=$5,picture=$7 WHERE idproducts=$6",
    [name,desc,cat,mange,prixf,id,pic]
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

  const query = await p1.query(
    "INSERT INTO products (name,picture,description,categorie,mangable,prixf) VALUES ($1,$2,$3,$4,$5,$6) RETURNING idproducts",
    [name,pic,desc,cat,mange,prixf]
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

// Verify order group
app.put('/v/:id',async(req,res)=>{
  const {id}=req.params;
  await p1.query("UPDATE order_group SET verifie=false WHERE idgroup=$1",[id]);
  res.json({success:true});
})

app.put('/v1/:id',async(req,res)=>{
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
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
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
    const query = await p1.query("SELECT DISTINCT categorie FROM products WHERE categorie IS NOT NULL AND categorie != 'null' AND categorie != ''");
    res.json(query.rows.map(r => r.categorie));
  } catch (err) {
    res.status(500).json([]);
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
app.post('/login',async(req,res)=>{
   const email= req.body.email;
   const password=req.body.password;
   const query=await p1.query("SELECT * FROM users WHERE (email=$1 OR tel=$1) AND password=$2",[email,password]);
   if(query.rows.length<1){
    return res.status(401).send('Unauthorized request')
   }else{
    let payload={userId:query.rows[0].iduser};
    let K2hM$4PAWCeFV8=jwt.sign(payload,'wJ%Y24fH9UtVzYO');
    res.status(200).send({K2hM$4PAWCeFV8,"iduser":query.rows[0].iduser,"name":query.rows[0].fname+" "+query.rows[0].lname,"email":query.rows[0].email,"admin":query.rows[0].admin},);
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

//delete commande item
app.get('/deletecommande/:id',async(req,res)=>
{
  const id=req.params.id;
  const query = await p1.query("Delete FROM commande WHERE idcommande=$1",[id]);
  res.json(query.rows);
})

//delete product
app.get('/deletepro/:id',async(req,res)=>
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

//registre
app.post('/registre',async(req,res)=>
{
  const fname=req.body.fname;
  const lname=req.body.lname;
  const email=req.body.email;
  const tel=req.body.tel;
  const password=req.body.password;
  const adress=req.body.adress;
  const query=await p1.query("INSERT INTO users (fname,lname,email,tel,password,adress) VALUES ($1,$2,$3,$4,$5,$6)",[fname,lname,email,tel,password,adress]);
  res.json(query.rows);
})

//test email or tel
app.get('/test/:test',async(req,res)=>
{
  const test=req.params.test;
  const query=await p1.query("SELECT * FROM users WHERE email=$1 OR tel=$1",[test]);
  res.json(query.rows);
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
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
  }
})
app.get('/checkcart/:iduser&:idproduit',async(req,res)=>{
  const {iduser,idproduit}=req.params;
  if (!iduser||iduser==='null'||isNaN(parseInt(iduser))||!idproduit||idproduit==='null'||isNaN(parseInt(idproduit))) return res.json([{count:0}]);
  const query=await p1.query("SELECT COUNT(*) FROM commande WHERE iduser=$1 and idproducts=$2 and cart=true",[iduser,idproduit]);
  res.json(query.rows);
})

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
