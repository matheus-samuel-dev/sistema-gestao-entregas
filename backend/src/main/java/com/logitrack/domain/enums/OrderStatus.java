package com.logitrack.domain.enums;

public enum OrderStatus {
    PENDING("Pendente"),
    PICKING("Separando"),
    COLLECTING("Coletando"),
    ON_THE_WAY("A caminho"),
    DELIVERED("Entregue"),
    DELAYED("Atrasado"),
    CANCELED("Cancelado");

    private final String label;

    OrderStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
