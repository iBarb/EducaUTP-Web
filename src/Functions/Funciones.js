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