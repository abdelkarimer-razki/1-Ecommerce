const Pool=require("pg").Pool;
const p1=new Pool({
    user:"postgres",
    password:"postgres",
    database:"coop_babmansour",
    host:"localhost",
    port:5432
});
module.exports=p1;
