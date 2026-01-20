/**
 * @fileOverview
 * Configuración de Métodos de Pago Manuales.
 * 
 * ¡IMPORTANTE!
 * Edita la información en este archivo para mostrar los datos correctos
 * de tu cuenta bancaria y billeteras electrónicas en la página de checkout.
 * 
 * No necesitas tocar ningún otro archivo de código.
 */

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  accountHolderId: string; // RUC o CI
  alias?: string;
}

interface EWallet {
    name: string; // Ej: Tigo Money, Personal Pay
    identifier: string; // Ej: Número de celular
}

export const bankTransferDetails: BankAccount = {
    // --- EDITA TUS DATOS BANCARIOS AQUÍ ---
    bankName: "Banco Visión S.A.E.C.A.",
    accountHolderName: "Luz Marina Garcete",
    accountNumber: "123456789",
    accountHolderId: "1.234.567",
    alias: "luz.garcete"
    // --- FIN DE LA SECCIÓN DE EDICIÓN ---
};

export const eWalletDetails: EWallet[] = [
    // --- EDITA TUS BILLETERAS ELECTRÓNICAS AQUÍ ---
    {
        name: "Tigo Money",
        identifier: "0981-123-456"
    },
    {
        name: "Billetera Personal",
        identifier: "0971-654-321"
    }
    // Puedes agregar más billeteras aquí si lo necesitas, por ejemplo:
    // {
    //     name: "Claro Giros",
    //     identifier: "0991-987-654"
    // }
    // --- FIN DE LA SECCIÓN DE EDICIÓN ---
];

// Mensaje de instrucción común para pagos manuales
export const manualPaymentInstruction = "Una vez realizado el pago, envía el comprobante a nuestro WhatsApp para confirmar tu pedido.";
