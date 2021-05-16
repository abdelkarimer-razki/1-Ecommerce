const express=require("express");
var cors = require('cors')
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

app.get('/',async(req,res)=>{
  const query=await p1.query("SELECT * FROM products");
  res.json(query.rows);
})

app.get('/:categorie',async(req,res)=>{
  const {categorie}=req.params;
  const query=await p1.query("SELECT * FROM products WHERE categorie=$1",[categorie]);
  res.json(query.rows);
})

app.get('/seachC/:categorie',async(req,res)=>{
  const {categorie}=req.params;
  const query=await p1.query("SELECT * FROM products WHERE categorie=$1",[categorie]);
  res.json(query.rows);
})

app.get('/mange/:mangable',async(req,res)=>{
  const {mangable}=req.params;
  const query=await p1.query("SELECT * FROM products WHERE mangable=$1",[mangable]);
  res.json(query.rows);
})
