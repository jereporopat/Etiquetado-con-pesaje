function enviarConfiguracionDeTesteo() {
    const cintaSeparador = document.getElementById("cintaSeparador").checked;
    const cintasTransportadoras = document.getElementById("cintasTransportadoras").checked;
    const semaforo = document.getElementById("semaforo").checked;
    const buzzer = document.getElementById("buzzer").checked;

    const payload = {
        cintaSeparador,
        cintasTransportadoras,
        semaforo,
        buzzer
    }

    fetch("/api/tibbo/test/componentes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (response.ok) {
            alert("Configuración de testeo enviada correctamente.");
        } else {
            alert("Error al enviar la configuración de testeo.");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {

    //TODO eliminar este evento luego de tener implementada la telemetria
    document.querySelectorAll(".input-card").forEach(card => {
        card.addEventListener("click", () => {
          card.classList.toggle("active");
        });
    });

    document.getElementById("btnSend").addEventListener("click", enviarConfiguracionDeTesteo);
});