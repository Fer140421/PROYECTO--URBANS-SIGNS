package com.example.urban_signs.Utils.Enum;

public enum CloudinaryFolder {
    EMPLEADOS("empleados"),
    MATERIALES_PRODUCCION("materiales_produccion"),
    MATERIALES_TRABAJO("materiales_trabajo"),
    HERRAMIENTAS_TRABAJO("herramientas_trabajo"),
    TRABAJOS("trabajos"),
    EVIDENCIAS_ENTREGA("evidencias_entrega"),
    REFERENCIAS_SOLICITUD("referencias_solicitud");
    
    private final String folderName;
    
    CloudinaryFolder(String folderName) {
        this.folderName = folderName;
    }
    
    public String getFolderName() {
        return folderName;
    }
}