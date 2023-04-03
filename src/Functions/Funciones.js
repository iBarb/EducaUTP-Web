export function ValidacionEmail(text) {
    if (!text.trim()) {
        return false;
    }
    const regex = /^[A-Za-z0-9._%+-]+@utp\.edu\.pe$/;
    return regex.test(String(text).toLowerCase());
}