package com.example.urban_signs.Services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.urban_signs.DTO.Suppliers.SupplierDetailDTO;
import com.example.urban_signs.Model.SupplierModel;

public interface SupplierService {

     List<SupplierModel> getAllSuppliers();

     SupplierModel createSupplier(SupplierModel supplier);

     SupplierModel updateSupplier(Long id, SupplierModel supplier);

     boolean deleteSupplierLogically(Long idSupplier);

     boolean activateSupplier(Long id); // <--- nuevo

     Page<SupplierDetailDTO> listSuppliers(Boolean status, String searchTerm, Pageable pageable);

}
