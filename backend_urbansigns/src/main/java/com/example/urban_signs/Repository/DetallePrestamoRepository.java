package com.example.urban_signs.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.urban_signs.Model.DetallePrestamoModel;
import jakarta.transaction.Transactional;

public interface DetallePrestamoRepository extends JpaRepository<DetallePrestamoModel, Long> {

    @Transactional
    @Modifying
    @Query("DELETE FROM DetallePrestamoModel d WHERE d.prestamo.idPrestamo = :idPrestamo")
    void deleteAllByPrestamoId(@Param("idPrestamo") Long idPrestamo);

    List<DetallePrestamoModel> findByPrestamoIdPrestamo(Long idPrestamo);

}
