package com.saferoute.repository;

import com.saferoute.model.CrimeZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrimeZoneRepository extends JpaRepository<CrimeZone, Long> {

    List<CrimeZone> findByCrimeLevel(String crimeLevel);

    // Find all HIGH and MEDIUM zones — used for safe routing avoidance
    @Query("SELECT c FROM CrimeZone c WHERE c.crimeLevel IN ('HIGH', 'MEDIUM') ORDER BY c.crimeWeight DESC")
    List<CrimeZone> findHighRiskZones();
}
