package com.saferoute.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.saferoute.model.CrimeZone;
import com.saferoute.model.RouteRequest;
import com.saferoute.model.RouteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final CrimeZoneService crimeZoneService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${osrm.base-url}")
    private String osrmBaseUrl;

    /**
     * Main entry: returns safe route, fastest route, or both depending on mode.
     */
    public List<RouteResponse> calculateRoutes(RouteRequest request) {
        List<RouteResponse> results = new ArrayList<>();

        String mode = request.getMode() == null ? "both" : request.getMode();

        if (mode.equals("fastest") || mode.equals("both")) {
            RouteResponse fastest = getFastestRoute(request);
            if (fastest != null) results.add(fastest);
        }

        if (mode.equals("safe") || mode.equals("both")) {
            RouteResponse safe = getSafeRoute(request);
            if (safe != null) results.add(safe);
        }

        return results;
    }

    /**
     * FASTEST ROUTE: Single OSRM call, no crime scoring preference.
     */
    private RouteResponse getFastestRoute(RouteRequest req) {
        String url = buildOsrmUrl(req.getStartLng(), req.getStartLat(),
                req.getEndLng(), req.getEndLat(), false);

        JsonNode osrmResponse = callOsrm(url);
        if (osrmResponse == null) return null;

        JsonNode route = osrmResponse.path("routes").get(0);
        List<double[]> coords = decodeGeometry(route.path("geometry"));

        double rawScore = crimeZoneService.scoreCrimeForRoute(coords);
        int safety = crimeZoneService.toSafetyPercent(rawScore);
        double distKm = route.path("distance").asDouble() / 1000.0;
        int minutes = (int) Math.ceil(route.path("duration").asDouble() / 60.0);

        return RouteResponse.builder()
                .type("fastest")
                .coordinates(coords)
                .distanceKm(Math.round(distKm * 10.0) / 10.0)
                .durationMinutes(minutes)
                .safetyScore(safety)
                .summary(String.format("%.1f km · %d min · Safety: %d%%", distKm, minutes, safety))
                .build();
    }

    /**
     * SAFE ROUTE: 
     * 1. Ask OSRM for up to 3 alternative routes
     * 2. Score each by crime weight
     * 3. Pick the lowest-scoring (safest) one
     * 4. If all alternatives score HIGH, inject avoidance waypoints around
     *    the top crime zone that the fastest route passes through, then re-route
     */
    private RouteResponse getSafeRoute(RouteRequest req) {
        // Step 1: Get alternatives
        String url = buildOsrmUrl(req.getStartLng(), req.getStartLat(),
                req.getEndLng(), req.getEndLat(), true);

        JsonNode osrmResponse = callOsrm(url);
        if (osrmResponse == null) return null;

        JsonNode routesNode = osrmResponse.path("routes");
        if (!routesNode.isArray() || routesNode.size() == 0) return null;

        // Step 2: Score all routes
        RouteCandidate best = null;
        for (int i = 0; i < routesNode.size(); i++) {
            JsonNode route = routesNode.get(i);
            List<double[]> coords = decodeGeometry(route.path("geometry"));
            double score = crimeZoneService.scoreCrimeForRoute(coords);
            double dist = route.path("distance").asDouble();
            int dur = (int) Math.ceil(route.path("duration").asDouble() / 60.0);

            if (best == null || score < best.crimeScore) {
                best = new RouteCandidate(coords, score, dist, dur);
            }
        }

        // Step 3: If best route still has high crime score, try avoidance detour
        if (best != null && best.crimeScore > 2.0) {
            RouteCandidate detour = tryDetourRoute(req, best.coordinates);
            if (detour != null && detour.crimeScore < best.crimeScore) {
                best = detour;
            }
        }

        if (best == null) return null;

        int safety = crimeZoneService.toSafetyPercent(best.crimeScore);
        double distKm = Math.round((best.distanceMeters / 1000.0) * 10.0) / 10.0;

        return RouteResponse.builder()
                .type("safe")
                .coordinates(best.coordinates)
                .distanceKm(distKm)
                .durationMinutes(best.durationMinutes)
                .safetyScore(safety)
                .summary(String.format("%.1f km · %d min · Safety: %d%%", distKm, best.durationMinutes, safety))
                .build();
    }

    /**
     * Try routing via a waypoint that steers around the worst crime zone
     * that the current route passes through.
     */
    private RouteCandidate tryDetourRoute(RouteRequest req, List<double[]> currentCoords) {
        List<CrimeZone> highRisk = crimeZoneService.getHighRiskZones();

        // Find which high-risk zone the current route passes through most
        CrimeZone worstZone = null;
        double worstExposure = 0;

        for (CrimeZone zone : highRisk) {
            long pointsInZone = currentCoords.stream().filter(pt -> {
                double d = CrimeZoneService.haversineMeters(pt[0], pt[1], zone.getLatitude(), zone.getLongitude());
                return d < zone.getRadiusMeters();
            }).count();

            double exposure = pointsInZone * zone.getCrimeWeight();
            if (exposure > worstExposure) {
                worstExposure = exposure;
                worstZone = zone;
            }
        }

        if (worstZone == null || worstExposure < 3) return null;

        // Create a waypoint offset ~600m perpendicular from the crime zone center
        double waypointLat = worstZone.getLatitude() + 0.006; // ~660m north
        double waypointLng = worstZone.getLongitude() + 0.006; // ~560m east

        String url = String.format(
                "%s/route/v1/driving/%f,%f;%f,%f;%f,%f?overview=full&geometries=geojson&alternatives=false",
                osrmBaseUrl,
                req.getStartLng(), req.getStartLat(),
                waypointLng, waypointLat,
                req.getEndLng(), req.getEndLat()
        );

        JsonNode osrmResponse = callOsrm(url);
        if (osrmResponse == null) return null;

        JsonNode route = osrmResponse.path("routes").get(0);
        List<double[]> coords = decodeGeometry(route.path("geometry"));
        double score = crimeZoneService.scoreCrimeForRoute(coords);
        double dist = route.path("distance").asDouble();
        int dur = (int) Math.ceil(route.path("duration").asDouble() / 60.0);

        return new RouteCandidate(coords, score, dist, dur);
    }

    // ── OSRM helpers ──

    private String buildOsrmUrl(double startLng, double startLat,
                                 double endLng, double endLat, boolean alternatives) {
        return String.format(
                "%s/route/v1/driving/%f,%f;%f,%f?overview=full&geometries=geojson&alternatives=%s",
                osrmBaseUrl, startLng, startLat, endLng, endLat,
                alternatives ? "3" : "false"
        );
    }

    private JsonNode callOsrm(String url) {
        try {
            String json = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(json);
            if (!"Ok".equals(root.path("code").asText())) return null;
            return root;
        } catch (Exception e) {
            System.err.println("OSRM call failed: " + e.getMessage());
            return null;
        }
    }

    /**
     * GeoJSON geometry from OSRM has coordinates as [lng, lat] arrays.
     * We convert to [lat, lng] for Leaflet.
     */
    private List<double[]> decodeGeometry(JsonNode geometry) {
        List<double[]> result = new ArrayList<>();
        JsonNode coords = geometry.path("coordinates");
        if (coords.isArray()) {
            for (JsonNode pt : coords) {
                double lng = pt.get(0).asDouble();
                double lat = pt.get(1).asDouble();
                result.add(new double[]{lat, lng});
            }
        }
        return result;
    }

    // Inner helper class
    private static class RouteCandidate {
        List<double[]> coordinates;
        double crimeScore;
        double distanceMeters;
        int durationMinutes;

        RouteCandidate(List<double[]> c, double s, double d, int dur) {
            coordinates = c; crimeScore = s; distanceMeters = d; durationMinutes = dur;
        }
    }
}
