package com.logitrack.domain.enums;

public enum IncidentPriority {
    LOW("Baixa"),
    MEDIUM("Media"),
    HIGH("Alta"),
    CRITICAL("Critica");

    private final String label;

    IncidentPriority(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
