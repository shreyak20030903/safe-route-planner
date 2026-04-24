package com.saferoute.service;

import com.saferoute.model.CrimeZone;
import com.saferoute.repository.CrimeZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CrimeZoneService {

    private final CrimeZoneRepository crimeZoneRepository;

    public List<CrimeZone> getAllZones() {
        return crimeZoneRepository.findAll();
    }

    public List<CrimeZone> getHighRiskZones() {
        return crimeZoneRepository.findHighRiskZones();
    }

    /**
     * Calculate total crime score for a route defined by its coordinates.
     * For each point in the route, checks if it falls inside any crime zone radius.
     * Returns a score: higher = more dangerous route.
     */
    public double scoreCrimeForRoute(List<double[]> coordinates) {
        if (coordinates == null || coordinates.isEmpty()) return 0;

        List<CrimeZone> allZones = crimeZoneRepository.findAll();
        double totalScore = 0.0;

        for (double[] point : coordinates) {
            double lat = point[0];
            double lng = point[1];
            for (CrimeZone zone : allZones) {
                double distanceMeters = haversineMeters(lat, lng, zone.getLatitude(), zone.getLongitude());
                if (distanceMeters < zone.getRadiusMeters() * 1.5) {
                    // Weighted by proximity — closer = higher score
                    double proximityFactor = 1.0 - (distanceMeters / (zone.getRadiusMeters() * 1.5));
                    totalScore += zone.getCrimeWeight() * proximityFactor;
                }
            }
        }
        return totalScore / coordinates.size();
    }

    /**
     * Convert raw crime score to a 0–100 safety percentage.
     * Score 0 → 100% safe, Score 5+ → 0% safe
     */
    public int toSafetyPercent(double rawScore) {
        return (int) Math.max(0, Math.min(100, 100 - (rawScore * 18)));
    }

    /**
     * Haversine formula — distance between two lat/lng points in meters.
     */
    public static double haversineMeters(double lat1, double lng1, double lat2, double lng2) {
        final double R = 6371000; // Earth radius in meters
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
