package com.example.urban_signs.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.urban_signs.Model.PasswordRecoveryModel;
public interface PasswordRecoveryRepository extends JpaRepository<PasswordRecoveryModel, Long> {}
