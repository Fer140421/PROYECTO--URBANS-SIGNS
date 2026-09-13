package com.example.urban_signs.Model;

import java.time.LocalDateTime;

import com.example.urban_signs.Utils.Enum.EstadoSession;

import jakarta.persistence.*;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sesion")
@Getter
@Setter
@NoArgsConstructor
public class SesionModel {
  @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sesion")
    private Long idSesion;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private UsersModel usuario;

    @Column(name = "login_inicio", nullable = false)
    private LocalDateTime loginInicio;

    @Column(name = "login_fin")
    private LocalDateTime loginFin;

    @Column(name = "ip_direccion", length = 255)
    private String ipDireccion;

    @Column(name = "dispositivo", length = 255)
    private String dispositivo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoSession estado = EstadoSession.ACTIVO;
}