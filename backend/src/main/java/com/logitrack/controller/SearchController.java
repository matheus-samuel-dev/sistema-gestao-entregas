package com.logitrack.controller;

import com.logitrack.dto.PlatformDtos;
import com.logitrack.exception.BusinessException;
import com.logitrack.service.GlobalSearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    private final GlobalSearchService service;

    public SearchController(GlobalSearchService service) { this.service = service; }

    @GetMapping
    public PlatformDtos.SearchResponse search(@RequestParam("q") String query,
                                               @RequestParam(defaultValue = "5") int limit) {
        if (query == null || query.trim().length() < 2) throw new BusinessException("Informe ao menos dois caracteres.");
        return service.search(query, Math.max(1, Math.min(limit, 25)));
    }
}
