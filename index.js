require('dotenv').config();
const express=require("express");
const {Sequelize}=require("sequelize");
const bodyParser = require("body-parser");

const app=express();

const db=process.env.PSQL_DB || 'mydb';
const user=process.env.PSQL_DB_USER;
const pass=process.env.PSQL_DB_PASS;
const port = process.env.PORT || 8080;

const sequelize = new Sequelize(db, user, pass,{
    dialect: 'postgres'
});


//app.use(express.json());
app.use(bodyParser.json());
//app.use(bodyParser.raw({inflate:true, type: 'application/json'}));

app.use((err, req, res, next) => {
    //console.log("Body has a payload")
    return res.status(400).send();
    
}); //Debugged using ideas from: https://stackoverflow.com/questions/40142928/how-do-you-reject-an-invalid-json-body-using-express-or-body-parser

app.use((req,res,next)=>{
    if(!req.is('application/json')&&JSON.stringify(req.body) === '{}'){
        req.body=null;
        //console.log("from here");
    }
    next();
})


app.get('/healthz', async (req,res)=>{
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    try {
        await sequelize.authenticate();
     
        if(req.body){  //true if it exists 
            //console.log("BAD REQUEST: payload exists");
            res.status(400).end();
            
        }
        else{   //no payload
            res.status(200).json().send();
        //console.log("Success - no payload");
        }
        
  
      } catch (error) {
        res.status(503).json().send();  
        //console.error("Failed:", error);
      }
});

app.all('*', (req,res)=>{ //other methods
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate;');
    res.status(405).json().send();
});

app.listen(port,()=>{
    console.log(`Running on ${port}`);
});