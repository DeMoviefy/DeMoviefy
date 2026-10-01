import type { SubmitEvent } from "react";
import { useState } from "react";

export default function Cadastro() {
  const [texto, setTexto] = useState("");

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    console.log("Texto enviado:", texto);

    setTexto("");
  }

  return (
    <form
  onSubmit={handleSubmit}
  className="bg-gray-200 p-4 rounded-lg"
>
  <input
    type="text"
    value={texto}
    onChange={(event) => setTexto(event.target.value)}
    placeholder="Digite sua mensagem..."
    className="border border-gray-300 rounded-lg px-4 py-2"
  />

  <button
    type="submit"
    className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
  >
    Enviar
  </button>
</form>
  );
}
