package com.logitrack.domain.enums;

public enum DriverStatus {
    AVAILABLE("Disponivel"),
    ON_ROUTE("Em rota"),
    UNAVAILABLE("Indisponivel"),
    INACTIVE("Inativo");

    private final String label;

    DriverStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
