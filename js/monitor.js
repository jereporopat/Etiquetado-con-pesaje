import { cargarSelect } from "./utils.js";

function toggleMenu() {
    document.getElementById("sideMenu").classList.toggle("open");
}
async function refresh() {
    // Estado
    const estado = await (await fetch("/api/tibbo/status")).text();
    document.getElementById("estado").innerText = estado;

    // Telemetría (formulario)
    try {
        const teleRaw = await (await fetch("/api/tibbo/telemetria")).text();
        const tele = JSON.parse(teleRaw);

        console.log(tele);

        // Actualiza los campos
        document.getElementById("pesoGrande").textContent = tele.pesajeEstable ?? "---";
        document.getElementById("ultimoPesaje").value = tele.ultimoPesaje ?? "-";
        document.getElementById("velocidadDeCinta").value = tele.velocidadDeCinta ?? "-";
        document.getElementById("productosPorMinuto").value = tele.productosPorMinuto ?? "-";

    } catch (e) {
        console.error("Telemetría inválida:", e);

        document.getElementById("estado").innerText = "Error en lectura de telemetría";

        // reinicia campos para que no quede sucia la UI
        document.getElementById("pesoGrande").textContent = "---";
        document.getElementById("ultimoPesaje").value = "-";
        document.getElementById("velocidadDeCinta").value = "-";
        document.getElementById("productosPorMinuto").value = "-";

    }
}

async function command(cmd) {
    return fetch("/api/tibbo/command?cmd=" + cmd, { method: "POST" });
}

async function iniciarLote() {
    try {
        const idLote = await nuevoLote();

        const loteActivoResp = await fetch(
            "/api/panel/lote-activo?lote=" + idLote,
            { method: "POST" }
        );

        if (!loteActivoResp.ok) {
            throw new Error("Backend rechazó el lote");
        }

        const cmdResp = await command("START");

        if (cmdResp && !cmdResp.ok) {
            throw new Error("No se pudo iniciar el equipo");
        }

        const loteActivo = await loteActivoResp.json();

        cargarLoteEnUI(loteActivo);
        bloquearFormularioLote(true);

    } catch (e) {
        console.error("Fallo al iniciar lote:", e.message);
        alert("No se pudo iniciar el lote: " + e.message);
    }
}

async function finalizarLote() {
    try {
        const cmdResp = await command("STOP");

        if (cmdResp && !cmdResp.ok) {
            throw new Error("No se pudo detener el equipo");
        }

        const loteFinalizadoResp = await fetch(
            "/api/panel/finalizar-lote",
            { method: "POST" }
        );

        if (!loteFinalizadoResp.ok) {
            throw new Error("Backend rechazó la finalización del lote");
        }

        cargarLoteEnUI();
        bloquearFormularioLote(false);
        document.getElementById("btnStart").disabled = false;

    } catch (e) {
        console.error("Fallo al finalizar lote:", e.message);
        alert("No se pudo finalizar el lote: " + e.message);
    }
}

function buildLotePayload() {
    const imprimeMensajeHitachi = document.getElementById("imprimeMensajeHitachi").checked;
    const imprimeEtiquetaCaja = document.getElementById("imprimeEtiquetaCaja").checked;
    const imprimeEtiquetaPallet = document.getElementById("imprimeEtiquetaPallet").checked;


    return {
        codigoLote : document.getElementById("codigoLote").value,
        productoId: Number(document.getElementById("productoId").value),
        marcaId: Number(document.getElementById("marcaId").value),

        fechaVencimiento: document.getElementById("vencimiento").value,
        fechaElaboracion: document.getElementById("fecha").value,

        productosPorCaja: Number(document.getElementById("productosPorCaja").value),
        cajasPorPallet: Number(document.getElementById("cajasPorPallet").value),

        imprimeMensajeHitachi,
        imprimeEtiquetaCaja,
        imprimeEtiquetaPallet,

        mensajeHitachiId: imprimeMensajeHitachi ? Number(document.getElementById("mensajeHitachiId").value) : null,
        etiquetaCajaId: imprimeEtiquetaCaja ? Number(document.getElementById("etiquetaCajaId").value) : null,
        etiquetaPalletId: imprimeEtiquetaPallet ? Number(document.getElementById("etiquetaPalletId").value) : null
    };
}


async function guardarLote(payload) {

    const resp = await fetch("/api/lotes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!resp.ok) {
        throw new Error("Error enviando lote");
    }

    return await resp.json();
}

function validarLote(data) {
    if (!data.productoId) {
        const msj = "Seleccionar un producto es obligatorio";
        throw new Error(msj);
    }

    if (!data.fechaVencimiento || !data.fechaElaboracion) {
        const msj = "Las fechas de elaboración y vencimiento son obligatorias";
        throw new Error(msj);
    }

    if (data.imprimeMensajeHitachi && !data.mensajeHitachiId) {
        const msj = "Debe seleccionar un mensaje Hitachi para imprimir";
        throw new Error(msj);
    }

    if (data.imprimeEtiquetaCaja && !data.etiquetaCajaId) {
        const msj = "Debe seleccionar una etiqueta de caja para imprimir";
        throw new Error(msj);
    }

    if (data.imprimeEtiquetaPallet && !data.etiquetaPalletId) {
        const msj = "Debe seleccionar una etiqueta de pallet para imprimir";
        throw new Error(msj);
    }
}

async function nuevoLote() {
    const payload = buildLotePayload();

    validarLote(payload);

    const respuesta = await guardarLote(payload);

    return respuesta.id;
}


function calcularFechaVencimiento() {
    const fechaElabInput = document.getElementById("fecha");
    const diasInput = document.getElementById("diasVencimiento");
    const fechaVencInput = document.getElementById("vencimiento");

    if (!fechaElabInput.value || !diasInput.value) {
        fechaVencInput.value = "";
        return;
    }

    const fecha = new Date(fechaElabInput.value);
    const dias = Number(diasInput.value);

    fecha.setDate(fecha.getDate() + dias);

    // Pasar a YYYY-MM-DD para input type="date"
    fechaVencInput.value = fecha.toISOString().split("T")[0];
}


// Carga los selects de productos y marcas
async function cargarSelects() {
    await Promise.all([
        cargarSelect({
            url: "/api/productos",
            selectId: "productoId",
            valueField: "id",
            textField: "nombre"
        }),
        cargarSelect({
            url: "/api/marcas",
            selectId: "marcaId",
            valueField: "id",
            textField: "nombre"
        }),
        cargarSelect({
            url: "/api/mensajes-hitachi",
            selectId: "mensajeHitachiId",
            valueField: "id",
            textField: "descripcion"
        }),
        cargarSelect({
            url: "/api/etiquetas",
            selectId: "etiquetaCajaId",
            valueField: "id",
            textField: "descripcion"
        }),
        cargarSelect({
            url: "/api/etiquetas",
            selectId: "etiquetaPalletId",
            valueField: "id",
            textField: "descripcion"
        })
    ]);
}

function actualizarDiasVencimientoPorProducto() {
    const productoSelect = document.getElementById("productoId");
    const diasInput = document.getElementById("diasVencimiento");
    const mensajeHitachiSelect = document.getElementById("mensajeHitachiId");
    const marcaSelect = document.getElementById("marcaId");

    const productoId = productoSelect.value;
    if (!productoId) {
        diasInput.value = "";
        return;
    }

    fetch(`/api/productos/${productoId}`)
        .then(resp => {
            if (!resp.ok) {
                throw new Error("Error cargando producto");
            }

            return resp.json();
        })
        .then(producto => {
            diasInput.value = producto.vidaUtil || "";
            calcularFechaVencimiento();
            mensajeHitachiSelect.value = producto.mensajeHitachiId || "";
            marcaSelect.value = producto.marcaId || "";
        })
        .catch(err => {
            console.error("Error al obtener producto:", err);
            diasInput.value = "";
        });
}

async function cargarLoteActivo() {
    try {
        const resp = await fetch("/api/panel/lote-activo");
        if (!resp.ok) {
            throw new Error("No hay lote activo");
        }

        const loteActivo = await resp.json();

        cargarLoteEnUI(loteActivo);
        bloquearFormularioLote(true);
        document.getElementById("btnStart").disabled = true;

    } catch (e) {
        console.log("No hay lote activo:", e.message);
    }
}

function cargarLoteEnUI(loteActivo = {}) {
    document.getElementById("lote").value = loteActivo.id ?? "";

    document.getElementById("codigoLote").value = loteActivo.codigoLote ?? "";
    document.getElementById("productoId").value = loteActivo.productoId ?? "";
    document.getElementById("marcaId").value = loteActivo.marcaId ?? "";
    document.getElementById("fecha").value = loteActivo.fechaElaboracion ?? "";
    document.getElementById("vencimiento").value = loteActivo.fechaVencimiento ?? "";
    document.getElementById("diasVencimiento").value = loteActivo.diasVencimiento ?? "";

    document.getElementById("mensajeHitachiId").value = loteActivo.mensajeHitachiId ?? "";
    document.getElementById("etiquetaCajaId").value = loteActivo.etiquetaCajaId ?? "";
    document.getElementById("etiquetaPalletId").value = loteActivo.etiquetaPalletId ?? "";

    document.getElementById("productosPorCaja").value = loteActivo.productosPorCaja ?? 1;
    document.getElementById("cajasPorPallet").value = loteActivo.cajasPorPallet ?? 1;

    document.getElementById("imprimeMensajeHitachi").checked = loteActivo.imprimeMensajeHitachi ?? true;
    document.getElementById("imprimeEtiquetaCaja").checked = loteActivo.imprimeEtiquetaCaja ?? true;
    document.getElementById("imprimeEtiquetaPallet").checked = loteActivo.imprimeEtiquetaPallet ?? true;
}

function bloquearFormularioLote(habilitacion) {
    document.getElementById("codigoLote").disabled = habilitacion;
    document.getElementById("productoId").disabled = habilitacion;
    document.getElementById("marcaId").disabled = habilitacion;
    document.getElementById("fecha").disabled = habilitacion;
    document.getElementById("vencimiento").disabled = habilitacion;
    document.getElementById("diasVencimiento").disabled = habilitacion;
    document.getElementById("mensajeHitachiId").disabled = habilitacion;
    document.getElementById("etiquetaCajaId").disabled = habilitacion;
    document.getElementById("etiquetaPalletId").disabled = habilitacion;
    document.getElementById("productosPorCaja").disabled = habilitacion;
    document.getElementById("cajasPorPallet").disabled = habilitacion;
    document.getElementById("imprimeMensajeHitachi").disabled = habilitacion;
    document.getElementById("imprimeEtiquetaCaja").disabled = habilitacion;
    document.getElementById("imprimeEtiquetaPallet").disabled = habilitacion;
}

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("btnStart").addEventListener("click", () => iniciarLote());
    document.getElementById("btnPause").addEventListener("click", () => command("STOP"));
    document.getElementById("btnResume").addEventListener("click", () => command("START"));
    document.getElementById("btnStop").addEventListener("click", () => finalizarLote());
    document.getElementById("btnReset").addEventListener("click", () => command("RESET"));

    // Carga productos y marcas
    await cargarSelects();

    // Calcula la fecha de vencimiento al cambiar la fecha de elaboración o los días para vencimiento
    document.getElementById("fecha").addEventListener("change", calcularFechaVencimiento);
    document.getElementById("diasVencimiento").addEventListener("input", calcularFechaVencimiento);

    // Setea dias de vencimiento al seleccionar un producto
    document.getElementById("productoId").addEventListener("change", actualizarDiasVencimientoPorProducto);

    // Inicializa la fecha de elaboración con la fecha actual
    document.getElementById("fecha").valueAsDate = new Date();

    // Buscar si hay un lote en produccion
    await cargarLoteActivo();

    // Arranca el refresco automático
    refresh();
    setInterval(refresh, 300);
});
