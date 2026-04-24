package com.saferoute.config;

import com.saferoute.model.CrimeZone;
import com.saferoute.repository.CrimeZoneRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * DataLoader runs AFTER Spring JPA creates the crime_zone table.
 * This avoids the H2/MySQL "table not found" crash from data.sql.
 * Only seeds if the table is empty — safe to restart without duplicates.
 */
@Component
public class DataLoader implements CommandLineRunner {

    private final CrimeZoneRepository repository;

    public DataLoader(CrimeZoneRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            System.out.println("✓ Crime zones already seeded — skipping.");
            return;
        }

        List<CrimeZone> zones = List.of(
                new CrimeZone("Rajwada Old City",   22.7196, 75.8577, 700.0, "HIGH",   4.0, "High density market area, frequent theft and chain snatching"),
                new CrimeZone("Siyaganj Market",    22.7233, 75.8798, 550.0, "HIGH",   4.0, "Busy wholesale market, pickpocketing hotspot"),
                new CrimeZone("Malharganj",         22.6916, 75.8762, 750.0, "HIGH",   4.5, "Old residential area, reported assault and robbery cases"),
                new CrimeZone("Sangam Nagar",       22.6780, 75.8590, 580.0, "HIGH",   4.0, "Reported vandalism and property crimes"),
                new CrimeZone("Banganga Area",      22.7050, 75.8720, 480.0, "HIGH",   3.5, "Vehicle theft hotspot"),
                new CrimeZone("Scheme 54 Junction", 22.7376, 75.8824, 480.0, "MEDIUM", 2.5, "Traffic crime and minor theft"),
                new CrimeZone("Vijay Nagar Chowk",  22.7526, 75.9014, 520.0, "MEDIUM", 2.5, "Night-time incidents near commercial area"),
                new CrimeZone("Khajrana Circle",    22.7104, 75.8661, 440.0, "MEDIUM", 2.0, "Moderate crime, vehicle theft reported"),
                new CrimeZone("Sudama Nagar",       22.7450, 75.8650, 390.0, "MEDIUM", 2.0, "Residential area, occasional burglary"),
                new CrimeZone("Azad Nagar",         22.7300, 75.8500, 350.0, "MEDIUM", 2.0, "Mixed zone, moderate incidents"),
                new CrimeZone("Tejaji Nagar",       22.6900, 75.8650, 400.0, "MEDIUM", 2.5, "Outer area, reported thefts"),
                new CrimeZone("Loha Mandi",         22.7150, 75.8800, 420.0, "MEDIUM", 2.0, "Industrial zone, occasional incidents"),
                new CrimeZone("Palasia",            22.7318, 75.8441, 360.0, "LOW",    1.0, "Upscale area, low crime"),
                new CrimeZone("Nipania",            22.7580, 75.8810, 420.0, "LOW",    1.0, "New development, safe zone"),
                new CrimeZone("Kanadiya Road",      22.7050, 75.8900, 320.0, "LOW",    1.0, "Mostly safe residential"),
                new CrimeZone("Bhawarkua",          22.7650, 75.8450, 300.0, "LOW",    1.0, "Safe area, limited incidents"),
                new CrimeZone("LIG Colony",         22.7200, 75.8700, 350.0, "LOW",    1.2, "Residential, generally safe"),
                new CrimeZone("MR-10 Bypass",       22.7480, 75.8290, 380.0, "LOW",    1.0, "Highway area, safe corridor"),
                new CrimeZone("Super Corridor",     22.7750, 75.9100, 300.0, "LOW",    0.8, "IT Hub area, very safe"),
                new CrimeZone("AB Road Dewas Naka", 22.7040, 75.8340, 410.0, "MEDIUM", 2.0, "Busy transit point, moderate risk")
        );

        repository.saveAll(zones);
        System.out.println("✓ Seeded " + zones.size() + " Indore crime zones into MySQL.");
    }
}
