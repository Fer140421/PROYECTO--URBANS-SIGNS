package com.example.urban_signs.Services;

import com.example.urban_signs.Model.CotizacionModel;

public interface PortalNotificacionService {
    void enviarNotificacionCotizacionLista(CotizacionModel cotizacion);
    void enviarNotificacionCotizacionAprobada(CotizacionModel cotizacion);
}
