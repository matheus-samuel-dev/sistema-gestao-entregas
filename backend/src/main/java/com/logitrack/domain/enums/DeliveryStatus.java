package com.logitrack.domain.enums;

public enum DeliveryStatus {
    IN_PROGRESS("Em andamento"),
    COLLECTING("Coletando"),
    ON_THE_WAY("A caminho"),
    DELIVERED("Entregue"),
    DELAYED("Atrasada"),
    CANCELED("Cancelada");

    private final String label;

    DeliveryStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
