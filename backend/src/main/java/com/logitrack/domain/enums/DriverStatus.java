package com.logitrack.domain.enums;

public enum DriverStatus {
    AVAILABLE("Disponível"),
    ON_ROUTE("Em rota"),
    UNAVAILABLE("Indisponível"),
    INACTIVE("Inativo");

    private final String label;

    DriverStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
