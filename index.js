const express=require('express');
const app=express();
const cors = require('cors')

app.use(cors())
app.use(express.json())

const { obtenerJoyas, filtrosJoyas,prepararHATEOAS } = require('./consultas')

app.get('/joyas',async (req,res) =>{
  try {
    let joyas = await obtenerJoyas(req.query);
    const HATEOAS= await prepararHATEOAS(joyas)
    res.json(HATEOAS);
  } catch (error) {
    res.send(error.message);
  }
})

app.get('/joyas/filtros',async (req,res)=>{
  try {
    const joyas=await filtrosJoyas(req.query)

    res.json(joyas)
  } catch (error) {
    res.send(error.message);
  }
})

app.get('*',(req,res)=>{
  res.status(404).send('Esta ruta no existe')
})

app.listen(3000, console.log('Servidor encendido'));