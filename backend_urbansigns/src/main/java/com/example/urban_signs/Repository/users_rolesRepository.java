package com.example.urban_signs.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.urban_signs.Model.users_rolesModel;
import com.example.urban_signs.Model.users_rolesPK;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface users_rolesRepository extends JpaRepository<users_rolesModel, users_rolesPK> {

    List<users_rolesModel> findByUsers_IdUser(Long idUser);

    @Transactional
    @Modifying
    @Query("DELETE FROM users_rolesModel ur WHERE ur.users.idUser = :idUser AND ur.roles.idRole = :idRole")
    void deleteUserRole(@Param("idUser") Long idUser, @Param("idRole") Long idRole);

    @Transactional
    @Modifying
    @Query("DELETE FROM users_rolesModel ur WHERE ur.users.idUser = :idUser")
    void deleteAllRolesByUser(@Param("idUser") Long idUser);

}