package com.logitrack.domain.enums;

public enum IncidentPriority {
    LOW("Baixa"),
    MEDIUM("Média"),
    HIGH("Alta"),
    CRITICAL("Crítica");

    private final String label;

    IncidentPriority(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
