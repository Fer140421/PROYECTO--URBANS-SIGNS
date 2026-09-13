package com.example.urban_signs.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import jakarta.persistence.LockModeType;

import com.example.urban_signs.Model.UsersModel;

public interface UsersRepository extends JpaRepository<UsersModel, Long> {

    @Query("select u from UsersModel u where u.userAcces=?1")
    Optional<UsersModel> getByLogin(String login);

    UsersModel findByIdPeople(Long idPeople);

    @Query(value = "SELECT COUNT(*) > 0 FROM users WHERE user_acces = ?1", nativeQuery = true)
    boolean existsByUserAcces(String userAcces);

    Optional<UsersModel> findByUserAcces(String userAcces);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from UsersModel u where u.userAcces = ?1")
    Optional<UsersModel> findByUserAccesForUpdate(String userAcces);

    @Query(value = "SELECT COUNT(*) > 0 FROM users WHERE user_acces = ?1 AND state_user = true", nativeQuery = true)
    boolean existsByUserAccesAndActive(String userAcces);

}
