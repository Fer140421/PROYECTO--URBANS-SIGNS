package com.example.urban_signs.Services;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.example.urban_signs.Model.UsersModel;

public interface UserServices {

    List<UsersModel> findAll();

    void sendVerificationCode(String toEmail, String code);

    boolean existsUser(String userAcces);

    void sendEmployeeCredentials(String toEmail, String nombreCompleto, String username, String password);

    Map<String, Object> verificarEmailParaRecuperacion(String userAcces);

    Optional<UsersModel> buscarPorEmail(String userAcces);

    void sendRecoveryCode(String toEmail, String code);

    void sendUpdatedCredentials(String toEmail, String nombreCompleto, String newEmail, String newPassword);

}