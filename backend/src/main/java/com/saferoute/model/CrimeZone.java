package com.saferoute.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "crime_zone")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CrimeZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "radius_meters", nullable = false)
    private Double radiusMeters;

    // HIGH, MEDIUM, LOW
    @Column(name = "crime_level", nullable = false)
    private String crimeLevel;

    // Numeric weight: HIGH=4.0, MEDIUM=2.0, LOW=1.0
    @Column(name = "crime_weight", nullable = false)
    private Double crimeWeight;

    @Column(length = 500)
    private String description;


    public CrimeZone(String name, double latitude, double longitude,
                     double radiusMeters, String crimeLevel,
                     double crimeWeight, String description) {

        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.radiusMeters = radiusMeters;
        this.crimeLevel = crimeLevel;
        this.crimeWeight = crimeWeight;
        this.description = description;
    }
}
