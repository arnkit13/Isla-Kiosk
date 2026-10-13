package com.isla.kiosk.service;

import com.isla.kiosk.model.AddOn;
import com.isla.kiosk.model.MenuItem;
import com.isla.kiosk.repository.MenuRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenuService {

    private final MenuRepository menuRepository;

    public MenuService(MenuRepository menuRepository) {
        this.menuRepository = menuRepository;
    }

    public List<MenuItem> getAllMenuItems() {
        return menuRepository.getAllMenuItems();
    }

    public Optional<MenuItem> getMenuItemById(String id) {
        return menuRepository.findById(id);
    }

    public List<AddOn> getAllAddOns() {
        return menuRepository.getAllAddOns();
    }
}
