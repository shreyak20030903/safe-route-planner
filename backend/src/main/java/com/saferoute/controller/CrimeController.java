package com.saferoute.controller;

import com.saferoute.model.CrimeZone;
import com.saferoute.service.CrimeZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crime-zones")
@RequiredArgsConstructor
public class CrimeController {

    private final CrimeZoneService crimeZoneService;

    /**
     * GET /api/crime-zones
     * Returns all crime zones — frontend uses this to draw the heatmap
     */
    @GetMapping
    public ResponseEntity<List<CrimeZone>> getAllZones() {
        return ResponseEntity.ok(crimeZoneService.getAllZones());
    }

    /**
     * GET /api/crime-zones/high-risk
     * Returns only HIGH and MEDIUM zones
     */
    @GetMapping("/high-risk")
    public ResponseEntity<List<CrimeZone>> getHighRiskZones() {
        return ResponseEntity.ok(crimeZoneService.getHighRiskZones());
    }
}
