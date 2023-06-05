export function ValidacionEmail(text) {
  if (!text.trim()) {
    return false;
  }
  const regex = /^[A-Za-z0-9._%+-]+@utp\.edu\.pe$/;
  return regex.test(String(text).toLowerCase());
}

export function obtenerHora(fecha) {
  const opciones = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  };

  const hora = new Date(fecha * 1000).toLocaleString('en-US', opciones).replace(/\s/g, '').toLowerCase();
  return hora;
}

export function compararFecha(fechaComparar, limite = 0) {

  var fechaActual = new Date();

  var fechaCompararObj = new Date(fechaComparar.seconds * 1000 + fechaComparar.nanoseconds / 1000000);

  var diferencia = fechaCompararObj.getTime() - fechaActual.getTime();

  var diferenciaHoras = diferencia / (1000 * 60 * 60);

  // Comparar las diferencias de horas
  return diferenciaHoras > limite;
}

export function obtenerFechaEnFormato(e) {
  const fecha = new Date(e.seconds * 1000 + e.nanoseconds / 1000000);
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1; // Los meses en JavaScript comienzan desde 0, por lo que se suma 1
  const anio = fecha.getFullYear().toString().slice(-2); // Obtener los últimos dos dígitos del año

  // Formatear los componentes de la fecha con ceros iniciales si son menores que 10
  const diaFormateado = dia < 10 ? '0' + dia : dia;
  const mesFormateado = mes < 10 ? '0' + mes : mes;

  return diaFormateado + '/' + mesFormateado + '/' + anio;
}