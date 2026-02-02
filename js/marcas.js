document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("btnGuardar").addEventListener("click", guardarMarca);

    // Si viene un id por URL → modo edición
    const params = new URLSearchParams(window.location.search);
    if (params.has("id")) {
        cargarMarca(params.get("id"));
    }
});


// ======================
// CARGAR MARCA EXISTENTE
// ======================
async function cargarMarca(id) {
    try {
        const resp = await fetch(`/marcas?id=${id}`);
        const m = await resp.json();

        document.getElementById("nombre").value = m.nombre;
        document.getElementById("habilitada").checked = m.habilitada;

    } catch (e) {
        alert("No se pudo cargar la marca");
    }
}


// ======================
// GUARDAR MARCA
// ======================
async function guardarMarca() {
    const nombre = document.getElementById("nombre").value.trim();
    const habilitada = document.getElementById("habilitada").checked;

    if (!nombre) return alert("El nombre es obligatorio");

    const data = {
        nombre,
        habilitada
    };

    try {
        const resp = await fetch("/api/marcas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!resp.ok) {
            const err = await resp.text();
            alert("Error al guardar: " + err);
            return;
        }

        alert("Marca guardada correctamente");

        // limpiar
        document.getElementById("nombre").value = "";
        document.getElementById("habilitada").checked = false;

    } catch (e) {
        alert("Error de conexión al servidor");
    }
}
