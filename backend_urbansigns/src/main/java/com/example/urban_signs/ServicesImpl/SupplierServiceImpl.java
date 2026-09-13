package com.example.urban_signs.ServicesImpl;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.urban_signs.DTO.Suppliers.SupplierDetailDTO;
import com.example.urban_signs.Model.PeopleModel;
import com.example.urban_signs.Model.SupplierModel;
import com.example.urban_signs.Repository.PeopleRepository;
import com.example.urban_signs.Repository.SupplierRepository;
import com.example.urban_signs.Services.SupplierService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final PeopleRepository peopleRepository;

    @Override
    public List<SupplierModel> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    @Override
    public Page<SupplierDetailDTO> listSuppliers(Boolean status, String searchTerm, Pageable pageable) {
        return supplierRepository.findByFiltersUnified(status, searchTerm, pageable)
                .map(this::convertToDTO);
    }

    private SupplierDetailDTO convertToDTO(SupplierModel supplier) {
        PeopleModel person = supplier.getPeople();

        return SupplierDetailDTO.builder()
                .idSupplier(supplier.getIdSupplier())
                .ci(person.getCi())
                .name(person.getName_people())
                .ap(person.getAp())
                .am(person.getAm())
                .phone(person.getPhone_number())
                .address(person.getAddres())
                .city(supplier.getCity())
                .status(supplier.getStatus())
                .build();
    }

    @Override
    public SupplierModel createSupplier(SupplierModel supplier) {
        // Generar el código de proveedor
        String generatedCode = generateSupplierCode();
        supplier.getPeople().setCi(generatedCode);

        // Guardar persona y proveedor
        PeopleModel savedPeople = peopleRepository.save(supplier.getPeople());
        supplier.setPeople(savedPeople);

        return supplierRepository.save(supplier);
    }

    private String generateSupplierCode() {
        Optional<SupplierModel> lastSupplier = supplierRepository.findTopByOrderByIdSupplierDesc();

        int nextNumber = 1;
        if (lastSupplier.isPresent()) {
            String lastCi = lastSupplier.get().getPeople().getCi();
            if (lastCi != null && lastCi.startsWith("PROV-")) {
                try {
                    nextNumber = Integer.parseInt(lastCi.substring(5)) + 1;
                } catch (NumberFormatException e) {
                    // fallback to 1
                }
            }
        }

        return String.format("PROV-%03d", nextNumber);
    }

    @Override
    public SupplierModel updateSupplier(Long id, SupplierModel supplier) {
        SupplierModel existingSupplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        PeopleModel updatedPeople = supplier.getPeople();
        updatedPeople.setId_people(existingSupplier.getPeople().getId_people());

        // Actualizamos persona y proveedor
        peopleRepository.save(updatedPeople);
        existingSupplier.setPeople(updatedPeople);
        existingSupplier.setCity(supplier.getCity());
        existingSupplier.setStatus(supplier.getStatus());

        return supplierRepository.save(existingSupplier);
    }

    @Override
    public boolean deleteSupplierLogically(Long idSupplier) {
        Optional<SupplierModel> optionalSupplier = supplierRepository.findByIdSupplier(idSupplier);

        if (optionalSupplier.isPresent()) {
            SupplierModel supplier = optionalSupplier.get();
            supplier.setStatus(false); // Eliminación lógica
            supplierRepository.save(supplier);
            return true;
        }

        return false;
    }

    @Override
    public boolean activateSupplier(Long id) {
        Optional<SupplierModel> supplierOpt = supplierRepository.findById(id);
        if (supplierOpt.isPresent()) {
            SupplierModel supplier = supplierOpt.get();
            supplier.setStatus(true);
            supplierRepository.save(supplier);
            return true;
        }
        return false;
    }
}
