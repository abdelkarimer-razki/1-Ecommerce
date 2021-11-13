const express=require("express");
var cors = require('cors')
const jwt=require('jsonwebtoken');
const path = require("path");
const p1=require('./app/backend/db');
const app=express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
/*var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));*/
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

var i=0;
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');

app.use(cors());
app.use(express.json());
app.listen(500);


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
  const query=await p1.query("SELECT * FROM products ORDER BY RANDOM()");
  res.json(query.rows);
})
app.get('/dashboard',verifyToken,async(req,res)=>{
    const query=await p1.query("SELECT * FROM public.commande WHERE cart=false and EXTRACT(MONTH FROM datecommand)=EXTRACT(MONTH FROM now())");
    res.json(query.rows);
})
app.get('/productshow',async(req,res)=>{
  const query=await p1.query("SELECT * FROM products ORDER BY idproducts");
  res.json(query.rows);
})

app.get('/visits',verifyToken,async(req,res)=>{
  res.json(i);
})


app.get('/revenu',/*verifyToken,*/async(req,res)=>{
  const query=await p1.query("SELECT sum(prix) FROM public.commande WHERE cart=false and (etat=true)and(EXTRACT(MONTH FROM datecommand)=EXTRACT(MONTH FROM now()))");
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
  const query=await p1.query("SELECT SUM(prix) from public.commande where cart=false and (EXTRACT(YEAR FROM datecommand)=EXTRACT(YEAR FROM now())) and (etat=true) and (EXTRACT(MONTH FROM datecommand)=$1)",[mois]);
  res.json(parseInt(query.rows[0].sum));
})

//update product
app.post('/p12',verifyToken,async(req,res)=>{
  const id=req.body.idproducts;
  const name=req.body.name;
  const taille1=req.body.taille;
  const taille2=req.body.taille2;
  const taille3=req.body.taille3;
  const prix1=req.body.prix;
  const prix2=req.body.prix2;
  const prix3=req.body.prix3;
  const prixf=req.body.prixf;
  const desc=req.body.description;
  const cat=req.body.categorie;
  const mange=req.body.mangable;
  const pic=req.body.picture
  const query=await p1.query("UPDATE products SET name=$1,description=$2,categorie=$3,mangable=$4,prixf=$5,taille=$6,taille2=$7,taille3=$8,prix=$9,prix2=$10,prix3=$11,picture=$13 WHERE idproducts=$12 ",[name,desc,cat,mange,prixf,taille1,taille2,taille3,prix1,prix2,prix3,id,pic]);
  res.json(query.rows);
})
//add product
app.post('/addpro',verifyToken,async(req,res)=>
{
  const name=req.body.name;
  const taille1=req.body.taille;
  const taille2=req.body.taille2;
  const taille3=req.body.taille3;
  const prix1=req.body.prix;
  const prix2=req.body.prix2;
  const prix3=req.body.prix3;
  const prixf=req.body.prixf;
  const desc=req.body.description;
  const pic = req.body.picture;
  const cat=req.body.categorie;
  const mange=req.body.mangable;
  const query=await p1.query("INSERT INTO products (name,picture,description,prix,categorie,mangable,prixf,prix3,taille,taille2,taille3,prix2) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",[name,pic,desc,prix1,cat,mange,prixf,prix3,taille1,taille2,taille3,prix2]);
  res.json(query.rows);
})

app.get('/commandnonEffectuer',verifyToken,async(req,res)=>{
  const query=await p1.query("SELECT u.lname||' '||u.fname as fullname,p.idproducts,u.iduser,c.idcommande,c.cart,u.adress,u.tel,p.name,u.email,c.qte,to_char(c.datecommand, 'DD/MM/YYYY'),c.verifie,c.prix,c.taille,c.etat FROM public.users u join public.commande c on u.iduser=c.iduser join public.products p on c.idproducts=p.idproducts where c.etat=false and c.cart=false ORDER BY c.idcommande");
  res.json(query.rows);
})

app.get('/commandEffectuer',verifyToken,async(req,res)=>{
  const query=await p1.query("SELECT u.lname||' '||u.fname as fullname,c.idcommande,c.cart,u.adress,u.tel,p.name,u.email,c.qte,to_char(c.datecommand, 'DD/MM/YYYY'),c.verifie,c.taille,c.prix,c.etat FROM public.users u join public.commande c on u.iduser=c.iduser join public.products p on c.idproducts=p.idproducts where c.etat=true and datecommand=current_date and c.cart=false ORDER BY c.idcommande");
  res.json(query.rows);
})

//searchCommand effectuer

app.get('/commandEffectuer/:date',async(req,res)=>{
  const {date}=req.params;
  const query=await p1.query("SELECT u.lname||' '||u.fname as fullname,p.idproducts,c.idcommande,c.cart,u.iduser,u.adress,u.tel,p.name,u.email,c.qte,to_char(c.datecommand, 'DD/MM/YYYY'),c.verifie,c.taille,c.prix,c.etat FROM public.users u join public.commande c on u.iduser=c.iduser join public.products p on c.idproducts=p.idproducts where c.etat=true and datecommand=$1 and c.cart=false ORDER BY c.idcommande",[date]);
  res.json(query.rows);
})

app.get('/:categorie',async(req,res)=>{
  const {categorie}=req.params;
  const query=await p1.query("SELECT * FROM products WHERE categorie=$1 ORDER BY RANDOM()",[categorie]);
  res.json(1);
})

app.get('/seachC/:categorie',async(req,res)=>{
  const {categorie}=req.params;
  const query=await p1.query("SELECT * FROM products WHERE categorie=$1 ORDER BY RANDOM()",[categorie]);
  res.json(query.rows);
})

app.get('/mange/:mangable',async(req,res)=>{
  const {mangable}=req.params;
  const query=await p1.query("SELECT * FROM products WHERE mangable=$1 ORDER BY RANDOM()",[mangable]);
  res.json(query.rows);
})


app.get('/buyProduct/:id',async(req,res)=>{
  const {id}=req.params;
  const query=await p1.query("SELECT * FROM products WHERE idproducts=$1 ORDER BY RANDOM()",[id]);
  res.json(query.rows);
})
//verifier la commande dashboard

app.put('/v/:id',async(req,res)=>{
  const {id}=req.params;
    const query=await p1.query("UPDATE commande SET verifie=false WHERE idcommande=$1 ",[id]);
  res.json(query.rows);
})

app.put('/v1/:id',async(req,res)=>{
  const {id}=req.params;
  const query=await p1.query("UPDATE commande SET verifie=true WHERE idcommande=$1 ",[id]);
  res.json(query.rows);
})

//effectuer la commande

app.put("/effectue/:id",verifyToken,async(req,res)=>{
  const {id}=req.params;
  const query=await p1.query("UPDATE commande set etat=true WHERE idcommande=$1",[id]);
  res.json(query.rows);
})

app.put("/effectue1/:id",verifyToken,async(req,res)=>{
  const {id}=req.params;
  const query=await p1.query("UPDATE commande set etat=false WHERE idcommande=$1",[id]);
  res.json(query.rows);
})

//modifier command

app.get("/commandeChange/:qte&:idcom&:id",verifyToken,async(req,res)=>{
  console.log("hey")
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

   /*if(query.rowCount<1){
     console.log("error");
   }else{
    res.json(query.rows);
   }*/
   /*let payload={subject:query.rows[0].iduser};
   let token=jwt.sign(payload,'secretkey');*/
   /*res.json(query.rows);*/
   /*res.send({token})*/

 })
 //buy products
app.get('/acheterorcart/:idproducts&:iduser&:qte&:prix&:cart&:taille',async(req,res)=>
{
  const idproducts = req.params.idproducts;
  const iduser = req.params.iduser;
  const qte = req.params.qte;
  const prix = req.params.prix;
  const taille = req.params.taille;
  const cart = req.params.cart
  const query = await p1.query("INSERT INTO commande (idproducts,iduser,qte,prix,datecommand,cart,taille) VALUES ($1,$2,$3,$4,NOW()::date,$5,$6)",[idproducts,iduser,qte,prix,cart,taille]);
  res.json(query.rows);
}
)
//notification counter
app.get('/cartcount/:id',async(req,res)=>
{
  const id=req.params.id;
  const query = await p1.query("SELECT COUNT(*) FROM commande WHERE iduser=$1 and cart=true",[id]);
  res.json(query.rows);
})
//cart check
app.get('/checkcart/:iduser&:idproduit',async(req,res)=>
{
  const iduser=req.params.iduser;
  const idproduit=req.params.idproduit;
  const query = await p1.query("SELECT COUNT(*) FROM commande WHERE (iduser=$1 and idproducts=$2 and cart=true)",[iduser,idproduit]);
  res.json(query.rows);
})
//cart commands
app.get('/allcart/:iduser&:cart',async(req,res)=>
{
  /*const iduser=req.params.iduser;
  const query = await p1.query("SELECT * FROM commande WHERE iduser=$1 and cart=true",[iduser]);
  res.json(query.rows);*/
  const iduser=req.params.iduser;
  const cart=req.params.cart;
  const query = await p1.query("SELECT c.idcommande,c.prix,c.qte,p.name,p.picture,c.taille as taille1,p.taille,p.taille2,p.taille3,p.prix as prix1,prix2,prix3 FROM commande c join products p on c.idproducts=p.idproducts WHERE iduser=$1 and cart=$2 and etat=false",[iduser,cart]);
  res.json(query.rows);
})
//delete commande
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
//upade commande
app.get('/updatecommande/:id&:taille&:qte&:cart&:prix',async(req,res)=>
{
  const id=req.params.id;
  const taille=req.params.taille;
  const qte=req.params.qte;
  const cart=req.params.cart;
  const prix=req.params.prix;
  const query = await p1.query("UPDATE commande SET taille=$1,qte=$2,cart=$3,prix=$5 WHERE idcommande=$4",[taille,qte,cart,id,prix]);
  res.json(query.rows);
})
//from cart to achat
app.get('/cartotachat/:idcommande',async(req,res)=>
{
  const id=req.params.idcommande;
  const query=await p1.query("UPDATE commande SET cart=false WHERE idcommande=$1",[id]);
  res.json(query.rows);
})
//registre acc
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
 /*app.post('/registre',async(req,res)=>{
   const fname=
 })*/
