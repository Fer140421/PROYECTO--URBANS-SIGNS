package com.example.urban_signs.DTO.Suppliers;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Setter
@Getter
@Builder
@Data
public class SupplierDetailDTO {
  private Long idSupplier;
    private String ci;
    private String name;
    private String ap;
    private String am;
    private String phone;
    private String address;
    private String city;
    private Boolean status;
}
