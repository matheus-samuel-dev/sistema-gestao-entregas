package com.logitrack.domain.enums;

public enum VehicleStatus {
    AVAILABLE("Disponível"),
    ON_ROUTE("Em rota"),
    MAINTENANCE("Manutenção"),
    INACTIVE("Inativo");

    private final String label;

    VehicleStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
