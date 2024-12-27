const { Pool }=require('pg');
const format=require('pg-format')
require('dotenv').config()

const pool= new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  allowExitOnIdle:true,
});

const obtenerJoyas = async ({limit=10, order_by='id_ASC', page=1}) =>{
  try {
    const [campo, orden] = order_by.split("_")
    const offset=Math.abs((page-1)*limit)
    const formattedQuery= format('SELECT * FROM inventario order by %s %s LIMIT %s OFFSET %s', campo,orden,limit,offset);
    const {rows:joyas} = await pool.query(formattedQuery);
    return joyas
  } catch (error) {
    throw new Error("Problema al obtener las joyas");
  }
}

const filtrosJoyas=async ({precio_max,precio_min,categoria,metal})=>{
  try {
    let filtros=[];
    const values = []
    const agregarFiltro = (campo, comparador, valor) => {
      values.push(valor)
      const { length } = filtros
      filtros.push(`${campo} ${comparador} $${length + 1}`)
    }

    if (precio_max) agregarFiltro('precio', '<=',precio_max)
    if (precio_min) agregarFiltro('precio', '>=',precio_min)
    if (categoria) agregarFiltro('categoria','=',categoria)
    if (metal) agregarFiltro('metal','=',metal)
    
    let consulta = "SELECT * FROM inventario"

    if (filtros.length > 0) {
      filtros = filtros.join(" AND ")
      consulta += ` WHERE ${filtros}`
    }
    const { rows: joyas } = await pool.query(consulta,values)
    return joyas
  } catch (error) {
    throw new Error("Problema al utilizar filtros");
  }
}

const prepararHATEOAS = (joyas) => {
    const results = joyas.map((m) => {
      return {
        name: m.nombre,
        href: `/joyas/joya/${m.id}`,
      }
    })

    const count = joyas.length
    const HATEOAS = {
      count,
      results
    }
    return HATEOAS
  }

module.exports={obtenerJoyas, filtrosJoyas,prepararHATEOAS}