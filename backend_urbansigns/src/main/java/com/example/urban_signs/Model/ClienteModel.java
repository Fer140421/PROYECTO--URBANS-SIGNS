package com.example.urban_signs.Model;

import java.time.LocalDate;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "clientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClienteModel {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_cliente")
  private Long idCliente;

  @OneToOne
  @JoinColumn(name = "id_persona")
  private PeopleModel persona;

  @ManyToOne
  @JoinColumn(name = "id_empresa")
  private EmpresaModel empresa;

  /**
   * Cuenta que representa a este cliente en el portal.
   *
   * La unicidad se aplica en la migracion SQL: un usuario solo puede estar
   * vinculado a un cliente y un cliente solo puede tener una cuenta.
   */
  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_user")
  @JsonIgnore
  private UsersModel usuario;

  @Column(name = "tipo_cliente_persona_empresa", nullable = false, length = 10)
  private String tipoClientePersonaEmpresa;

  @Column(name = "tipo_cliente", nullable = false, length = 15)
  private String tipoCliente;

  private Boolean estado;

  @Column(name = "fecha_registro")
  private LocalDate fechaRegistro;

  @Column(name = "correo")
  private String correo;
}
