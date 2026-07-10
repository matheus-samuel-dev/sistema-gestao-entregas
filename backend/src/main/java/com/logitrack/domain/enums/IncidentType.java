package com.logitrack.domain.enums;

public enum IncidentType {
    DELIVERY_DELAY("Atraso na entrega"),
    CUSTOMER_NOT_FOUND("Cliente nao localizado"),
    WRONG_ADDRESS("Endereco incorreto"),
    VEHICLE_PROBLEM("Veiculo com problema"),
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
