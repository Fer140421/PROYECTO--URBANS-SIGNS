package com.example.urban_signs.Utils.Enum;

public enum EstadoPedido {
    PENDIENTE,      // Recién creado, aún no inicia
    EN_PROCESO,     // Se está preparando
    EN_TALLER,      // En fabricación/impresión
    FINALIZADO,     // Trabajo terminado, listo para entregar
    ENTREGADO,      // Cliente recibió el pedido
    CANCELADO       // Pedido cancelado
}