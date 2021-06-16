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
    const query=await p1.query("SELECT * FROM public.commande WHERE EXTRACT(MONTH FROM datecommand)=EXTRACT(MONTH FROM now())");
    res.json(query.rows);
})


app.get('/visits',verifyToken,async(req,res)=>{
  res.json(i);
})


app.get('/revenu',verifyToken,async(req,res)=>{
  const query=await p1.query("SELECT sum(prix) FROM public.commande WHERE (etat=true)and(EXTRACT(MONTH FROM datecommand)=EXTRACT(MONTH FROM now()))");
  res.json(parseInt(query.rows[0].sum));
})

app.get('/users',verifyToken,async(req,res)=>{
  const query=await p1.query("SELECT * FROM public.users");
  res.json(query.rowCount);
})
app.get('/revenu/:mois',verifyToken,async(req,res)=>{
  const {mois}=req.params;
  const query=await p1.query("SELECT SUM(prix) from public.commande where (EXTRACT(YEAR FROM datecommand)=EXTRACT(YEAR FROM now())) and (etat=true) and (EXTRACT(MONTH FROM datecommand)=$1)",[mois]);
  res.json(parseInt(query.rows[0].sum));
})


app.get('/commandnonEffectuer',async(req,res)=>{
  const query=await p1.query("SELECT u.lname,u.fname,u.adress,u.tel,p.name,u.email,c.qte,to_char(c.datecommand, 'DD/MM/YYYY'),c.verifie,c.etat FROM public.users u join public.commande c on u.iduser=c.iduser join public.products p on c.idproducts=p.idproducts where c.etat=false ORDER BY u.lname");
  res.json(query.rows);
})

app.get('/:categorie',async(req,res)=>{
  const {categorie}=req.params;
  const query=await p1.query("SELECT * FROM products WHERE categorie=$1 ORDER BY RANDOM()",[categorie]);
  res.json(query.rows);
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

//login authentification
 app.get('/login/:mail&:password',async(req,res)=>{
   const email= req.params.mail;
   const password=req.params.password;
   const query=await p1.query("SELECT * FROM users WHERE email=$1 AND password=$2",[email,password]);
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

 /*app.post('/registre',async(req,res)=>{
   const fname=
 })*/
