//    "content": [
//        {
//            "id": 1,
//            "codigoLote": "1",
//            "productoNombre": "Queso cremoso",
//            "marcaNombre": "Tonutti",
//            "fechaVencimiento": "2027-02-13",
//            "fechaElaboracion": "2026-02-13",
//            "mensajeHitachiDescripcion": "Msj Queso Cremoso",
//            "etiquetaCajaDescripcion": "Etiqueta Pallet Queso cremoso",
//            "etiquetaPalletDescripcion": null,
//            "productosPorCaja": 10,
//            "cajasPorPallet": 5,
//            "imprimeMensajeHitachi": true,
//            "imprimeEtiquetaCaja": true,
//            "imprimeEtiquetaPallet": false,
//            "utilizaBalanza": true,
//            "pesoNetoProcesado": 0.0,
//            "cantidadProductosProcesados": 0
//        },
//        {
//            "id": 2,
//            "codigoLote": "2",
//            "productoNombre": "Queso cremoso",
//            "marcaNombre": "Tonutti",
//            "fechaVencimiento": "2027-02-13",
//            "fechaElaboracion": "2026-02-13",
//            "mensajeHitachiDescripcion": "Msj Queso Cremoso",
//            "etiquetaCajaDescripcion": "Etiqueta Caja Queso cremoso",
//            "etiquetaPalletDescripcion": null,
//            "productosPorCaja": 1,
//            "cajasPorPallet": 1,
//            "imprimeMensajeHitachi": true,
//            "imprimeEtiquetaCaja": true,
//            "imprimeEtiquetaPallet": false,
//            "utilizaBalanza": true,
//            "pesoNetoProcesado": 0.0,
//            "cantidadProductosProcesados": 0
//        }
//    ]
let paginaActual;

async function getReporteLotes(pagina, cantidadItems){


    let url = "/api/reportes/lotes?page="+(pagina)+"&size="+cantidadItems
    let filtros = armarStringFiltros();
    const resp = await fetch(url + filtros);

    if (!resp.ok) {
        throw new Error("Error cargando reporte de lotes");
    }

    paginaActual = await resp.json();
}

async function renderTabla(pagina, cantidadItems){

    await getReporteLotes(pagina, cantidadItems);

    const filas = document.getElementById("registrosTabla")

    filas.innerHTML=""

    paginaActual.content.forEach(d=>{

        filas.innerHTML += `
        <tr>
        <td>${d.codigoLote}</td>
        <td>${d.productoNombre}</td>
        <td>${d.marcaNombre}</td>
        <td>${d.fechaElaboracion}</td>
        <td>${d.fechaVencimiento}</td>
        <td>${d.cantidadProductosProcesados}</td>
        <td>${(d.cantidadProductosProcesados / d.productosPorCaja)}</td>
        <td>${(d.cantidadProductosProcesados / (d.productosPorCaja * d.cajasPorPallet))}</td>
        <td>${d.pesoNetoProcesado}</td>
        </tr>
        `
    })

    document.getElementById("pagina").innerText =
    `Página ${paginaActual.pageable.pageNumber + 1} de ${paginaActual.totalPages}`
}

function anterior(){
    const numeroPagina = paginaActual.pageable.pageNumber

    if(numeroPagina >0){
        renderTabla((numeroPagina - 1), document.getElementById("itemsPorPagina").value)
    }
}

function siguiente(){
    const numeroPagina = paginaActual.pageable.pageNumber

    if(paginaActual.last === false){
        renderTabla((numeroPagina + 1), document.getElementById("itemsPorPagina").value)
    }
}

function armarStringFiltros(){
    const codigoLote = document.getElementById("codigoLote").value;
    const fechaElaboracionDesde = document.getElementById("fechaElaboracionDesde").value;
    const fechaElaboracionHasta = document.getElementById("fechaElaboracionHasta").value;

    if(codigoLote || fechaElaboracionDesde || fechaElaboracionHasta){
        let filtro = "&filter="
        if(codigoLote){
            filtro += `codigoLote=${codigoLote}`
        }
        if(fechaElaboracionDesde){
            filtro += `fechaElaboracion>=${fechaElaboracionDesde}`
        }
        if(fechaElaboracionHasta){
            filtro += `fechaElaboracion<=${fechaElaboracionHasta}`
        }
        console.log("Filtros aplicados: " + filtro)
        return filtro
    }
    else
        return ""
}

function cambiarCantidadItems(){
    itemsPorPagina = parseInt(document.getElementById("itemsPorPagina").value)

    renderTabla(0, itemsPorPagina)
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

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("itemsPorPagina").addEventListener("change", cambiarCantidadItems);
    document.getElementById("anterior").addEventListener("click", anterior);
    document.getElementById("siguiente").addEventListener("click", siguiente);
    document.getElementById("filtrar").addEventListener("click", () => renderTabla(0 , document.getElementById("itemsPorPagina").value));
    //document.getElementById("exportarExcel").addEventListener("click", exportarExcel);
    renderTabla(0 , document.getElementById("itemsPorPagina").value);
});