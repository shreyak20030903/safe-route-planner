package com.saferoute.controller;

import com.saferoute.model.RouteRequest;
import com.saferoute.model.RouteResponse;
import com.saferoute.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/route")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    /**
     * POST /api/route
     * Body: { startLat, startLng, endLat, endLng, mode }
     * mode: "safe" | "fastest" | "both"
     * Returns list of RouteResponse objects (1 or 2 depending on mode)
     */
    @PostMapping
    public ResponseEntity<List<RouteResponse>> calculateRoute(@RequestBody RouteRequest request) {
        List<RouteResponse> routes = routeService.calculateRoutes(request);
        if (routes.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(routes);
    }
}
