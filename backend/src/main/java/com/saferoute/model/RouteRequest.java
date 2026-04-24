package com.saferoute.model;

import lombok.Data;

@Data
public class RouteRequest {
    private double startLat;
    private double startLng;
    private double endLat;
    private double endLng;
    // "safe" or "fastest" or "both"
    private String mode;
}
