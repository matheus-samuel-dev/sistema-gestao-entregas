package com.logitrack.domain.enums;

public enum IncidentStatus {
    OPEN("Aberta"),
    IN_REVIEW("Em análise"),
    RESOLVED("Resolvida"),
    CANCELED("Cancelada");

    private final String label;

    IncidentStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
