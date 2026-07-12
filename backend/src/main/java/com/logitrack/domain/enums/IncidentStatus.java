package com.logitrack.domain.enums;

public enum IncidentStatus {
    OPEN("Aberta"),
    IN_REVIEW("Em análise"),
    IN_TREATMENT("Em tratamento"),
    WAITING_THIRD_PARTY("Aguardando terceiro"),
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
