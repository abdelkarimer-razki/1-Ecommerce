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

app.get('/',async(req,res)=>{
  const query=await p1.query("SELECT * FROM products ORDER BY RANDOM()");
  res.json(query.rows);
})

app.get('/dashboard',verifyToken,async(req,res)=>{
    const query=await p1.query("SELECT * FROM public.commande");
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
    res.status(200).send({K2hM$4PAWCeFV8,"iduser":query.rows[0].iduser,"name":query.rows[0].fname+" "+query.rows[0].lname,"email":query.rows[0].email},);
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
