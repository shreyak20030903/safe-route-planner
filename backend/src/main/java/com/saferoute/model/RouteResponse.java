package com.saferoute.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteResponse {

    // "safe" or "fastest"
    private String type;

    // Ordered list of [lat, lng] pairs forming the route polyline
    private List<double[]> coordinates;

    private double distanceKm;
    private int durationMinutes;

    // 0–100, higher is safer
    private int safetyScore;

    // Human readable summary
    private String summary;
}
