package com.isla.kiosk.repository;

import com.isla.kiosk.model.AddOn;
import com.isla.kiosk.model.MenuItem;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Repository
public class MenuRepository {

    private final List<MenuItem> menuItems = new ArrayList<>();
    private final List<AddOn> addOns = new ArrayList<>();

    public MenuRepository() {
        initMenu();
        initAddOns();
    }

    private void initMenu() {
        // Espresso-Based (P59)
        menuItems.add(new MenuItem("esp-1", "Cafe Latte", "Espresso-Based", 59.0, "Classic smooth espresso with silky steamed fresh milk", false, "#795548"));
        menuItems.add(new MenuItem("esp-2", "Spanish Latte", "Espresso-Based", 59.0, "Sweetened condensed milk balanced with rich dark espresso", true, "#8D6E63"));
        menuItems.add(new MenuItem("esp-3", "Vanilla Latte", "Espresso-Based", 59.0, "Velvety espresso with rich French vanilla syrup & milk", false, "#D7CCC8"));
        menuItems.add(new MenuItem("esp-4", "Caramel Latte", "Espresso-Based", 59.0, "Espresso kissed with luscious golden caramel drizzle", false, "#BCAAA4"));
        menuItems.add(new MenuItem("esp-5", "White Mocha", "Espresso-Based", 59.0, "Sweet white chocolate indulgence blended with bold espresso", false, "#A1887F"));
        menuItems.add(new MenuItem("esp-6", "Americano", "Espresso-Based", 59.0, "Pure, clean double espresso poured over chilled water", false, "#4E342E"));
        menuItems.add(new MenuItem("esp-7", "Java Chips", "Espresso-Based", 59.0, "Espresso blended with chocolate chips & mocha swirl", true, "#3E2723"));
        menuItems.add(new MenuItem("esp-8", "Einspanner Latte", "Espresso-Based", 59.0, "Rich iced latte topped with thick, sweet Viennese whipped cream", false, "#5D4037"));

        // Matcha Series (P59)
        menuItems.add(new MenuItem("mat-1", "Matcha Latte", "Matcha Series", 59.0, "Premium pure Japanese green matcha whisked with fresh milk", false, "#2E7D32"));
        menuItems.add(new MenuItem("mat-2", "Strawberry Matcha", "Matcha Series", 59.0, "Real strawberry puree layered with iced milk and vibrant matcha", false, "#388E3C"));
        menuItems.add(new MenuItem("mat-3", "Matcha Espresso", "Matcha Series", 59.0, "Distinctive layers of earthy matcha, fresh milk, and rich espresso", false, "#1B5E20"));
        menuItems.add(new MenuItem("mat-4", "Merry Matcha", "Matcha Series", 59.0, "Festive matcha delight with sweet cream cloud", true, "#43A047"));

        // Milk-Based (P59)
        menuItems.add(new MenuItem("mlk-1", "Ube Taro", "Milk-Based", 59.0, "Rich local purple yam and sweet taro with creamy fresh milk", false, "#7B1FA2"));
        menuItems.add(new MenuItem("mlk-2", "Strawberry", "Milk-Based", 59.0, "Sweet crushed real strawberries swirled in iced fresh milk", true, "#D81B60"));
        menuItems.add(new MenuItem("mlk-3", "Dark Cocoa", "Milk-Based", 59.0, "Decadent Dutch cocoa blend for the true chocolate enthusiast", false, "#4E342E"));
        menuItems.add(new MenuItem("mlk-4", "Cocoa Berry", "Milk-Based", 59.0, "Rich dark chocolate perfectly paired with sweet berry puree", false, "#880E4F"));

        // Juice Series (P49)
        menuItems.add(new MenuItem("juc-1", "Pink Lychee", "Juice Series", 49.0, "Refreshing exotic pink lychee fruit infusion over ice", false, "#E91E63"));
        menuItems.add(new MenuItem("juc-2", "Purple Lemonade", "Juice Series", 49.0, "Zesty citrus lemonade naturally colored with butterfly pea flower", true, "#673AB7"));

        // Hot Series (P39)
        menuItems.add(new MenuItem("hot-1", "Creamy Cocoa", "Hot Series", 39.0, "Warm comforting Dutch cocoa topped with chocolate dust", false, "#5D4037"));
        menuItems.add(new MenuItem("hot-2", "Cappuccino", "Hot Series", 39.0, "Hot robust espresso with equal parts steamed milk and airy foam", false, "#6D4C41"));

        // Blended Series (P75)
        menuItems.add(new MenuItem("bld-1", "Blended Java Chips", "Blended Series", 75.0, "Ice blended espresso, chocolate, and crushed java chips with cream cloud", true, "#3E2723"));
        menuItems.add(new MenuItem("bld-2", "Blended Dark Cocoa", "Blended Series", 75.0, "Rich ice blended dark cocoa frappe with chocolate drizzle and cream cloud", true, "#4E342E"));
        menuItems.add(new MenuItem("bld-3", "Matcha Dream", "Blended Series", 75.0, "Frappe blended premium matcha topped with sweet cream cloud", false, "#2E7D32"));
        menuItems.add(new MenuItem("bld-4", "Ube Dream", "Blended Series", 75.0, "Ice blended creamy ube frappe with sweet purple yam swirl", false, "#6A1B9A"));
        menuItems.add(new MenuItem("bld-5", "Strawberry Dream", "Blended Series", 75.0, "Refreshing ice blended real strawberries with sweet cream", false, "#E91E63"));
    }

    private void initAddOns() {
        addOns.add(new AddOn("add-1", "Coffee Jelly", 11.0));
        addOns.add(new AddOn("add-2", "Espresso Shot", 11.0));
        addOns.add(new AddOn("add-3", "Strawberry Jam", 11.0));
        addOns.add(new AddOn("add-4", "Cream Cloud", 11.0));
        addOns.add(new AddOn("add-5", "Condensed Milk", 11.0));
        addOns.add(new AddOn("add-6", "Syrup (Vanilla/Hazelnut/Caramel)", 11.0));
    }

    public List<MenuItem> getAllMenuItems() {
        return Collections.unmodifiableList(menuItems);
    }

    public Optional<MenuItem> findById(String id) {
        return menuItems.stream().filter(i -> i.getId().equalsIgnoreCase(id)).findFirst();
    }

    public List<AddOn> getAllAddOns() {
        return Collections.unmodifiableList(addOns);
    }
}
