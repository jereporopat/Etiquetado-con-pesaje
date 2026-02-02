import { cargarSelect } from "./utils.js";

function cargarSelects() {
    cargarSelect({
        url: "/api/etiquetas",
        selectId: "etiqueta",
        valueField: "id",
        textField: "descripcion"
    })
}

document.getElementById("etiqueta").addEventListener("change", (event) => {
    const etiquetaId = event.target.value;

    if (etiquetaId) {
        fetch(`/api/etiquetas/${etiquetaId}`)
        .then(resp => {
            if (!resp.ok) {
                throw new Error("Error cargando la etiqueta");
            }
            return resp.json();
        })
        .then(data => {
            document.getElementById("descripcion").value = data.descripcion;
            document.getElementById("rutaArchivo").value = data.rutaArchivo;
        })
        .catch(err => {
            alert(err.message);
        });
    }
    else {
        document.getElementById("descripcion").value = "";
        document.getElementById("rutaArchivo").value = "";
    }
});

document.getElementById("guardarBtn").addEventListener("click", () => {
    const etiquetaId = document.getElementById("etiqueta").value;
    const descripcion = document.getElementById("descripcion").value;
    const rutaArchivo = document.getElementById("rutaArchivo").value;

    if(!descripcion) {
        alert("La descripción no puede estar vacía");
        return;
    }

    if(!rutaArchivo) {
        alert("La ruta del archivo no puede estar vacía");
        return;
    }

    const payload = {
        descripcion,
        rutaArchivo,
    };

    if (etiquetaId) {
        fetch (`/api/etiquetas/${etiquetaId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(resp => {
            if (!resp.ok) {
                throw new Error("Error actualizando la etiqueta");
            }
            return resp.json();
        })
        .then(data => {
            alert("Etiqueta actualizada correctamente");
        })
        .catch(err => {
            alert(err.message);
        });
    }
    else {
        fetch("/api/etiquetas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(resp => {
            if (!resp.ok) {
                throw new Error("Error guardando la etiqueta");
            }
            return resp.json();
        })
        .then(data => {
            alert("Etiqueta guardada correctamente");
        })
        .catch(err => {
            alert(err.message);
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
        cargarSelects();
    }
);