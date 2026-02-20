/**
 * Mengembalikan string tanggal dalam format YYYY-MM-DD
 * berdasarkan WAKTU LOKAL device, bukan UTC.
 * 
 * Mengatasi masalah di mana new Date().toISOString() mengembalikan
 * tanggal kemarin saat user berada di timezone GMT+ (seperti WIB)
 * dan jam masih dini hari (00:00 - 07:00).
 * 
 * @param dateObj (Opsional) Objek Date yang ingin diformat. Default: new Date()
 */
export function getLocalDateISOString(dateObj: Date = new Date()): string {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
