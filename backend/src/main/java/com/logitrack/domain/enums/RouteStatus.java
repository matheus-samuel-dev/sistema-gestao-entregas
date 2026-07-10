package com.logitrack.domain.enums;

public enum RouteStatus {
    PLANNED("Planejada"),
    ACTIVE("Ativa"),
    COMPLETED("Concluida"),
    CANCELED("Cancelada");

    private final String label;

    RouteStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
