package com.logitrack.domain.enums;

public enum IncidentType {
    DELIVERY_DELAY("Atraso na entrega"),
    CUSTOMER_NOT_FOUND("Cliente não localizado"),
    WRONG_ADDRESS("Endereço incorreto"),
    VEHICLE_PROBLEM("Veículo com problema"),
    DAMAGED_PRODUCT("Produto avariado"),
    PROBLEM_SOLVED("Problema resolvido");

    private final String label;

    IncidentType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
