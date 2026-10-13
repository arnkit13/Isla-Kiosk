package com.isla.kiosk.model;

import java.util.ArrayList;
import java.util.List;

public class OrderItem {
    private String menuItemId;
    private String name;
    private String category;
    private int quantity = 1;
    private double unitPrice;
    private List<String> selectedAddOns = new ArrayList<>();
    private double addOnsUnitPrice = 0.0;
    private double itemTotal;
    private String notes;

    public OrderItem() {
    }

    public OrderItem(String menuItemId, String name, String category, int quantity, double unitPrice, List<String> selectedAddOns, String notes) {
        this.menuItemId = menuItemId;
        this.name = name;
        this.category = category;
        this.quantity = Math.max(1, quantity);
        this.unitPrice = unitPrice;
        this.selectedAddOns = selectedAddOns != null ? selectedAddOns : new ArrayList<>();
        this.notes = notes;
        this.recalculateTotal();
    }

    public void recalculateTotal() {
        this.addOnsUnitPrice = (this.selectedAddOns != null ? this.selectedAddOns.size() : 0) * 11.0;
        this.itemTotal = (this.unitPrice + this.addOnsUnitPrice) * this.quantity;
    }

    public String getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(String menuItemId) {
        this.menuItemId = menuItemId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = Math.max(1, quantity);
        recalculateTotal();
    }

    public double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
        recalculateTotal();
    }

    public List<String> getSelectedAddOns() {
        return selectedAddOns;
    }

    public void setSelectedAddOns(List<String> selectedAddOns) {
        this.selectedAddOns = selectedAddOns != null ? selectedAddOns : new ArrayList<>();
        recalculateTotal();
    }

    public double getAddOnsUnitPrice() {
        return addOnsUnitPrice;
    }

    public void setAddOnsUnitPrice(double addOnsUnitPrice) {
        this.addOnsUnitPrice = addOnsUnitPrice;
    }

    public double getItemTotal() {
        return itemTotal;
    }

    public void setItemTotal(double itemTotal) {
        this.itemTotal = itemTotal;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
