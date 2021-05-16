const Pool=require("pg").Pool;
const p1=new Pool({
    user:"postgres",
    password:"KARIMKARIM1",
    database:"postgres",
    host:"localhost",
    port:5432
});
module.exports=p1;
