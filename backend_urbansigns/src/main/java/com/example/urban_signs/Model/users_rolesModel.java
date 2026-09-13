package com.example.urban_signs.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Setter
@Getter
@NoArgsConstructor
@Builder
@AllArgsConstructor
@Table(name = "users_roles")
public class users_rolesModel {

    @EmbeddedId
    private users_rolesPK id_user_rol;

    @ManyToOne
    @MapsId("id_role")
    @JoinColumn(name = "id_role")
    RolesModel roles;

    @ManyToOne
    @MapsId("id_user")
    @JoinColumn(name = "id_user")
    UsersModel users;

}
