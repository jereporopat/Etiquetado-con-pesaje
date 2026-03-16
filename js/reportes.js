const datos = [
{
lote:"2541",
producto:"Cable A",
marca:"Hitachi",
elaboracion:"10/03/2026",
vencimiento:"10/03/2027",
productos:1200,
cajas:60,
pallets:3
},
{
lote:"2542",
producto:"Cable B",
marca:"Hitachi",
elaboracion:"11/03/2026",
vencimiento:"11/03/2027",
productos:900,
cajas:45,
pallets:2
}
]

let paginaActual = 1
let porPagina = 10
let datosFiltrados = [...datos]

function renderTabla(){

const inicio = (paginaActual-1)*porPagina
const fin = inicio + porPagina

const paginaDatos = datosFiltrados.slice(inicio,fin)

const body = document.getElementById("tablaBody")
body.innerHTML=""

paginaDatos.forEach(d=>{

body.innerHTML += `
<tr>
<td>${d.lote}</td>
<td>${d.producto}</td>
<td>${d.marca}</td>
<td>${d.elaboracion}</td>
<td>${d.vencimiento}</td>
<td>${d.productos}</td>
<td>${d.cajas}</td>
<td>${d.pallets}</td>
</tr>
`
})

document.getElementById("pagina").innerText =
`Página ${paginaActual} de ${Math.ceil(datosFiltrados.length/porPagina)}`
}

function anterior(){

if(paginaActual>1){
paginaActual--
renderTabla()
}

}

function siguiente(){

if(paginaActual < Math.ceil(datosFiltrados.length/porPagina)){
paginaActual++
renderTabla()
}

}

function filtrar(){

const lote = document.getElementById("buscarLote").value

datosFiltrados = datos.filter(d=> d.lote.includes(lote))

paginaActual = 1
renderTabla()

}

function cambiarItems(){

porPagina = parseInt(document.getElementById("itemsPagina").value)

paginaActual = 1

renderTabla()

}

function exportarExcel(){

let csv="Lote,Producto,Marca,Elaboracion,Vencimiento,Productos,Cajas,Pallets\n"

datosFiltrados.forEach(d=>{
csv += `${d.lote},${d.producto},${d.marca},${d.elaboracion},${d.vencimiento},${d.productos},${d.cajas},${d.pallets}\n`
})

const blob = new Blob([csv],{type:"text/csv"})
const url = window.URL.createObjectURL(blob)

const a = document.createElement("a")
a.href = url
a.download = "reporte_produccion.csv"
a.click()

}

renderTabla()