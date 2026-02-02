import { cargarSelect } from "./utils.js";

// =========================
// CARGA INICIAL
// =========================
document.addEventListener("DOMContentLoaded", async () => {

    await cargarSelects();

    // Evento del botón Guardar
    document.getElementById("btnGuardar").addEventListener("click", guardarProducto);

    document.getElementById("productoId").addEventListener("change", async function() {
        const id = this.value;
        if (id) {
            await cargarProducto(id);
        } else {
            limpiarFormulario();
        }
    });
});


// =========================
// CARGAR MARCAS DESDE API
// =========================

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
            selectId: "marca",
            valueField: "id",
            textField: "nombre"
        }),
        cargarSelect({
            url: "/api/mensajes-hitachi",
            selectId: "mensajeHitachi",
            valueField: "id",
            textField: "descripcion"
        })
    ]);
}




// =========================
// CARGAR PRODUCTO EN MODO EDICIÓN
// =========================
async function cargarProducto(id) {
    try {
        const resp = await fetch(`/api/productos/${id}`);
        const producto = await resp.json();

        console.log(producto);

        document.getElementById("codigo").value = producto.codigo;
        document.getElementById("nombre").value = producto.nombre;
        document.getElementById("marca").value = producto.marcaId;
        document.getElementById("altura").value = producto.altura;
        document.getElementById("vidaUtil").value = producto.vidaUtil;
        document.getElementById("mensajeHitachi").value = producto.mensajeHitachiId;
        document.getElementById("habilitado").checked = producto.habilitado;

    } catch (e) {
        alert("No se pudo cargar el producto");
    }
}


// =========================
// GUARDAR PRODUCTO
// =========================
async function guardarProducto() {
    // Validaciones simples
    const id = document.getElementById("productoId").value;

    const codigo = document.getElementById("codigo").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const marca = document.getElementById("marca").value;
    const altura = document.getElementById("altura").value.trim();
    const vidaUtil = document.getElementById("vidaUtil").value.trim();
    const mensajeHitachi = document.getElementById("mensajeHitachi").value;
    const habilitado = document.getElementById("habilitado").checked;

    if (!codigo) return alert("El código es obligatorio");
    if (!nombre) return alert("El nombre es obligatorio");
    if (!marca) return alert("Debe seleccionar una marca");

    // Armar objeto
    const data = {
        codigo,
        nombre,
        marcaId: marca,
        altura,
        vidaUtil,
        mensajeHitachiId: mensajeHitachi || null,
        habilitado
    };

    try {
        if (!id) {
            const resp = await fetch("/api/productos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!resp.ok) {
                const err = await resp.text();
                alert("Error al guardar: " + err);
                return;
            }

            alert("Producto guardado correctamente");
        }
        else {
            const resp = await fetch(`/api/productos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!resp.ok) {
                const err = await resp.text();
                alert("Error al actualizar: " + err);
                return;
            }
            alert("Producto actualizado correctamente");
        }

    } catch (e) {
        alert("Error de conexión con el servidor");
    }
}


// =========================
// LIMPIAR FORMULARIO (opcional)
// =========================
function limpiarFormulario() {
    document.getElementById("id").value = "";
    document.getElementById("codigo").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("marca").value = "";
    document.getElementById("altura").value = "";
    document.getElementById("vidaUtil").value = "";
    document.getElementById("mensajeHitachi").value = "";
    document.getElementById("habilitado").checked = true;
}